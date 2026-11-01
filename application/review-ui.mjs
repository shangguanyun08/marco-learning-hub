import {fullAnswer,compactDraft,validAnnotation} from './review-model.mjs?v=20261101-v2';
import {flatten} from './sync-model.mjs?v=20261101-v2';
import {comparisonRows} from './comparison-notes.mjs?v=20261101-v2';
import {changeParagraphs} from './change-highlights.mjs?v=20261031-highlights1';

export function createReviewUI(o){
 const {esc}=o;
 let drawing=false,drag=null,pending=null;
 const state=()=>o.getState();
 const question=()=>o.getQuestion();
 const annotations=()=>Object.values(state().annotations||{}).filter(a=>a&&a.question===question().q);
 const sideLabel=(side,version=state().comparisonVersion)=>side==='original'?"Counselor's original":side==='suggested'?`ChatGPT · Version ${version==='v1'?'1':'2'}`:'My working draft';
 const reference=side=>side==='revision'?fullAnswer(state(),question()):question().paragraphs.map(p=>p[side==='original'?'original':'suggested']).filter(Boolean).join('\n\n');
 function toggle(on=!drawing){drawing=on;document.body.classList.toggle('annotate-active',on);document.querySelector('#annotation-toolbar').hidden=!on;document.querySelector('[data-action="annotate"]').setAttribute('aria-pressed',String(on));}
 function marks(side,paragraphId=''){return `<svg class="annotation-layer" data-annotation-layer="${side}" data-paragraph-id="${esc(paragraphId)}" aria-label="Select a rectangular area of the ${sideLabel(side)}" xmlns="http://www.w3.org/2000/svg"></svg>`;}
 function renderComparison(q){
  const suggestedText=p=>changeParagraphs(p.original,p.suggested).map(parts=>`<p>${parts.map(s=>s.changed?`<mark class="suggested-change" title="Added or reworded from the counselor's original">${esc(s.text)}</mark>`:esc(s.text)).join('')}</p>`).join('');
  const passage=(p,side)=>`<section class="editor-card ${side==='suggested'?'yours':''}"><div class="card-top"><h4 class="card-label">${side==='original'?"Counselor's original":sideLabel('suggested')}</h4></div><div class="card-body"><div class="annotation-target" data-annotation-target="${side}" data-paragraph-id="${esc(p.id)}"><div class="original-text answer-original ${side==='suggested'?'suggested-answer':''}">${p[side]?side==='suggested'?suggestedText(p):p.original.split(/\n\s*\n/).map(t=>`<p>${esc(t)}</p>`).join(''):'<span class="omitted-passage">No corresponding passage in this version.</span>'}</div>${marks(side,p.id)}</div></div><div class="card-footer"><span>${o.words(p[side]||'')} words</span><button class="quiet" data-action="note-${side}" data-note-paragraph="${esc(p.id)}" aria-label="Add a note to ${sideLabel(side)}, paragraph ${p.index+1}">Add a note</button></div></section>`;
  return `<div class="paragraph-comparison"><p class="comparison-intro">Matching passages stay together in each row. The explanations describe the visible edits and their effect; they do not resolve facts that still need checking. The counselor’s original stays unchanged. Version 1 remains available in the version selector.</p><p class="change-legend"><mark class="suggested-change" aria-hidden="true">Aa</mark><span>Added or reworded text is highlighted and underlined in the selected ChatGPT version. Omitted wording stays visible in the counselor’s original.</span></p>${comparisonRows(q).map((p,i)=>`<section class="comparison-row" data-comparison-paragraph="${esc(p.id)}" aria-labelledby="compare-${esc(p.id)}"><h3 id="compare-${esc(p.id)}" class="comparison-row-heading"><span>Paragraph ${i+1}</span>${esc(p.title)}</h3>${passage(p,'original')}${passage(p,'suggested')}<aside class="comparison-reason" aria-label="Explanation for paragraph ${i+1}"><h4>My comments &amp; feedback</h4><ul>${p.notes.map(([label,text,url])=>`<li><strong>${esc(label)}</strong><p>${esc(text)}${url?` <a href="${esc(url)}" target="_blank" rel="noopener">School source ↗</a>`:''}</p></li>`).join('')}</ul></aside></section>`).join('')}<div class="comparison-actions"><span>${o.words(q.paragraphs.map(p=>p.original).join(' '))} counselor words · ${o.words(q.paragraphs.map(p=>p.suggested).join(' '))} revision words</span><button class="button secondary" data-action="copy-suggestion">Copy suggested answer ↗</button><button class="button secondary" data-action="question-suggestion">Use suggested answer as my draft</button></div></div>`;
 }
 function renderAnswer(){
  const q=question(),draft=state().comparisonMode==='draft',side=draft?'revision':'suggested',text=reference(side),ready=q.paragraphs.every(p=>state().edits[p.id].status==='ready');
  if(!draft)return renderComparison(q);
  return `<div class="editor-pair whole-answer"><section class="editor-card"><div class="card-top"><div class="card-label"><span class="original-tag"></span>Counselor's original</div><span class="original-meta">Complete answer · read only</span></div><div class="card-body"><div class="annotation-target" data-annotation-target="original"><div class="original-text answer-original">${q.paragraphs.map(p=>`<p>${esc(p.original)}</p>`).join('')}</div>${marks('original')}</div></div><div class="card-footer"><span>${o.words(reference('original'))} words · purple Draft 2</span><button class="quiet" data-action="note-original">Add a note</button></div></section><section class="editor-card yours"><div class="card-top"><div class="card-label">${draft?'My working draft':'Selected ChatGPT version'}</div>${draft?`<select class="status-select ${ready?'ready':'editing'}" data-question-status aria-label="Status for this answer"><option value="editing" ${!ready?'selected':''}>Editing</option><option value="ready" ${ready?'selected':''}>Ready ✓</option></select>`:'<span class="original-meta">Earlier editorial revision · read only</span>'}</div><div class="card-body"><div class="annotation-target" data-annotation-target="${side}">${draft?`<textarea class="edit-input whole-input" data-answer-edit aria-label="Your complete answer to question ${q.q}" maxlength="60000" spellcheck="true">${esc(text)}</textarea>`:`<div class="original-text answer-original suggested-answer">${q.paragraphs.map(p=>p.suggested).filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join('')}</div>`}${marks(side)}</div><div class="edit-tools">${draft?'<button data-action="note-revision">Add a note to selected text</button>':'<button data-action="note-suggested">Add a note</button>'}<button data-action="question-suggestion">Use suggested answer as my draft</button></div></div><div class="card-footer"><span id="whole-word-count">${o.words(text)} words</span><button class="quiet" data-action="${draft?'copy-question':'copy-suggestion'}">Copy answer ↗</button></div></section></div>`;
 }
 function renderNotes(){const list=annotations();return `<section class="context-card annotation-notes"><h3 class="context-title">Revision notes <span>${list.length} for this question</span></h3><p class="context-description">Choose Annotate, drag a rectangle over either answer, and write what you would like changed. Notes can refer to the counselor’s answer, the selected ChatGPT version, or your own working draft.</p>${list.length?list.map((a,i)=>`<article class="annotation-note ${a.status==='done'?'resolved':''}" id="note-${esc(a.id)}"><div class="annotation-note-heading"><strong><span class="note-number">${i+1}</span> ${sideLabel(a.side,a.suggestionVersion||'v1')}</strong><button class="quiet" data-annotation-open="${esc(a.id)}">View selection &amp; reference</button></div>${a.quote?`<blockquote>${esc(a.quote)}</blockquote>`:''}<textarea class="family-note" data-annotation-note="${esc(a.id)}" maxlength="12000" aria-label="Revision note ${i+1}">${esc(a.note)}</textarea><div class="annotation-note-actions"><button class="quiet" data-annotation-status="${esc(a.id)}">${a.status==='done'?'Reopen note':'Mark addressed'}</button><button class="quiet" data-annotation-delete="${esc(a.id)}">Remove note</button><span>${a.status==='done'?'Addressed':'Included with Submit feedback'}</span></div></article>`).join(''):'<div class="empty-notes">Your selections and comments will appear here.</div>'}</section><details class="context-card legacy-notes"><summary>Earlier paragraph comments</summary><p class="context-description">Your previous notes are kept with this answer.</p>${question().paragraphs.map((p,i)=>`<label class="legacy-note-label">Earlier paragraph ${i+1}<textarea class="family-note" data-note="${p.id}" maxlength="12000">${esc(state().edits[p.id].note)}</textarea></label>`).join('')}</details>`;}
 function paint(){
  document.querySelectorAll('[data-annotation-layer]').forEach(svg=>{
   const side=svg.dataset.annotationLayer,paragraphId=svg.dataset.paragraphId||'',box=svg.getBoundingClientRect();
   svg.setAttribute('viewBox',`0 0 ${box.width||1} ${box.height||1}`);
   svg.innerHTML=annotations().map((a,i)=>{
    if(a.side!==side||(a.paragraphId||'')!==paragraphId||!a.rect||a.reference!==reference(side)||a.targetWidth&&Math.abs(a.targetWidth-box.width)>5)return '';
    const r=a.rect,x=r.x*box.width,y=r.y*box.height,w=r.w*box.width,h=r.h*box.height;
    return `<g class="saved-region ${a.status==='done'?'resolved':''}" data-annotation-open="${esc(a.id)}" role="button" tabindex="0" aria-label="Open revision note ${i+1}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/><circle cx="${x+9}" cy="${y+9}" r="12"/><text x="${x+9}" y="${y+13}">${i+1}</text></g>`;
   }).join('');
  });
 }
 function quoteInRect(side,rect,box,target){
  const input=target.querySelector('textarea')||target.querySelector('.original-text'),style=getComputedStyle(input);
  if(!input.matches('textarea')){
   // Read actual rendered positions, including paragraph spacing and aligned rows.
   const selected=[],paragraphs=[...input.querySelectorAll('p')];
   for(const paragraph of paragraphs.length?paragraphs:[input]){
    // A word can span mark/text nodes. Build ranges from paragraph offsets so
    // highlights never merge words or insert spaces before punctuation in quotes.
    const walker=document.createTreeWalker(paragraph,NodeFilter.SHOW_TEXT),nodes=[];let node,offset=0;
    while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.textContent.length});offset+=node.textContent.length;}
    for(const token of paragraph.textContent.matchAll(/\S+/g)){
     const start=token.index,end=start+token[0].length,first=nodes.find(n=>n.end>start),last=nodes.find(n=>n.end>=end);
     const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,end-last.start);
     if([...range.getClientRects()].some(b=>b.right>rect.left&&b.left<rect.right&&b.bottom>rect.top&&b.top<rect.bottom))selected.push(token[0]);
    }
   }
   return selected.join(' ').slice(0,2000);
  }
  const mirror=document.createElement('div');mirror.className='annotation-mirror';
  Object.assign(mirror.style,{position:'fixed',left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,fontFamily:style.fontFamily,fontSize:style.fontSize,lineHeight:style.lineHeight,letterSpacing:style.letterSpacing,whiteSpace:'pre-wrap',overflowWrap:'anywhere',visibility:'hidden',pointerEvents:'none'});
  const text=reference(side);for(const token of text.match(/\S+|\s+/g)||[]){const span=document.createElement('span');span.textContent=token;mirror.append(span);}document.body.append(mirror);
  const selected=[...mirror.children].filter(span=>[...span.getClientRects()].some(b=>b.right>rect.left&&b.left<rect.right&&b.bottom>rect.top&&b.top<rect.bottom)).map(s=>s.textContent).join('').trim();mirror.remove();return selected.slice(0,2000);
 }
 function editNote(annotation){pending=structuredClone(annotation);o.openModal('SELECT & COMMENT','What should change here?',`<p class="modal-lead">Question ${annotation.question} · ${sideLabel(annotation.side,annotation.suggestionVersion||'v1')}. This note and its saved text reference will be included when you submit feedback.</p><label class="feedback-label" for="annotation-quote">Text reference</label><textarea id="annotation-quote" class="family-note" maxlength="2000" placeholder="Optional: quote the words you mean">${esc(annotation.quote)}</textarea><label class="feedback-label" for="annotation-note">Your modification note</label><textarea id="annotation-note" class="family-note" maxlength="12000" placeholder="For example: Shorten this story and keep the final sentence.">${esc(annotation.note)}</textarea><div class="confirm-actions"><button class="button secondary" data-action="cancel-annotation">Cancel</button><button class="button primary" data-action="save-annotation">Save note</button></div>`);document.querySelector('#annotation-note').focus();}
 function addTextNote(side,paragraphId){const el=document.querySelector('[data-answer-edit]'),quote=side==='revision'?el.value.slice(el.selectionStart,el.selectionEnd).slice(0,2000):'';toggle(false);editNote({id:crypto.randomUUID(),question:question().q,side,...(side==='suggested'?{suggestionVersion:state().comparisonVersion}:{}),...(paragraphId?{paragraphId}:{}),reference:reference(side),quote,note:'',status:'open',rect:null,createdAt:new Date().toISOString()});}
 document.addEventListener('pointerdown',event=>{
  const svg=event.target.closest('[data-annotation-layer]');if(!drawing||!svg)return;
  event.preventDefault();const box=svg.getBoundingClientRect();drag={svg,side:svg.dataset.annotationLayer,paragraphId:svg.dataset.paragraphId,target:svg.closest('[data-annotation-target]'),box,start:{x:event.clientX,y:event.clientY},pointer:event.pointerId};svg.setPointerCapture(event.pointerId);
 });
 document.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.pointer)return;event.preventDefault();const {svg,box,start}=drag,x=Math.max(box.left,Math.min(event.clientX,box.right)),y=Math.max(box.top,Math.min(event.clientY,box.bottom));
  svg.querySelector('.pending-region')?.remove();svg.insertAdjacentHTML('beforeend',`<rect class="pending-region" x="${Math.min(start.x,x)-box.left}" y="${Math.min(start.y,y)-box.top}" width="${Math.abs(x-start.x)}" height="${Math.abs(y-start.y)}"/>`);
 });
 document.addEventListener('pointerup',event=>{
  if(!drag||event.pointerId!==drag.pointer)return;event.preventDefault();const {side,paragraphId,target,box,start}=drag,x=Math.max(box.left,Math.min(event.clientX,box.right)),y=Math.max(box.top,Math.min(event.clientY,box.bottom));drag=null;
  if(Math.abs(x-start.x)<12||Math.abs(y-start.y)<12){paint();o.toast('Drag across an area to draw your rectangle.');return;}
  const rect={left:Math.min(start.x,x),right:Math.max(start.x,x),top:Math.min(start.y,y),bottom:Math.max(start.y,y)};
  toggle(false);editNote({id:crypto.randomUUID(),question:question().q,side,...(side==='suggested'?{suggestionVersion:state().comparisonVersion}:{}),...(paragraphId?{paragraphId}:{}),note:'',status:'open',createdAt:new Date().toISOString(),reference:reference(side),quote:quoteInRect(side,rect,box,target),targetWidth:box.width,rect:{x:(rect.left-box.left)/box.width,y:(rect.top-box.top)/box.height,w:(rect.right-rect.left)/box.width,h:(rect.bottom-rect.top)/box.height}});
 });
 document.addEventListener('pointercancel',()=>{drag=null;paint();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){drag=null;pending=null;toggle(false);paint();}if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-annotation-open]')){event.preventDefault();viewNote(event.target.dataset.annotationOpen);}});
 document.addEventListener('input',event=>{const id=event.target.dataset.annotationNote;if(id&&state().annotations[id]){state().annotations[id].note=event.target.value;o.save();}});
 document.addEventListener('click',event=>{
  const el=event.target.closest('button,[data-annotation-open]');if(!el)return;
  if(el.dataset.annotationOpen){viewNote(el.dataset.annotationOpen);return;}
  if(el.dataset.annotationStatus){const a=state().annotations[el.dataset.annotationStatus];a.status=a.status==='done'?'open':'done';o.save();o.render();return;}
  if(el.dataset.annotationDelete){const id=el.dataset.annotationDelete,old=state().annotations[id];state().annotations[id]=null;o.save();o.render();o.openModal('NOTE REMOVED','Revision note removed',`<p class="modal-lead">You can restore this note now if you removed it by mistake.</p><button class="button secondary" data-action="undo-remove-note">Undo removal</button>`);pending=old;return;}
  switch(el.dataset.action){
   case'annotate':toggle();break;
   case'stop-annotation':toggle(false);paint();break;
   case'note-original':addTextNote('original',el.dataset.noteParagraph);break;
   case'note-suggested':addTextNote('suggested',el.dataset.noteParagraph);break;
   case'note-revision':addTextNote('revision');break;
   case'close-modal':pending=null;paint();break;
   case'cancel-annotation':pending=null;document.querySelector('#modal').close();paint();break;
   case'save-annotation':if(pending){const note=document.querySelector('#annotation-note');if(!note.value.trim()){note.setCustomValidity('Write your modification note first.');note.reportValidity();note.oninput=()=>note.setCustomValidity('');return;}pending.note=note.value;pending.quote=document.querySelector('#annotation-quote').value;if(!validAnnotation(pending))return;state().annotations[pending.id]=pending;pending=null;o.save();document.querySelector('#modal').close();o.render();o.toast('Rectangle and note saved. Use Submit feedback when ready.');}break;
   case'undo-remove-note':if(pending){state().annotations[pending.id]=pending;pending=null;o.save();document.querySelector('#modal').close();o.render();}break;
   case'versions':showVersions();break;
   case'save-version':saveNamedVersion();break;
  }
  if(el.dataset.versionPreview)previewVersion(el.dataset.versionPreview);
  if(el.dataset.versionRestore)restoreVersion(el.dataset.versionRestore);
 });
 function viewNote(id){const a=state().annotations[id];if(!a)return;if(a.side==='suggested'){state().comparisonVersion=a.suggestionVersion||'v1';o.render();}if(a.side!=='original'||a.paragraphId&&state().comparisonMode==='draft'){state().comparisonMode=a.side==='revision'?'draft':'suggested';o.render();}const target=[...document.querySelectorAll(`[data-annotation-target="${a.side}"]`)].find(el=>(el.dataset.paragraphId||'')===(a.paragraphId||'')),box=target?.getBoundingClientRect(),changed=a.reference!==reference(a.side)||a.rect&&!target||a.targetWidth&&box&&Math.abs(a.targetWidth-box.width)>5;editNote(a);if(changed)document.querySelector('#modal-content').insertAdjacentHTML('afterbegin','<p class="reference-changed">The text or layout has changed since this rectangle was drawn. Your original text reference is preserved below.</p>');}
 function addVersion(label,id=crypto.randomUUID()){
  if(state().versions[id])return state().versions[id];const v={id,label:label.slice(0,100),createdAt:new Date().toISOString(),draft:compactDraft(state(),o.byId)};
  const projected=flatten({...state(),versions:{...state().versions,[id]:v}});
  if(JSON.stringify(v).length>590000||JSON.stringify(projected).length+Object.keys(projected).length*150>650000)throw new Error('Online version storage is full. Download a working copy from Export & print to keep an extra copy.');state().versions[id]=v;o.save();return v;
 }
 function ensureInitialVersion(){try{addVersion('Starting version before the question editor','before-question-editor');}catch(error){o.toast(error.message);}}
 function showVersions(message=''){
  const list=Object.values(state().versions||{}).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  o.openModal('YOUR SAVED WORDING','Version history',`<p class="modal-lead">Keep a named copy of all five answers, comments, selections, and review choices. Your current draft continues to autosave.</p><label class="feedback-label" for="version-label">Name this version</label><div class="version-save-row"><input id="version-label" maxlength="100" placeholder="For example: Mom’s edits · first review"><button class="button primary" data-action="save-version">Save my version</button></div><p id="version-save-status" class="small-note" role="status">${esc(message)}</p><div class="version-list">${list.map(v=>`<article class="version-row"><div><strong>${esc(v.label)}</strong><small>${esc(new Date(v.createdAt).toLocaleString())}</small></div><button class="button secondary small" data-version-preview="${esc(v.id)}">Open version</button></article>`).join('')||'<p class="empty-notes">Your saved versions will appear here.</p>'}</div>`);
 }
 async function saveNamedVersion(){const button=document.querySelector('[data-action="save-version"]');button.disabled=true;let created=false;try{addVersion(document.querySelector('#version-label').value.trim()||`My version · ${new Date().toLocaleString()}`);created=true;await o.flush();showVersions(o.online()?'Version saved online.':'Version saved on this device.');}catch(error){showVersions(created?`Saved on this device; online save has not been confirmed. ${error.message}`:error.message);}}
 function previewVersion(id){const v=state().versions[id];if(!v)return;const draft=o.expandDraft(v.draft);o.openModal('SAVED VERSION',v.label,`<p class="small-note">${esc(new Date(v.createdAt).toLocaleString())} · Read only</p><div class="version-preview">${o.questions.map(q=>`<section><h3>Question ${q.q} · ${esc(q.title)}</h3><p>${esc(fullAnswer(draft,q))}</p></section>`).join('')}</div><p class="small-note">${Object.values(v.draft.annotations||{}).filter(Boolean).length} revision notes saved with this version.</p><div class="confirm-actions"><button class="button secondary" data-action="versions">Back to versions</button><button class="button primary" data-version-restore="${esc(id)}">Restore this version</button></div>`);}
 async function restoreVersion(id){const v=state().versions[id];if(!v)return;try{addVersion(`Before restoring “${v.label}”`);o.restoreDraft(v.draft);o.save();o.render();await o.flush();document.querySelector('#modal').close();o.toast(o.online()?'Version restored and saved online. Your previous draft is in Versions.':'Version restored on this device. Your previous draft is in Versions.');}catch(error){o.toast(`Your copy is on this device. ${error.message}`);}}
 const observer=new ResizeObserver(()=>paint());
 function afterRender(){observer.disconnect();document.querySelectorAll('[data-annotation-target]').forEach(el=>observer.observe(el));paint();}
 return {renderComparison,renderAnswer,renderNotes,afterRender,paint,ensureInitialVersion,addVersion,busy:()=>drawing||!!drag||!!pending,stop:()=>{toggle(false);drag=null;pending=null;}};
}

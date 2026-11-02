import {createCloud} from './cloud-sync.mjs?v=20261101-v2sync2';
import {applyFields} from './sync-model.mjs?v=20261101-v2sync2';
import {setAnswer,validAnnotation,validVersion} from './review-model.mjs?v=20261101-v2sync2';
import {createReviewUI} from './review-ui.mjs?v=20261101-version-buttons';
import {comparisonQuestion} from './revision-v2.mjs?v=20261101-v2sync2';
'use strict';
const DATA=JSON.parse(document.getElementById('application-data').textContent);
const STORAGE_KEY='marco-application-family-editor-v1';
const byId=new Map(DATA.questions.flatMap(q=>q.paragraphs.map(p=>[p.id,p])));
const $=selector=>document.querySelector(selector);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words=text=>(text.trim().match(/\S+/g)||[]).length;
const validStatuses=['review','editing','ready'];
let cloud=null,reviewUI=null,feedbackRecord=null,submitting=false;
let saveFailed=false,toastTimer,confirmCallback=null;
let state=loadState(),reviewFilter='current';
state.comparisonVersion='v2';state.comparisonMode='suggested';

function blankState(){return {schema:1,source:DATA.source,question:1,paragraph:0,view:'answer',comparisonMode:'suggested',comparisonVersion:'v2',introDismissed:false,edits:Object.fromEntries([...byId].map(([id,p])=>[id,{text:p.original,note:'',status:'review'}])),reviews:{},annotations:{},versions:{},submissionNote:'',updatedAt:null};}
function validateState(value){
  if(!value||value.schema!==1||value.source!==DATA.source||!value.edits||typeof value.edits!=='object')throw new Error('This working copy is not for Marco\'s current application.');
  const clean=blankState();
  for(const [id] of byId){const edit=value.edits[id];if(!edit||typeof edit.text!=='string'||edit.text.length>60000||typeof edit.note!=='string'||edit.note.length>12000||!validStatuses.includes(edit.status))throw new Error('The working copy is incomplete or has invalid paragraph data.');clean.edits[id]={text:edit.text,note:edit.note,status:edit.status};}
  for(const section of DATA.reviews)for(const item of section.items){const found=value.reviews?.[item.id];if(found){if(!['agree','disagree',''].includes(found.choice)||typeof found.note!=='string'||found.note.length>12000)throw new Error('The working copy has invalid review choices.');clean.reviews[item.id]={choice:found.choice,note:found.note};}}
  clean.question=DATA.questions.some(q=>q.q===value.question)?value.question:1;
  const q=DATA.questions.find(q=>q.q===clean.question);
  clean.paragraph=Number.isInteger(value.paragraph)&&value.paragraph>=0&&value.paragraph<q.paragraphs.length?value.paragraph:0;
  clean.comparisonVersion=value.comparisonVersion==='v1'?'v1':'v2';
  clean.view='answer';clean.comparisonMode=value.comparisonMode==='draft'?'draft':'suggested';clean.introDismissed=!!value.introDismissed;clean.updatedAt=typeof value.updatedAt==='string'?value.updatedAt:null;
  clean.submissionNote=typeof value.submissionNote==='string'?value.submissionNote.slice(0,12000):'';
  for(const [id,a] of Object.entries(value.annotations||{})){if(!validAnnotation(a)||a&&a.id!==id)throw new Error('The working copy has an invalid revision note.');clean.annotations[id]=a;}
  for(const [id,v] of Object.entries(value.versions||{})){if(!validVersion(v)||v.id!==id||v.draft.source!==DATA.source)throw new Error('The working copy has an invalid saved version.');clean.versions[id]=v;}
  return clean;
}
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?validateState(JSON.parse(raw)):blankState();}catch(error){saveFailed=true;return blankState();}}
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));saveFailed=false;}catch(error){saveFailed=true;setSaveStatus('offline','Device backup unavailable · keep this page open');}cloud?.capture(state);}
function setSaveStatus(kind,text){const el=$('#save-status');el.classList.toggle('failed',kind==='offline');el.innerHTML='<span class="save-dot"></span>'+esc(text);}
function showFeedback(){openModal('SEND YOUR COMMENTS','What should I change?',`<p class="modal-lead">Select an area in either the counselor’s answer or the selected ChatGPT version and add your modification note. Your separate working draft is included too. Submit whenever you want me to revise it.</p><label class="feedback-label" for="submission-note">Instructions for this revision</label><textarea id="submission-note" class="family-note" data-submission-note maxlength="12000" placeholder="For example: Use the suggested version for Question 1, keep the counselor’s final sentence, and apply my annotation notes.">${esc(state.submissionNote)}</textarea><p class="small-note">Includes all five working drafts, annotation notes from both comparison versions with saved text references, earlier paragraph comments, and your 34 review decisions. Your original stays available on the left. Feedback is checked about every 15 minutes while the scheduled review can run.</p><div id="submission-result" role="status"></div><button class="button primary feedback-send" data-action="send-feedback">Submit feedback →</button>`);}
function renderReceipt(){
 const submissions=Object.values(feedbackRecord?.submissions||{}).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),latest=submissions[0],el=$('#feedback-receipt');
 if(!latest){el.hidden=true;return;}const response=feedbackRecord.responses[latest.id];el.hidden=false;
 el.innerHTML=response?`<div><strong>Revision ready</strong><p>${esc(response.summary)}</p>${response.held?.length?'<p>Some wording changed after submission. Your newer draft is preserved; open revision notes to read the proposed alternatives.</p>':''}</div><button class="button secondary small" data-action="response">Read revision notes ↗</button>`:`<div><strong>Feedback submitted</strong><p>${esc(new Date(latest.createdAt).toLocaleString())} · Saved for the next review. You can keep editing.</p></div><button class="quiet" data-action="feedback">Add more feedback ↗</button>`;
}
function showResponse(){const latest=Object.values(feedbackRecord?.responses||{}).sort((a,b)=>b.completedAt.localeCompare(a.completedAt))[0];if(!latest)return;openModal('YOUR FEEDBACK · REVISION','Revision notes',`<p class="modal-lead">${esc(latest.summary)}</p><p class="response-details">${esc(latest.details)}</p><p>Updated in your draft: ${esc((latest.applied||[]).join(', ')||'No paragraph changes')}.</p>${latest.held?.length?`<p>Newer edits kept: ${esc(latest.held.join(', '))}. Your current wording is preserved.</p>${latest.held.map(id=>`<details><summary>Proposed wording · ${esc(id)}</summary><p class="response-details">${esc(latest.proposedEdits?.[id]||'')}</p></details>`).join('')}`:''}<p class="small-note">Read the revised answers, adjust anything you want, and submit another round of feedback if needed.</p>`);}
async function sendFeedback(){
 if(submitting)return;submitting=true;const button=document.querySelector('[data-action="send-feedback"]');button.disabled=true;button.textContent='Submitting…';
 try{reviewUI.addVersion('Submitted for revision · '+new Date().toLocaleString());const submission=await cloud.submit(state.submissionNote);const target=$('#submission-result');if(target)target.innerHTML=`<p class="submission-success">✓ Submitted successfully · ${esc(new Date(submission.createdAt).toLocaleString())}<br>Receipt ${esc(submission.id.slice(0,8))}. Your draft and comments are saved for revision.</p>`;button.textContent='Submitted ✓';}
 catch(error){const target=$('#submission-result');if(target)target.innerHTML=`<p class="submission-error">Not submitted. ${esc(error.message)} Your changes remain on this device; retry when connected.</p>`;button.disabled=false;button.textContent='Retry submission →';}
 finally{submitting=false;}
}

function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function currentQuestion(){return comparisonQuestion(DATA.questions.find(q=>q.q===state.question),state.comparisonVersion);}
function updateNavigation(){
 const ready=DATA.questions.filter(q=>q.paragraphs.every(p=>state.edits[p.id].status==='ready')).length;
 $('#questions').innerHTML=DATA.questions.map(q=>{const done=q.paragraphs.every(p=>state.edits[p.id].status==='ready');return `<button class="question-nav ${q.q===state.question?'active':''}" data-question="${q.q}" ${q.q===state.question?'aria-current="page"':''}><span class="nav-number">0${q.q}</span><span class="nav-title">${esc(q.short)}<span class="nav-meta">${done?'Ready ✓':'Complete answer'}</span></span></button>`;}).join('');
 $('#sidebar-progress').textContent=`${ready} / 5 ready`;$('#overall-bar').style.width=`${ready/5*100}%`;$('#overall-copy').textContent=ready===5?'All five answers are ready for a final read.':'One question at a time. Your wording and notes save as you work.';
 $('#review-count').textContent=`${Object.values(state.reviews).filter(r=>r.choice).length}/34`;
}
function render(){
 const q=currentQuestion();updateNavigation();$('#question-kicker').textContent=`QUESTION 0${q.q} / 05`;$('#question-title').textContent=q.title;$('#question-prompt').textContent=q.prompt;$('#work-note').hidden=state.introDismissed;
 document.querySelectorAll('[data-comparison-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.comparisonMode===state.comparisonMode&&(!b.dataset.comparisonVersion||b.dataset.comparisonVersion===state.comparisonVersion))));
 $('#paragraph-nav').innerHTML=`<span class="whole-answer-label">${state.comparisonMode==='draft'?'ONE QUESTION · YOUR COMPLETE DRAFT':'ONE QUESTION · ALIGNED PARAGRAPHS'}</span><span class="paragraph-count" id="question-word-count">${questionWordLabel()}</span>`;
 $('#editor-area').innerHTML=reviewUI.renderAnswer();document.querySelectorAll('.edit-input').forEach(resize);$('#context-section').innerHTML=reviewUI.renderNotes();updateBottom();reviewUI.afterRender();
}
function questionWordLabel(){const q=currentQuestion(),draft=state.comparisonMode==='draft';return `${words(q.paragraphs.map(p=>p.original).join(' '))} original → ${words(q.paragraphs.map(p=>draft?state.edits[p.id].text:p.suggested).join(' '))} ${draft?'draft':state.comparisonVersion==='v1'?'version 1':'version 2'} words`;}
function resize(el){el.style.height='auto';el.style.height=Math.max(190,el.scrollHeight+4)+'px';}
function updateBottom(){$('#previous').disabled=state.question===1;$('#position-label').textContent=`Question ${state.question} of 5`;$('#ready-next').textContent=state.comparisonMode!=='draft'?(state.question===5?'Review & submit feedback →':'Next question →'):(state.question===5?'Mark ready & finish ✓':'Mark answer ready & next →');}
function navigate(q){reviewUI.stop();state.question=q;state.paragraph=0;state.view='answer';save();render();window.scrollTo({top:0,behavior:'instant'});}
function move(delta){const next=state.question+delta;if(next>=1&&next<=5)navigate(next);}
function openModal(kicker,title,html){$('#modal-kicker').textContent=kicker;$('#modal-title').textContent=title;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function confirmDialog(title,description,fn,button='Continue'){confirmCallback=fn;openModal('CHECK BEFORE REPLACING',title,`<p class="modal-lead">${esc(description)}</p><div class="confirm-actions"><button class="button secondary" data-action="close-modal">Cancel</button><button class="button primary" data-action="confirm">${esc(button)}</button></div>`);}
function help(){openModal('YOUR FAMILY EDITING DESK','Read, select, revise',`<ol class="steps"><li><strong>Read one complete question.</strong> The counselor’s original is on the left, the highlighted ChatGPT version is in the middle, and my comments are on the right. Use the Version 2 and Version 1 buttons above the answer. You can annotate both. Open My working draft when you want to edit your own wording.</li><li><strong>Box the area you want changed.</strong> Choose Annotate, drag across an area of either answer, then add your note. On a keyboard, select words in your answer and choose Add a note.</li><li><strong>Keep your versions.</strong> Open Versions and choose Save my version before a new round of edits. You can read or restore any saved copy; restoring also keeps your current draft.</li><li><strong>Submit feedback.</strong> Your five answers, selections, notes, earlier paragraph comments, and review decisions are sent for revision. Keep editing while you wait.</li></ol><div class="help-callout">Wait for <strong>Saved online</strong> before switching devices. Selections retain their original text reference if the wording or layout changes.</div>`);}
function showExport(){openModal('SAVE, SHARE, OR PRINT','Take your work with you',`<p class="modal-lead">Download your draft for the counselor, keep a working backup, or print a copy to review together.</p><div class="export-grid"><a class="export-tile" href="./counselor.html"><strong>↗ Counselor copy of Version 2</strong><span>Read all five answers together with highlighted revisions, 5 main changes, and copy and print buttons.</span></a><button class="export-tile" data-action="download-text"><strong>↓ Revised answers (.txt)</strong><span>All five answers in order, with your current wording. Ready to copy into the application.</span></button><button class="export-tile" data-action="backup"><strong>↓ Working copy (.json)</strong><span>All answers, selections, notes, saved versions, and review decisions. Import to continue on another device.</span></button><button class="export-tile" data-action="print-clean"><strong>↗ Print revised answers</strong><span>A clean copy of all five answers. Choose Save as PDF in your browser to make a PDF.</span></button><button class="export-tile" data-action="print-comparison"><strong>↗ Print side-by-side</strong><span>Print the complete answers shown in your current comparison view.</span></button></div><div class="export-divider"><div class="export-bottom"><div><strong style="font-size:12px">Continue from a working copy</strong><p class="small-note">Import replaces this browser's draft after confirmation.<br>Download a backup first if you want to keep both versions.</p></div><button class="button secondary" data-action="import">Import working copy ↗</button></div></div><p class="small-note">Your draft saves online. Download a working copy whenever you want an extra backup.</p>`);}
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);toast('Download prepared.');}
function dateStamp(){return new Date().toISOString().slice(0,10);}
function exportBackup(){save();download(JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),`Marco-application-working-copy-${dateStamp()}.json`,'application/json');}
function answerText(q){return q.paragraphs.map(p=>state.edits[p.id].text.trim()).filter(Boolean).join('\n\n');}
function exportText(){const text='MARCO - SAGE HILL PARENT STATEMENTS\n\n'+DATA.questions.map(q=>`QUESTION ${q.q}: ${q.prompt}\n\n${answerText(q)}`).join('\n\n\n');download(text,`Marco-application-revised-${dateStamp()}.txt`,'text/plain;charset=utf-8');}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied to clipboard.');}catch{openModal('COPY TEXT','Select and copy',`<p class="modal-lead">Clipboard access is unavailable in this browser. Select the text below and copy it.</p><textarea class="family-note" style="min-height:220px" readonly aria-label="Text to copy">${esc(text)}</textarea>`);}}
function printDocument(mode){
 $('#modal').close();
 const label=state.comparisonVersion==='v1'?'Version 1':'Version 2';
 $('#print-root').innerHTML='<h1>Marco | Sage Hill application</h1><p class="print-subtitle">'+esc(new Date().toLocaleDateString())+' · '+(mode==='comparison'&&state.comparisonMode!=='draft'?label+' · Counselor / ChatGPT / feedback':'Family working draft')+'</p>'+DATA.questions.map(source=>{
  const q=comparisonQuestion(source,state.comparisonVersion);
  return `<section class="print-question"><h2>Question ${q.q}: ${esc(q.title)}</h2><p class="print-prompt">${esc(q.prompt)}</p>${mode==='comparison'?(state.comparisonMode==='draft'?`<table><thead><tr><th>Counselor's original</th><th>My working draft</th></tr></thead><tbody><tr><td>${esc(q.paragraphs.map(p=>p.original).join('\n\n'))}</td><td>${esc(answerText(q))}</td></tr></tbody></table>`:reviewUI.renderComparison(q)):q.paragraphs.filter(p=>state.edits[p.id].text.trim()).map(p=>`<p>${esc(state.edits[p.id].text.trim())}</p>`).join('')}</section>`;
 }).join('');window.print();
}

function showChecklist(filter='current'){reviewFilter=filter;renderChecklist();}
function renderChecklist(){const sections=reviewFilter==='all'?DATA.reviews:DATA.reviews.filter(s=>s.n===(reviewFilter==='overall'?6:state.question));openModal('FAMILY EDITORIAL DECISIONS','Agree, discuss, decide',`<p class="modal-lead">These are recommendations from the review. Choose what works for your family. Decisions and notes save online and are included when you submit feedback.</p><div class="review-filter"><button data-review-filter="current" class="${reviewFilter==='current'?'active':''}">Question ${state.question}</button><button data-review-filter="overall" class="${reviewFilter==='overall'?'active':''}">Whole application</button><button data-review-filter="all" class="${reviewFilter==='all'?'active':''}">All 34 points</button></div>${sections.map(section=>`<h3 class="review-question">${section.n===6?'Whole application':`Question ${section.n}`} · ${esc(section.title)}</h3>${section.items.map(i=>{const saved=state.reviews[i.id]||{choice:'',note:''};return `<article class="review-item"><h3>${i.id} · ${esc(i.title)}</h3><p>${esc(i.text)}</p><div class="review-choices" role="group" aria-label="Decision for review ${i.id}">${[['agree','Agree'],['disagree','Do not agree'],['','Undecided']].map(([choice,label])=>`<button class="${saved.choice===choice?'selected':''}" data-review="${i.id}" data-choice="${choice}" aria-pressed="${saved.choice===choice}">${label}</button>`).join('')}</div><input class="review-note" data-review-note="${i.id}" aria-label="Note for review ${i.id}" value="${esc(saved.note)}" placeholder="Reason, wording preference, or fact to confirm…"></article>`;}).join('')}`).join('')}`);}

document.addEventListener('input',event=>{
  const el=event.target;
  if(el.matches('[data-answer-edit]')){setAnswer(state,currentQuestion(),el.value);save();resize(el);$('#whole-word-count').textContent=`${words(el.value)} words`;$('#question-word-count').textContent=questionWordLabel();document.querySelector('[data-question-status]').value='editing';updateNavigation();reviewUI.paint();}
  if(el.matches('[data-submission-note]')){state.submissionNote=el.value;save();}
  if(el.matches('[data-note]')){state.edits[el.dataset.note].note=el.value;save();}
  if(el.matches('[data-review-note]')){const id=el.dataset.reviewNote;state.reviews[id]={...(state.reviews[id]||{choice:''}),note:el.value};save();}
});
document.addEventListener('change',event=>{const el=event.target;if(el.matches('[data-question-status]')){currentQuestion().paragraphs.forEach(p=>state.edits[p.id].status=el.value);save();updateNavigation();}if(el.matches('[data-status]')){state.edits[el.dataset.status].status=el.value;save();render();}});
document.addEventListener('click',event=>{
  const el=event.target.closest('button,a.brand');if(!el)return;
  if(el.matches('a.brand')){event.preventDefault();navigate(1);return;}
  if(el.dataset.comparisonMode){reviewUI.stop();state.comparisonMode=el.dataset.comparisonMode;if(el.dataset.comparisonVersion)state.comparisonVersion=el.dataset.comparisonVersion;save();render();return;}
  if(el.dataset.question){const q=DATA.questions.find(q=>q.q===Number(el.dataset.question));navigate(q.q);return;}
  if(el.dataset.reviewFilter){showChecklist(el.dataset.reviewFilter);return;}
  if(el.dataset.review){const id=el.dataset.review;state.reviews[id]={...(state.reviews[id]||{note:''}),choice:el.dataset.choice};save();updateNavigation();const group=el.closest('.review-choices');group.querySelectorAll('button').forEach(b=>{const selected=b.dataset.choice===el.dataset.choice;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected);});return;}
  const action=el.dataset.action;if(!action)return;
  switch(action){
    case'feedback':showFeedback();break;case'send-feedback':sendFeedback();break;case'response':showResponse();break;case'sync':cloud.flush().then(()=>toast('Draft synced.')).catch(()=>toast('Saved on this device. Retry when online.'));break;case'help':help();break;case'export':showExport();break;case'checklist':showChecklist();break;
    case'dismiss-intro':state.introDismissed=true;save();$('#work-note').hidden=true;break;
    case'previous':move(-1);break;
    case'ready-next':if(state.comparisonMode==='draft'){currentQuestion().paragraphs.forEach(p=>state.edits[p.id].status='ready');save();}if(state.question<5)navigate(state.question+1);else if(state.comparisonMode==='draft'){render();showExport();}else showFeedback();break;
    case'close-modal':$('#modal').close();confirmCallback=null;break;
    case'confirm':{const fn=confirmCallback;$('#modal').close();confirmCallback=null;if(fn)fn();break;}
    case'backup':exportBackup();break;case'download-text':exportText();break;case'import':$('#import-file').click();break;
    case'print-clean':printDocument('clean');break;case'print-comparison':printDocument('comparison');break;
    case'copy-question':copy(answerText(currentQuestion()));break;
    case'copy-suggestion':copy(currentQuestion().paragraphs.map(p=>p.suggested).filter(Boolean).join('\n\n'));break;
    case'question-suggestion':confirmDialog('Use the suggested answer?','Your current version will be kept in Versions before the suggestion replaces this answer.',()=>{try{reviewUI.addVersion('Before using suggested answer');setAnswer(state,currentQuestion(),currentQuestion().paragraphs.map(p=>p.suggested).filter(Boolean).join('\n\n'));state.comparisonMode='draft';save();render();toast('Suggested answer added. Your earlier wording is in Versions.');}catch(error){toast(error.message);}},'Use suggested answer');break;
  }
});
$('#import-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;if(file.size>2000000){toast('This file is too large to be a working copy.');return;}try{const imported=validateState(JSON.parse(await file.text()));confirmDialog('Import this working copy?','This will replace the current browser draft, including notes and review decisions. Download the current working copy first if you want to keep it.',()=>{try{reviewUI.addVersion('Before importing a working copy');const previous=state;state=imported;state.versions={...imported.versions,...previous.versions};state.annotations={...Object.fromEntries(Object.keys(previous.annotations).map(id=>[id,null])),...imported.annotations};save();render();toast('Working copy imported. Your previous draft is in Versions.');}catch(error){toast(error.message);}},'Import working copy');}catch(error){toast(error.message||'Could not read this working copy.');}});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();save();toast(saveFailed?'Autosave unavailable. Download a working copy.':'Your changes are saved; check the online status above.');}});
window.addEventListener('beforeunload',event=>{if(saveFailed){event.preventDefault();event.returnValue='';}});
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY&&event.newValue){toast('Another tab saved a draft. Export this copy before reloading if both have changes.');}});
if(saveFailed){$('#save-status').classList.add('failed');$('#save-status').innerHTML='<span class="save-dot"></span> Check saved draft · download a backup';}
const onlineEnabled=location.protocol==='https:'&&!['localhost','127.0.0.1'].includes(location.hostname)&&!new URLSearchParams(location.search).has('demo');
function expandDraft(draft){const blank=blankState();return validateState({...blank,...draft,question:state.question,edits:{...blank.edits,...draft.edits}});}
reviewUI=createReviewUI({getState:()=>state,getQuestion:currentQuestion,byId,questions:DATA.questions,esc,words,save,render,toast,openModal,expandDraft,restoreDraft:draft=>{const restored=expandDraft(draft);restored.comparisonMode='draft';restored.versions=state.versions;restored.annotations={...Object.fromEntries(Object.keys(state.annotations).map(id=>[id,null])),...restored.annotations};state=restored;},flush:()=>cloud.flush(),online:()=>onlineEnabled});
render();
cloud=createCloud({enabled:onlineEnabled,getState:()=>state,blankState,canApply:()=>!document.activeElement?.matches('textarea,input,select')&&!$('#modal').open&&!reviewUI.busy(),onFields:fields=>{const next=applyFields(state,fields);if(JSON.stringify(next)===JSON.stringify(state))return;state=next;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}render();},onStatus:(kind,text)=>{setSaveStatus(kind,text);if(kind==='live')reviewUI.ensureInitialVersion();},onFeedback:record=>{feedbackRecord=record;renderReceipt();if(!document.activeElement?.matches('textarea,input,select')&&!$('#modal').open&&!reviewUI.busy())render();}});
if(!onlineEnabled)reviewUI.ensureInitialVersion();

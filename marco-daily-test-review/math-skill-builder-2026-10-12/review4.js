(function(){
  'use strict';
  const D=window.MarcoReview4Data,E=window.MarcoReview4Engine,S=window.MarcoReview4Sync,$=s=>document.querySelector(s);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=n=>String(Number(n.toFixed(4)));
  const demo=new URLSearchParams(location.search).has('demo'),local=['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:'||demo,KEY=S.APP_ID+(demo?':demo':'');
  let state=E.empty(),sync=null,storageOK=true,ready=local,status=local?'Preview · Saved on this device only. Live progress is untouched.':'Connecting to live online sync…',kind=local?'preview':'connecting';
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(E.valid(saved))state=E.merge(state,saved);}catch{storageOK=false;}
  const selected=new Map();
  function table(t){return `<div class="table-wrap"><table>${t.caption?`<caption>${esc(t.caption)}</caption>`:''}<thead><tr>${t.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((x,i)=>i===0?`<th scope="row">${esc(x)}</th>`:`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  function graph(g,label){
    const W=480,H=315,L=55,R=22,T=32,B=48,w=W-L-R,h=H-T-B,px=x=>L+(x-g.xmin)/(g.xmax-g.xmin)*w,py=y=>T+h-(y-g.ymin)/(g.ymax-g.ymin)*h;
    let svg=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label||'Coordinate graph with labelled axes')}"><title>${esc(label||'Coordinate graph')}</title><rect x="${L}" y="${T}" width="${w}" height="${h}" fill="white"/>`;
    const ticks=(min,max)=>{const raw=(max-min)/5,power=10**Math.floor(Math.log10(raw)),unit=[1,2,5,10].find(x=>x*power>=raw),step=unit*power,values=[];for(let x=Math.ceil(min/step)*step;x<=max+step*1e-8;x+=step)values.push(x);return values;};
    for(const x of ticks(g.xmin,g.xmax))svg+=`<path d="M ${px(x)} ${T} V ${T+h}" fill="none" stroke="#e4e9ef"/><text x="${px(x)}" y="${T+h+22}" text-anchor="middle">${num(x)}</text>`;
    for(const y of ticks(g.ymin,g.ymax))svg+=`<path d="M ${L} ${py(y)} H ${L+w}" fill="none" stroke="#e4e9ef"/><text x="${L-9}" y="${py(y)+4}" text-anchor="end">${num(y)}</text>`;
    const xaxis=g.ymin<=0&&g.ymax>=0?py(0):T+h,yaxis=g.xmin<=0&&g.xmax>=0?px(0):L;svg+=`<path d="M ${L} ${xaxis} H ${L+w} M ${yaxis} ${T} V ${T+h}" stroke="#526b7e" fill="none"/><text x="${W-12}" y="${T+h+22}">x</text><text x="${L-4}" y="20">y</text>`;
    for(const line of g.lines){const pts=[];for(let i=0;i<=150;i++){const x=g.xmin+(g.xmax-g.xmin)*i/150,y=line.m*x+line.b;if(y>=g.ymin&&y<=g.ymax)pts.push(`${px(x)},${py(y)}`);}svg+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${line.color}" stroke-width="3"/>`;}
    for(const [x,y]of g.points||[]){svg+=`<circle cx="${px(x)}" cy="${py(y)}" r="4" fill="#173957"/><text x="${px(x)+9}" y="${py(y)-8}">(${num(x)}, ${num(y)})</text>`;}
    if(g.cropped)svg+='<text x="240" y="306" text-anchor="middle">Cropped view · axes do not begin at zero</text>';
    return svg+'</svg>';
  }
  function series(s){const L=48,T=30,w=390,h=210,max=Math.ceil(Math.max(...s.lines.flatMap(x=>x.values))/10)*10;let svg=`<svg class="plot" viewBox="0 0 480 310" role="img" aria-label="Temperature comparison graph"><title>${esc(s.title||'Temperatures for Town A and Town B')}</title>`;
    for(let i=0;i<=5;i++){const y=T+h-h*i/5;svg+=`<path d="M ${L} ${y} H ${L+w}" stroke="#e4e9ef"/><text x="${L-8}" y="${y+4}" text-anchor="end">${num(max*i/5)}</text>`;}
    s.labels.forEach((x,i)=>{svg+=`<text x="${L+w*i/(s.labels.length-1)}" y="${T+h+22}" text-anchor="middle">${esc(x)}</text>`;});
    s.lines.forEach((line,k)=>{const pts=line.values.map((y,i)=>[L+w*i/(s.labels.length-1),T+h-y/max*h]);svg+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${line.color}" stroke-width="3"/>`;pts.forEach(([x,y])=>{svg+=k?`<rect x="${x-4}" y="${y-4}" width="8" height="8" fill="${line.color}"/>`:`<circle cx="${x}" cy="${y}" r="4" fill="${line.color}"/>`;});svg+=`<text x="${70+k*200}" y="292" style="fill:${line.color}">${k?'■':'●'} ${esc(line.name)}</text>`;});return svg+'</svg>';}
  function transformationDiagram(g){
    const L=65,T=30,size=336,unit=size/12,px=x=>L+(x+5)*unit,py=y=>T+(7-y)*unit;
    const describe=(pts,prime)=>pts.map(([x,y],i)=>`${'ABC'[i]}${prime?'′':''} (${x}, ${y})`).join('; '),label=`Original triangle: ${describe(g.points,false)}. Image triangle: ${describe(g.imagePoints,true)}.`;
    let svg=`<svg class="plot transformation-plot" viewBox="0 0 480 425" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><rect x="${L}" y="${T}" width="${size}" height="${size}" fill="white"/>`;
    for(let n=-5;n<=7;n++)svg+=`<path d="M ${px(n)} ${T} V ${T+size} M ${L} ${py(n)} H ${L+size}" fill="none" stroke="#e4e9ef"/><text x="${px(n)}" y="${T+size+20}" text-anchor="middle">${n}</text><text x="${L-10}" y="${py(n)+4}" text-anchor="end">${n}</text>`;
    svg+=`<path d="M ${L} ${py(0)} H ${L+size} M ${px(0)} ${T} V ${T+size}" fill="none" stroke="#526b7e" stroke-width="1.5"/><text x="${L+size+12}" y="${py(0)+4}">x</text><text x="${px(0)-4}" y="18">y</text>`;
    for(const [k,pts]of [g.points,g.imagePoints].entries()){
      const color=k?'#b3593a':'#146a76',cx=pts.reduce((s,p)=>s+p[0],0)/3,cy=pts.reduce((s,p)=>s+p[1],0)/3;
      svg+=`<polygon points="${pts.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="2.5" ${k?'stroke-dasharray="7 4"':''}/>`;
      for(const [i,[x,y]]of pts.entries())svg+=`<circle cx="${px(x)}" cy="${py(y)}" r="3" fill="${color}"/><text x="${px(x)+(x<cx?-9:9)}" y="${py(y)+(y<cy?17:-9)}" text-anchor="${x<cx?'end':'start'}" style="fill:${color};font-weight:700;paint-order:stroke;stroke:white;stroke-width:3px">${'ABC'[i]}${k?'′':''}</text>`;
    }
    return svg+'<text x="80" y="413" style="fill:#146a76">ABC · original (solid)</text><text x="260" y="413" style="fill:#b3593a">A′B′C′ · image (dashed)</text></svg>';
  }
  function netDiagram(){return '<svg class="plot" viewBox="0 0 360 320" role="img" aria-label="A net with one square and a triangle on each of its four sides"><title>Net with one square and four triangles</title><path d="M130 110 L180 25 L230 110 L320 160 L230 210 L180 295 L130 210 L40 160 Z" fill="#eaf2ef" stroke="#146a76" stroke-width="2.5"/><path d="M130 110 H230 V210 H130 Z" fill="#d6e9e6" stroke="#146a76" stroke-width="2.5" stroke-dasharray="6 4"/></svg>';}
  function scoreLabel(s){return s.complete?`${s.first}/4 = ${s.first*25}%<small>${s.passed?'✓ 4/4 first try':'Below 4/4 · recheck this skill'}</small>`:`${s.first}/${s.answered} right<small>${s.answered}/4 done · first try</small>`;}
  function result(s){return !s.complete?'pending':s.passed?'passed':'needs-practice';}
  function question(q,index){
    const attempts=E.attempts(state,q.id),first=attempts[0],reveal=E.firstPass(state,q.concept),done=attempts.some(a=>a.correct),waiting=!!first&&!reveal;
    const choice=selected.get(q.id)??attempts.at(-1)?.choice;
    const feedback=waiting?'First answer saved. Answer the other questions in this subtopic to see the result.':done?(first.correct?'Correct on the first try.':'Corrected. Your first-try score is unchanged.'):first?'Not quite. Try another answer; your first-try score stays fixed.':'Choose one answer, then record it.';
    return `<article class="attempt" id="q-${q.id}"><p class="question-number">Question ${index+1} of 4<span class="first-result">${waiting?'Recorded':reveal&&first?(first.correct?'First try: correct':'First try: missed'):''}</span></p><div class="past-question"><p class="question-prompt">${esc(q.prompt)}</p>${q.diagram==='square-pyramid-net'?netDiagram():''}${q.table?table(q.table):''}${q.graph?graph(q.graph):''}${q.series?series(q.series):''}${q.transformation?transformationDiagram(q.transformation):''}${q.columns?`<div class="comparison"><div><b>Column A</b><p>${esc(q.columns[0])}</p></div><div><b>Column B</b><p>${esc(q.columns[1])}</p></div></div>`:''}<form class="question-form" data-question="${q.id}"><fieldset><legend>${waiting||done?'Recorded answer':'Choose one answer'}</legend>${q.choices.map((text,j)=>`<label class="option${reveal&&attempts.some(a=>a.choice===j)?j===q.correct?' correct':' wrong':''}"><input type="radio" name="${q.id}" value="${j}" ${choice===j?'checked':''} ${!ready||waiting||done||attempts.some(a=>a.choice===j)?'disabled':''}><span class="review-choice-label">${'ABCD'[j]}</span><span class="option-content">${esc(text)}${q.choiceGraphs?graph(q.choiceGraphs[j],text):''}</span></label>`).join('')}</fieldset>${!waiting&&!done?`<button type="submit" ${!ready?'disabled':''}>${first?'Check retry':'Record first answer'}</button>`:''}<p class="feedback" role="status">${esc(feedback)}</p></form>${reveal&&first?`<p class="first-answer ${first.correct?'right':'wrong'}"><b>First answer:</b> ${'ABCD'[first.choice]} · ${esc(q.choices[first.choice])}</p><details class="answer-reveal"><summary><span class="show-label">Show correct answer & method</span><span class="hide-label">Hide correct answer & method</span></summary><p class="correct-key"><b>${'ABCD'[q.correct]} · ${esc(q.choices[q.correct])}</b><br>${esc(q.explanation)}</p></details>`:''}</div></article>`;
  }
  function saveNote(){const node=$('#sync-note');node.textContent=storageOK?status:'Device storage unavailable. Keep this page open and download review results.';node.dataset.kind=storageOK?kind:'offline';}
  function save(upload=true){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}saveNote();if(upload)void sync?.push();}
  function render(){
    const open=new Set([...document.querySelectorAll('details.record[open]')].map(e=>e.id));
    const reveals=new Set([...document.querySelectorAll('.answer-reveal[open]')].map(e=>e.closest('.attempt').id));
    const groups=D.topics.flatMap(t=>t.subtopics),passed=groups.filter(([id])=>E.stats(state,id).passed).length,complete=groups.filter(([id])=>E.stats(state,id).complete).length,total=E.stats(state);
    $('#overall').innerHTML=`<div><strong>${passed}/${groups.length}</strong><span>Subtopics with 4/4 first-try correct</span></div><div><b>${total.first} right out of ${total.answered} done${total.answered?` · ${Math.round(total.first/total.answered*100)}%`:''}</b><span>First try · ${total.answered}/${total.total} questions answered · ${complete}/${groups.length} subtopics checked</span></div>`;
    $('#overview').innerHTML=`<table><thead><tr><th scope="col">Topic</th><th scope="col">Subtopics with 4/4</th></tr></thead><tbody>${D.topics.map(t=>`<tr><th scope="row"><a href="#skill-${t.id}">${esc(t.name)}</a></th><td><b>${t.subtopics.filter(([id])=>E.stats(state,id).passed).length}/${t.subtopics.length}</b></td></tr>`).join('')}</tbody></table>`;
    $('#topics').innerHTML=D.topics.map(t=>`<section id="skill-${t.id}"><header class="section-head"><h2>${esc(t.name)}</h2><strong>${t.subtopics.filter(([id])=>E.stats(state,id).passed).length}/${t.subtopics.length} targets met</strong></header><div class="stat-header"><span>Subtopic · 4 similar questions</span><span>First-try result</span></div>${t.subtopics.map(([id,name])=>{const st=E.stats(state,id),source=D.source.scores[id];return `<details class="record" id="${id}" data-result="${result(st)}" ${open.has(id)?'open':''}><summary class="stat-row"><span class="topic">${esc(name)}<small style="white-space:normal">${esc(source.label||'Review 3')}: ${source.first}/${source.answered} = ${Math.round(source.first/source.answered*100)}%</small><span class="fold-control"><span class="fold-open">＋ Open 4 questions</span><span class="fold-close">− Collapse questions</span></span></span><strong class="score" data-result="${result(st)}">${scoreLabel(st)}</strong></summary><div class="record-body">${E.ids(id).map((qid,i)=>question(D.questions[qid],i)).join('')}</div></details>`;}).join('')}</section>`).join('');
    for(const id of reveals){const toggle=document.getElementById(id)?.querySelector('.answer-reveal');if(toggle)toggle.open=true;}
    saveNote();
  }
  function redraw(){const y=window.scrollY;render();window.scrollTo(0,y);}
  document.addEventListener('change',event=>{const input=event.target;if(input.matches('.question-form input[type="radio"]')&&!input.disabled)selected.set(input.name,Number(input.value));});
  document.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('.question-form'))return;event.preventDefault();if(!ready)return;
    const input=form.querySelector('input:checked:not(:disabled)');if(!input){form.querySelector('.feedback').textContent='Choose a new answer first. No attempt used.';return;}
    const id=form.dataset.question;if(E.submit(state,id,Number(input.value))){selected.delete(id);save();redraw();document.querySelector(`#q-${id} .feedback`)?.setAttribute('tabindex','-1');document.querySelector(`#q-${id} .feedback`)?.focus({preventScroll:true});}
  });
  function remote(value){state=E.merge(state,value);save(false);redraw();}
  window.addEventListener('storage',event=>{if(event.key===KEY&&event.newValue)try{const value=JSON.parse(event.newValue);if(E.valid(value)){remote(value);void sync?.push();}}catch{}});
  $('#download').onclick=()=>{const blob=new Blob([JSON.stringify({course:'Marco Math Skill Builder · Review Session 4',...state,results:D.topics.flatMap(t=>t.subtopics.map(([id,name])=>({topic:t.name,subtopic:name,...E.stats(state,id)})))},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='marco-review-session-4-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  if(demo)document.querySelectorAll('nav a').forEach(a=>{const url=new URL(a.href);url.searchParams.set('demo','1');a.href=url;});
  render();if(!local){sync=S.create({getState:()=>state,onRemote:remote,onStatus(k,t){kind=k;status=t;saveNote();}});Promise.resolve(sync.start()).finally(()=>{ready=true;redraw();});}
})();

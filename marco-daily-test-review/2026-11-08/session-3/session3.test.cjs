const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {JSDOM}=require(process.env.MARCO_QA_JSDOM||'jsdom');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
function bank(file){const c={window:{}};vm.runInNewContext(read(file),c);return c.window.MarcoMA5Practice;}
const D=bank('data.js');
function page(saved){
 const dom=new JSDOM(read('index.html'),{url:'http://127.0.0.1:8893/marco-daily-test-review/2026-11-08/session-3/?session=3#practice',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.requestAnimationFrame=fn=>{fn();return 1;};Object.defineProperty(w,'crypto',{value:crypto.webcrypto});w.fetch=()=>{throw Error('Preview must not touch live progress');};
 w.localStorage.setItem('marco-ma-nov08-test5-v1:preview','session 1 sentinel');w.localStorage.setItem('marco-ma-nov08-test5-session2-v1:preview','session 2 sentinel');
 if(saved)w.localStorage.setItem(D.appId+':preview',saved);
 for(const s of w.document.querySelectorAll('script[src]')){const f=s.getAttribute('src').split('?')[0];if(!f.includes('shared-activity-tracker'))w.eval(read(f));}
 return dom;
}
function answer(w,id,choice){const input=w.document.querySelector(`#q-${id} input[value="${choice}"]`);assert.ok(input&&!input.disabled);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));input.closest('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
test('16 fresh questions match Session 2 skills, with independent IDs, storage, and mixed groups',()=>{
 assert.equal(D.ids.length,16);assert.equal(new Set(D.ids).size,16);assert.deepEqual(Object.keys(D.skills),['charges','dependence','symmetry','direction']);assert.equal(D.groupSize,4);
 for(const skill of Object.keys(D.skills)){const qs=Array.from(D.ids,id=>D.questions[id]).filter(q=>q.skill===skill);assert.equal(qs.length,4);assert.deepEqual(qs.map(q=>q.correct).sort(),[0,1,2,3]);}
 for(let g=0;g<4;g++)assert.equal(new Set(D.ids.slice(g*4,g*4+4).map(id=>D.questions[id].skill)).size,4);
 const signature=q=>JSON.stringify([q.prompt,q.choices,q.table||null,q.diagram||null,q.graphs||null]);
 for(const old of [bank('../practice-data.js'),bank('../session-2/data.js')]){assert.notEqual(D.appId,old.appId);assert.notEqual(D.session,old.session);for(const id of D.ids){assert.ok(!old.ids.includes(id));assert.ok(!old.ids.some(oldId=>signature(old.questions[oldId])===signature(D.questions[id])));}}
 for(const id of D.ids){const q=D.questions[id];assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.tip&&q.explanation&&q.focus);}
});
test('all numeric fee and probability keys are independently calculated',()=>{
 const key=id=>D.questions[id].choices[D.questions[id].correct];
 assert.equal((24-3-8*2.25)/.75+1,5);assert.equal(key('c3-1'),'5');assert.ok(Math.abs((29.8-21.4)/3-2.8)<1e-12);assert.equal(key('c3-2'),'$2.80');
 for(const[m,p,total]of[[5,4,26],[8,1,29],[2,2,13]])assert.equal(total-m*3-(p-1)*2,5);assert.equal(key('c3-3'),'$5.00');assert.equal(15+(7-3)*2.5+2*5,35);assert.equal(key('c3-4'),'$35.00');
 assert.ok(Math.abs(5/9*4/8-5/18)<1e-12);assert.equal(key('p3-2'),'5/18');assert.equal(9/(15-1),9/14);assert.equal(key('p3-3'),'9/14');assert.equal((4-1)/(7-1),.5);assert.equal(D.questions['p3-1'].correct,0);assert.equal(D.questions['p3-4'].correct,1);
});
test('each shading answer is checked against every candidate reflection axis',()=>{
 function axes(d){const shaded=(r,c)=>d.shaded.some(p=>p[0]===r&&p[1]===c);const works=fn=>{for(let r=0;r<d.rows;r++)for(let c=0;c<d.cols;c++){const[rr,cc]=fn(r,c);if(shaded(r,c)!==shaded(rr,cc))return false;}return true;};return[works((r,c)=>[d.rows-1-r,c]),works((r,c)=>[r,d.cols-1-c]),d.rows===d.cols&&works((r,c)=>[c,r]),d.rows===d.cols&&works((r,c)=>[d.rows-1-c,d.cols-1-r])];}
 assert.deepEqual(axes(D.questions['s3-1'].diagram),[true,true,true,true]);assert.deepEqual(axes(D.questions['s3-2'].diagram),[false,false,false,true]);assert.deepEqual(axes(D.questions['s3-3'].diagram),[false,true,false,false]);assert.deepEqual(axes(D.questions['s3-4'].diagram),[false,false,false,false]);
 assert.deepEqual(['s3-1','s3-2','s3-3','s3-4'].map(id=>D.questions[id].correct),[3,2,1,0]);
});
test('slope questions honor the direction, rate, table scale, and signed change',()=>{
 const graph=Array.from(D.questions['g3-1'].graphs,(g,i)=>({m:g.m,i})).filter(g=>g.m*-1>0).sort((a,b)=>Math.abs(b.m)-Math.abs(a.m))[0];assert.equal(graph.i,D.questions['g3-1'].correct);
 const number=x=>Number(x.replace('−','-')),table=Array.from(D.questions['g3-2'].table.rows,(row,i)=>({m:(number(row[2])-number(row[1]))/6,i})).filter(g=>g.m*-1<0).sort((a,b)=>Math.abs(a.m)-Math.abs(b.m))[0];assert.equal(table.i,D.questions['g3-2'].correct);
 assert.equal(3/4*-8,-6);assert.equal(D.questions['g3-3'].choices[D.questions['g3-3'].correct],'It decreases by 6.');const eq=[-1/3,3,-2,1/3].map((m,i)=>({m,i})).filter(g=>g.m>0).sort((a,b)=>a.m-b.m)[0];assert.equal(eq.i,D.questions['g3-4'].correct);
});
test('local UI preserves first tries, second chances, completion, four-skill analysis and older records',()=>{
 const dom=page(),w=dom.window,d=w.document;try{
  assert.equal(d.querySelectorAll('#practice .question').length,16);assert.equal(d.querySelectorAll('.practice-jump .jump-group').length,4);assert.equal(d.querySelectorAll('.question-group-divider').length,3);assert.equal(d.querySelectorAll('#practice .source').length,0);assert.equal(d.querySelector('#skill-results'),null);assert.equal(d.querySelector('textarea'),null);assert.match(d.querySelector('#save-note').textContent,/Preview only/);
  answer(w,'c3-1',0);assert.match(d.querySelector('#q-c3-1 .feedback').textContent,/Try once more/);assert.equal(d.querySelector('#q-c3-1 .answer-reveal'),null);answer(w,'c3-1',1);assert.match(d.querySelector('#q-c3-1 .feedback').textContent,/Corrected on second try/);assert.ok(d.querySelector('#q-c3-1 .answer-reveal'));
  for(const id of D.ids.slice(1))answer(w,id,D.questions[id].correct);
  assert.match(d.querySelector('#skill-results h2').textContent,/15\/16/);assert.equal(d.querySelectorAll('#skill-results tbody tr').length,4);assert.ok(d.querySelector('#practice-tab').classList.contains('is-complete'));assert.match(d.querySelector('#skill-results tr[data-skill=charges] td').textContent,/3\/4/);
  d.querySelector('[data-practice-filter=wrong]').click();assert.equal(d.querySelectorAll('#practice .question').length,1);assert.ok(d.querySelector('#q-c3-1'));assert.ok(d.querySelector('.wrong-skill-group'));
  assert.equal(w.localStorage.getItem('marco-ma-nov08-test5-v1:preview'),'session 1 sentinel');assert.equal(w.localStorage.getItem('marco-ma-nov08-test5-session2-v1:preview'),'session 2 sentinel');
  const next=page(w.localStorage.getItem(D.appId+':preview'));try{assert.match(next.window.document.querySelector('#skill-results h2').textContent,/15\/16/);next.window.document.querySelector('[data-view=analysis]').click();assert.equal(next.window.document.querySelector('#analysis').hidden,false);assert.match(next.window.document.querySelector('#saved-skill-analysis h2').textContent,/15\/16/);}finally{next.window.close();}
 }finally{w.close();}
});
test('navigation and every local script/stylesheet point to existing files',()=>{
 const d=new JSDOM(read('index.html')).window.document;
 for(const el of d.querySelectorAll('a[href],script[src],link[href]')){const ref=el.getAttribute('src')||el.getAttribute('href'),p=ref.split(/[?#]/)[0];if(p&&!/^https?:/.test(p))assert.ok(fs.existsSync(path.resolve(__dirname,p)),ref);}
 for(const file of ['../index.html','../session-2/index.html']){const doc=new JSDOM(read(file)).window.document;assert.ok([...doc.querySelectorAll('.view-tabs a')].some(a=>a.textContent.includes('Session 3')));}
 assert.match(read('index.html'),/data-app-id="marco-ma-nov08-test5-session3-v1"/);assert.equal(D.downloadName,'marco-2026-11-08-session-3-skill-report.json');
});

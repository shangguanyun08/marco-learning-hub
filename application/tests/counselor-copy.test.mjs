import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {comparisonQuestion} from '../revision-v2.mjs';

const base=new URL('../',import.meta.url);
const html=await readFile(new URL('counselor.html',base),'utf8');
const script=await readFile(new URL('counselor.js',base),'utf8');
const data=JSON.parse(await readFile(new URL('data.json',base),'utf8'));
const settle=async()=>{for(let i=0;i<4;i++)await new Promise(r=>setImmediate(r));};

test('counselor copy contains the exact five Version 2 answers and 5 main changes',()=>{
 const dom=new JSDOM(html);try{
  const d=dom.window.document;
  assert.equal(d.querySelectorAll('.answer').length,5);
  assert.equal(d.querySelectorAll('#main-changes li').length,5);
  for(const q of data.questions)for(const p of comparisonQuestion(q).paragraphs){
   assert.equal([...d.querySelectorAll(`[data-essay-paragraph="${p.id}"]`)].map(el=>el.textContent).join('\n\n'),p.suggested);
  }
  assert.equal(d.querySelector('[data-essay-paragraph="q2-p2"] mark'),null);
  assert.ok(d.querySelectorAll('[data-essay-paragraph="q2-p5"] mark').length>0);
  assert.match(d.querySelector('#counselor-content').textContent,/only private middle school we are applying to/);
  assert.match(d.querySelector('#counselor-content').textContent,/first grade/);
  assert.equal(d.querySelector('#counselor-content #counselor-message'),null);
 }finally{dom.window.close();}
});

test('rich copy includes highlight HTML and all answers while plain copy and printing work separately',async()=>{
 const dom=new JSDOM(html,{runScripts:'outside-only'});try{
  const w=dom.window,d=w.document;let rich,plain,prints=0;
  Object.defineProperty(w.HTMLElement.prototype,'innerText',{get(){return this.textContent;}});
  w.Blob=Blob;w.ClipboardItem=class{constructor(items){this.items=items;}};
  Object.defineProperty(w.navigator,'clipboard',{value:{write:async items=>{rich=items;},writeText:async text=>{plain=text;}}});
  w.print=()=>prints++;w.eval(script);
  d.querySelector('#copy-all').click();await settle();
  const copied=await rich[0].items['text/html'].text();
  assert.match(copied,/background-color:#fff0a3/);
  assert.match(copied,/5 main changes/);assert.match(copied,/Question 5/);
  assert.doesNotMatch(copied,/Copy all with highlights|Copy message|Thank you for your earlier draft/);
  d.querySelector('#copy-plain').click();await settle();assert.match(plain,/Question 5/);assert.match(plain,/5 main changes/);
  d.querySelector('#copy-message').click();await settle();assert.match(plain,/Thank you for your earlier draft/);
  d.querySelector('#print-copy').click();assert.equal(prints,1);
  w.navigator.clipboard.write=async()=>{throw new Error('HTML clipboard unavailable');};
  d.querySelector('#copy-all').click();await settle();assert.match(d.querySelector('#copy-status').textContent,/plain text/);
 }finally{dom.window.close();}
});

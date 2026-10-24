// Build a self-contained HTML review from the four verified source reviews.
// --patch emits an apply_patch payload; it never writes files itself.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const here=path.dirname(fileURLToPath(import.meta.url)),read=f=>fs.readFileSync(path.join(here,f),'utf8');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=x=>JSON.parse(JSON.stringify(x)),key=x=>x.toLowerCase().trim().replace(/\s+/g,' ');
export const dates=['2026-09-27','2026-10-04','2026-10-11','2026-10-22'];
const hard=new Set(['acute (sense)','atone','begrudgingly','blight','consortiums','conviction','creed','cumbersome','embolden','feral','fluorescent','impetus','incomprehensible','industrious','laden','loathed','marshal (verb)','masquerades','meager','mediocre','militia','monotonous','mutiny','novel (adjective)','obscure','orator','paltry','parasitic','perforate','phenomena','plague','plaque','plush','prestigious','rapt','rationalize','rustic','serenades','subordinate','sullen','tonic','tramp (verb)','transom','turbulent','versatile','vocation']);
const medium=new Set(['abolish','abrupt','adjourn','affectionately','agreeable','ambassador','amble','applications (here)','assault','assured','attentive','balks','blackmail','calling','chief (adjective)','clasp','collective','communal','compassion','conceal','conceived','condemn','confront','consistent','conspiracy','correspondence','cratered','defective','dictate','disclose','dismal','distinction','diverse','duplicated','emphasize','entitle','epic','excursion','factors','fanatics','fleeting','fragrant','guardian','haiku','hearten','hearty','hectic','idle','influential','justify','lecturer','luxurious','merely','merit','meteorite','narrative','nominate','obstructions','opportunity','passive','pedestrians','perfumery','periodically','practical','pursuit','rebellion','retreat (event)','ridiculed','rival','secrecy','selfless','sentimental','spire','steeple','sterile','stingy','traits','tread (verb)','untamed','varsity','villain']);
export function sourcePages(){return dates.map((date,i)=>{
 const c={window:{}};for(const f of i===3?['data.js','review-data.js']:['data.js'])vm.runInNewContext(read(date+'/'+f),c);
 const p=c.window.MARCO_VR_REVIEW_PAGE;
 return plain(p?{...p}:{test:4,date,title:c.window.MARCO_VR_MOCK.title,questions:c.window.MARCO_ISEE_PRACTICE[0].questions,notes:c.window.MARCO_VR_REVIEW});
});}
export function vocabulary(pages=sourcePages()){
 const words=new Map();let sourceEntries=0;
 for(const p of pages)for(const q of p.questions)for(const [word,meaning]of p.notes[q.number].meanings){
  sourceEntries++;const k=key(word);let entry=words.get(k);
  if(!entry){entry={key:k,word,meanings:[],sources:[],tier:hard.has(k)?'hard':medium.has(k)?'medium':'easy'};words.set(k,entry);}
  if(!entry.meanings.includes(meaning))entry.meanings.push(meaning);
  if(!entry.sources.some(s=>s.test===p.test&&s.number===q.number))entry.sources.push({test:p.test,date:p.date,number:q.number,id:`t${p.test}-q${q.number}`});
 }
 for(const k of [...hard,...medium])if(!words.has(k))throw Error('Unknown ranked word: '+k);
 for(const k of hard)if(medium.has(k))throw Error('Overlapping word tier: '+k);
 const rank={hard:0,medium:1,easy:2};return{sourceEntries,words:[...words.values()].sort((a,b)=>rank[a.tier]-rank[b.tier]||a.word.localeCompare(b.word,'en'))};
}
function sourceCards(p){
 const dom=new JSDOM(read(p.date+'/index.html'),{url:'http://localhost/marco-vr-practice/'+p.date+'/',runScripts:'outside-only'}),w=dom.window;
 w.fetch=()=>{throw Error('Build must not access live records');};
 for(const f of p.test===4?['data.js','review-data.js','../../marco-daily-test-review/2026-10-11/engine.js','../../marco-daily-test-review/2026-10-11/sync.js','review.js']:['data.js','../review-session.js'])w.eval(read(p.date+'/'+f));
 const cards=[...w.document.querySelectorAll('article.review-question')];
 for(const card of cards){
  const number=Number(card.dataset.question),id=`t${p.test}-q${number}`;card.id=id;card.dataset.record=id;
  card.querySelector('h2').firstChild.textContent=`Test ${p.test} · Q${number}`;
  card.querySelector('h2 span').textContent=p.title;
  const button=card.querySelector('[data-toggle]'),solution=card.querySelector('.solution');button.dataset.toggle=id;solution.id='solution-'+id;button.setAttribute('aria-controls',solution.id);
  for(const a of card.querySelectorAll('a[href]'))a.href=new URL(a.getAttribute('href'),`https://shangguanyun08.github.io/marco-learning-hub/marco-vr-practice/${p.date}/`).href;
 }
 const out=cards.map(c=>c.outerHTML).join('\n');w.close();return out;
}
export function renderCombined(){
 const pages=sourcePages(),v=vocabulary(pages),labels={hard:'Harder words & senses',medium:'Medium words & senses',easy:'Easier words & phrases'};
 const css=['../marco-daily-test-review/2026-10-04/style.css','2026-10-22/style.css','2026-10-22/review.css','review-session.css','combined-review.css'].map(read).join('\n');
 const wordGroups=Object.entries(labels).map(([tier,label])=>{const words=v.words.filter(w=>w.tier===tier);return`<section class="vocabulary-group" id="words-${tier}" aria-labelledby="heading-${tier}"><h2 id="heading-${tier}">${label} <span>${words.length}</span></h2><div class="meaning-grid">${words.map(w=>`<article class="meaning-entry" data-word="${esc(w.word.toLowerCase())}" data-tier="${tier}"><h3>${esc(w.word)}</h3>${w.meanings.map(m=>`<p class="short-meaning">${esc(m)}</p>`).join('')}<p class="word-source">${w.sources.map(s=>`<a href="#${s.id}" aria-label="${esc(w.word)} in Test ${s.test}, question ${s.number}">T${s.test} · Q${s.number}</a>`).join(' · ')}</p></article>`).join('\n')}</div></section>`;}).join('\n');
 const reviews=[...pages].reverse().map(p=>`<section class="mock-section" id="test-${p.test}" aria-labelledby="test-heading-${p.test}"><header class="mock-section-head"><p class="eyebrow">PRACTICE TEST ${p.test} · ${p.questions.length} MISSED QUESTIONS</p><h2 id="test-heading-${p.test}">${esc(p.title)}</h2><p>${p.test===2||p.test===3?'Second-attempt misses only. ':''}Original wrong choices, meanings, tricks, explanations, and verified earlier real-question history.</p><a href="https://shangguanyun08.github.io/marco-learning-hub/marco-vr-practice/${p.date}/">Open this test’s separate review ↗</a></header>${sourceCards(p)}</section>`).join('\n');
 return`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#173957"><title>All Four VR Mocks · Meanings & Combined Review · Marco</title><meta name="description" content="160 short word and phrase meanings, ordered harder to easier, plus all 32 missed-question records from Marco’s four VR mock reviews."><style>${css}</style></head>
<body><main class="shell"><nav class="topnav"><a href="https://shangguanyun08.github.io/marco-learning-hub/marco-vr-practice/">← VR Practice Library</a><a href="https://shangguanyun08.github.io/marco-learning-hub/#marco-heading">Main Learning Hub</a></nav>
<header class="hero"><p class="eyebrow">MARCO · ALL FOUR VR MOCKS · ONE COMBINED SESSION</p><h1>Words, meanings<br>& mock review</h1><p class="intro">Start with the short meanings, from harder to easier. Then review the original mistakes below.</p><div class="facts"><span><b>${v.words.length}</b> words & phrases</span><span><b>${v.sourceEntries}</b> source meaning entries</span><span><b>32</b> missed-question records</span><span><b>4</b> mock tests</span><span>Unscored · Untimed</span></div><p class="review-guidance">Includes every item in the four reviews’ <b>Key words & meanings</b> boxes: question words, answer choices, and clue phrases. Repeated words share one entry; different original meanings are kept. Source links take you to the matching question below.</p><p class="sorting-note">Harder → Medium → Easier is an estimated study order for the <b>word or sense</b>, not an official ISEE grade level, the question’s difficulty, or a claim that Marco knows a word. Within each group, entries are alphabetical. No new words have been added.</p></header>
<nav class="combined-nav" aria-label="Combined session sections"><a href="#vocabulary">Short meanings</a><a href="#words-hard">Harder</a><a href="#words-medium">Medium</a><a href="#words-easy">Easier</a><a href="#all-reviews">32 original mistakes</a></nav>
<section id="vocabulary" class="vocabulary"><header class="stage-head"><p class="eyebrow">SHORT MEANINGS · HARDER → EASIER</p><h2>All mock-review words</h2><label class="word-search" for="find-word">Find a word or meaning<input id="find-word" type="search" placeholder="Search all 160 words and phrases" autocomplete="off"></label><p id="word-count" role="status">Showing all ${v.words.length} words and phrases</p></header>${wordGroups}<p id="no-matches" hidden>No matching word or meaning. Clear the search to see the full list.</p></section>
<section id="all-reviews"><header class="stage-head"><p class="eyebrow">ALL FOUR MOCKS · ORIGINAL QUESTION REVIEWS</p><h2>32 original missed questions</h2><p>Original question wording and answer choices are preserved. Tests 2 and 3 use only the second-attempt misses, as in the separate reviews. Questions retain their source difficulty labels and order within each test.</p></header><nav class="test-links" aria-label="Jump to a mock test">${[...pages].reverse().map(p=>`<a href="#test-${p.test}">Test ${p.test} · ${p.date.slice(5).replace('-','/')} · ${p.questions.length} questions</a>`).join('')}</nav><div class="review-toolbar"><span>Answers start visible · Meanings and wrong choices stay visible when hidden</span><div><button type="button" data-all="show">Show all answers</button><button type="button" data-all="hide">Hide all answers</button></div></div>${reviews}</section>
<footer><p>This single HTML file contains the complete list and all four question reviews; it also works when downloaded. No scores, attempts, checklist selections, or online progress are changed. Answer visibility is remembered on this device only. The content reflects the four existing review records, not all 160 questions from the four complete test papers.</p><a href="#vocabulary">Back to short meanings ↑</a><a href="https://shangguanyun08.github.io/marco-learning-hub/marco-vr-practice/">All VR reviews</a></footer></main><script>${read('combined-review.js')}</script></body></html>\n`;
}
if(process.argv.includes('--patch')){
 const file=path.join(here,'combined-review.html').replace(/\\/g,'/'),html=renderCombined().trimEnd();
 process.stdout.write('*** Begin Patch\n'+(fs.existsSync(file)?'*** Update File: '+file+'\n@@\n'+fs.readFileSync(file,'utf8').trimEnd().split(/\r?\n/).map(l=>'-'+l).join('\n')+'\n':'*** Add File: '+file+'\n')+html.split(/\r?\n/).map(l=>'+'+l).join('\n')+'\n*** End Patch\n');
}

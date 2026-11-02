import {readFile,writeFile} from 'node:fs/promises';
import {comparisonQuestion} from './revision-v2.mjs';
import {changeParagraphs} from './change-highlights.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=JSON.parse(await readFile(new URL('./data.json',import.meta.url),'utf8'));
const questions=data.questions.map(q=>comparisonQuestion(q,'v2'));
const changes=[
 ['Question 1 parental support','Shortened the piano and study examples to emphasize reassurance and independence; removed exam-day answer checking.'],
 ['Question 2 why Sage Hill','Focused on Marco’s creative interests and added that Sage Hill is the only private middle school we are applying to.'],
 ['Question 3 volunteering','Clarified each parent’s contribution and shortened the service examples.'],
 ['Question 4 strengths and growth','Added the first-grade taekwondo story and used measured wording about persistence, high standards, and perfectionism.'],
 ['Question 5 family relationships','Kept the grandparents story, shortened sibling disagreements, and removed the candy anecdote.']
];
const message=`Thank you for your earlier draft. We have revised the five parent statements and included the main changes at the end. Yellow highlighting marks added or reworded text; plain text retains your wording. Could you review the flow, tone, factual details, and application word or character limits? We would also appreciate your advice on whether all the colleagues’ names are needed in the “Why Sage Hill” answer. We would like to keep our family’s voice in the final version.`;
const renderPassage=p=>changeParagraphs(p.original,p.suggested).map(parts=>`<p data-essay-paragraph="${esc(p.id)}">${parts.map(part=>part.changed?`<mark style="background-color:#fff0a3;color:inherit">${esc(part.text)}</mark>`:esc(part.text)).join('')}</p>`).join('');
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Marco application Version 2 | Counselor copy</title>
<meta name="description" content="All five Sage Hill parent statements in one continuous copy, with highlighted revisions and 5 main changes for the counselor.">
<link rel="stylesheet" href="./counselor.css?v=20261101-top5"><script src="./counselor.js?v=20261101-top5" defer></script></head>
<body><header class="page-tools no-print"><div class="tools-inner"><a class="back" href="./">← Back to application</a><span class="version">VERSION 2 · COUNSELOR COPY</span><div class="actions"><button class="primary" id="copy-all">Copy all with highlights</button><button id="copy-plain">Copy plain text</button><button id="print-copy">Print / Save PDF</button></div><p class="how-to">Copy into an email or Word document, or print a PDF to send. Your essays and the 5 main changes are together below.</p><p id="copy-status" role="status" aria-live="polite"></p></div></header>
<main><article id="counselor-content"><h1>Marco’s Sage Hill application</h1><p class="subtitle">Version 2 for counselor review</p>
<p class="legend"><mark style="background-color:#fff0a3;color:inherit">Yellow highlighting</mark> marks words added or reworded from the counselor’s original. Unhighlighted essay wording is retained from the counselor. Key deletions are summarized in the changes below.</p>
<div id="complete-essays">${questions.map(q=>`<section class="answer" aria-labelledby="question-${q.q}"><h2 id="question-${q.q}">Question ${q.q} ${esc(q.title)}</h2><p class="prompt">${esc(q.prompt)}</p>${q.paragraphs.map(renderPassage).join('')}</section>`).join('\n')}</div>
<section class="changes" id="main-changes" aria-labelledby="changes-title"><h2 id="changes-title">5 main changes from the counselor’s original</h2><p class="changes-intro">The five biggest revisions are summarized below.</p><ol>${changes.map(([title,text])=>`<li><p><strong>${esc(title)}.</strong> ${esc(text)}</p></li>`).join('')}</ol></section></article>
<section class="sending-note no-print" aria-labelledby="sending-title"><h2 id="sending-title">A message you can send</h2><p id="counselor-message">${esc(message)}</p><button id="copy-message">Copy message</button></section>
<p class="footer no-print">This copy contains ChatGPT Version 2. <a href="./">Return to Version 1, the comparison, or your working draft.</a></p></main></body></html>\n`;
await writeFile(new URL('./counselor.html',import.meta.url),html);
console.log(`Built counselor copy: ${questions.length} complete answers and ${changes.length} main changes.`);


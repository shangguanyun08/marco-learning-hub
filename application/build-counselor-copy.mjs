import {readFile,writeFile} from 'node:fs/promises';
import {comparisonQuestion} from './revision-v2.mjs';
import {changeParagraphs} from './change-highlights.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=JSON.parse(await readFile(new URL('./data.json',import.meta.url),'utf8'));
const questions=data.questions.map(q=>comparisonQuestion(q,'v2'));
const changes=[
 ['Question 1 opening','We simplified the opening and made Marco’s ownership of his goals clearer. The emphasis stays on patience, practical help, and reassurance.'],
 ['Question 1 theory preparation','We shortened the theory-test account to preparation and practice. We removed the exam-day answer checking, score, and teacher reaction. This keeps the focus on parental support; it does not resolve what assistance the exam rules permitted.'],
 ['Question 1 piano recordings','We condensed the recording logistics and repeated takes while preserving the difficult piece, taking a break, and “Mom will be right here.” We also corrected the sentence fragment about the four-minute piece.'],
 ['Question 1 curiosity','We shortened the Chinese-school and World Cup examples, removing the lesson awards, extra historical figures, Dallas trip, and quiz questions. Shared reading, history, football, and personal-finance conversations still show how the family learns together.'],
 ['Question 1 conclusion','We replaced the long “whole village” sentence with concrete ways of supporting Marco while leaving him responsible for his work. The ending connects help and reassurance with independence.'],
 ['Question 2 educational fit','We replaced the emphasis on not following a STEM path and on community expectations with examples of Marco’s comics, history interests, and creative projects. We connected those interests to middle school visual art, digital art, journalism, and debate.'],
 ['Question 2 visits and cafeteria','We removed “Among all of this hype” and used more natural wording about the teachers. We kept the staff member remembering Marco and the helpful students, then shortened the cafeteria story to a brief personal detail.'],
 ['Question 2 conclusion','We added the family’s point that Sage Hill is the only private middle school they are applying to. We expanded the ending to explain the importance of these formative years and the hoped-for growth in curiosity, creativity, independent thinking, and character.'],
 ['Question 3 Jog-A-Thon','We identified Marco’s mother as the volunteer, removed the repeated “every year,” and shortened the sign-up explanation. The spare pen and lap marking remain as a concrete example of noticing where help is needed.'],
 ['Question 3 debate judging','We shortened the description of the competing students and centered the paragraph on Marco’s father’s service: judging rounds, giving his time, and offering personalized feedback.'],
 ['Question 3 family service','We tightened the rock-painting paragraph and replaced the broad promise to spread love and joy with a practical hope to contribute time. The November activity remains a plan; its tense should change only after the family has participated.'],
 ['Question 4 standards and growth','We replaced absolute claims with measured wording and used “occasionally” in the opening, as the family requested. The final paragraph names perfectionism clearly and keeps the observed progress in pausing, taking breaks, and returning to difficult work.'],
 ['Question 4 taekwondo','We added the family’s first-grade rope-activity memory to show persistence from an early age. We kept the later belt progression and medals, shortened comparisons with other children, and used a general description of the 2025 event until its official name and category are confirmed.'],
 ['Question 4 academic and creative examples','We tightened the APAAS, history booklet, comics, art, turtle-design, handmade-frog, and humor passages while keeping their specific examples. The turtle paragraph now states neutrally that the school stopped the sales; it does not invent a reason or a lesson learned.'],
 ['Question 5 family relationships','We shortened the sibling argument scene, preserved all fourteen nights with the grandparents and the calls home, and removed the teacher-and-candy anecdote. A simpler ending lets the family examples show Marco’s care for others.']
];
const message=`Thank you for your earlier draft. We have revised the five parent statements and included the main changes at the end. Yellow highlighting marks added or reworded text; plain text retains your wording. Could you review the flow, tone, factual details, and application word or character limits? We would also appreciate your advice on whether all the colleagues’ names are needed in the “Why Sage Hill” answer. We would like to keep our family’s voice in the final version.`;
const renderPassage=p=>changeParagraphs(p.original,p.suggested).map(parts=>`<p data-essay-paragraph="${esc(p.id)}">${parts.map(part=>part.changed?`<mark style="background-color:#fff0a3;color:inherit">${esc(part.text)}</mark>`:esc(part.text)).join('')}</p>`).join('');
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Marco application Version 2 | Counselor copy</title>
<meta name="description" content="All five Sage Hill parent statements in one continuous copy, with highlighted revisions and 15 main changes for the counselor.">
<link rel="stylesheet" href="./counselor.css?v=20261101-copy1"><script src="./counselor.js?v=20261101-copy1" defer></script></head>
<body><header class="page-tools no-print"><div class="tools-inner"><a class="back" href="./">← Back to application</a><span class="version">VERSION 2 · COUNSELOR COPY</span><div class="actions"><button class="primary" id="copy-all">Copy all with highlights</button><button id="copy-plain">Copy plain text</button><button id="print-copy">Print / Save PDF</button></div><p class="how-to">Copy into an email or Word document, or print a PDF to send. Your essays and the 15 main changes are together below.</p><p id="copy-status" role="status" aria-live="polite"></p></div></header>
<main><article id="counselor-content"><h1>Marco’s Sage Hill application</h1><p class="subtitle">Version 2 for counselor review</p>
<p class="legend"><mark style="background-color:#fff0a3;color:inherit">Yellow highlighting</mark> marks words added or reworded from the counselor’s original. Unhighlighted essay wording is retained from the counselor. Deleted wording is absent from the essays and described in the main changes below.</p>
<div id="complete-essays">${questions.map(q=>`<section class="answer" aria-labelledby="question-${q.q}"><h2 id="question-${q.q}">Question ${q.q} ${esc(q.title)}</h2><p class="prompt">${esc(q.prompt)}</p>${q.paragraphs.map(renderPassage).join('')}</section>`).join('\n')}</div>
<section class="changes" id="main-changes" aria-labelledby="changes-title"><h2 id="changes-title">15 main changes from the counselor’s original</h2><p class="changes-intro">These are the main revisions across the five answers. The counselor’s colleagues paragraph in Question 2 remains unchanged at the family’s request.</p><ol>${changes.map(([title,text])=>`<li><p><strong>${esc(title)}.</strong> ${esc(text)}</p></li>`).join('')}</ol></section></article>
<section class="sending-note no-print" aria-labelledby="sending-title"><h2 id="sending-title">A message you can send</h2><p id="counselor-message">${esc(message)}</p><button id="copy-message">Copy message</button></section>
<p class="footer no-print">This copy contains ChatGPT Version 2. <a href="./">Return to Version 1, the comparison, or your working draft.</a></p></main></body></html>\n`;
await writeFile(new URL('./counselor.html',import.meta.url),html);
console.log(`Built counselor copy: ${questions.length} complete answers and ${changes.length} main changes.`);


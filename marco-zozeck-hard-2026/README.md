# 2026 Zozeck Hard

331 questions across fourteen displayed sessions, presented together in one continuous session grid:

| Display | Content | Questions | Saved session key |
| --- | --- | ---: | ---: |
| 1 | Previous mistakes | 20 | 5 |
| 2 | Previous mistakes | 20 | 6 |
| 3 | Previous mistakes | 20 | 7 |
| 4 | Previous mistakes | 31 | 8 |
| 5–8 | Original hard synonym sets | 20 each | 1–4 |
| 9–12 | 2026 Mock Test · Sentence Completion | 20 each | 9–12 |
| 13–14 | Past-paper VR Test · 20 minutes | 40 each | 13–14 |

The 91 redo items comprise 38 historical second-round synonym misses, 10 recent mock synonym misses, 23 first-round misses from the 250-word course (retaining the definition-to-word task), and 20 sentence completions (15 from the July 172-item review and 5 from recent mocks). Redo sessions contain respectively 15/15/15/26 synonym or word-meaning questions and 5 completions each.

`redo-data.js` retains source labels and original question numbers. The 15 July completion numbers are 40, 45, 51, 55, 56, 57, 58, 66, 67, 71, 84, 88, 96, 97, 99. Recent completions are September 27 VR 37/38/40 and the September 24 archive 29/32. Known ambiguous completion questions are excluded. Small documented wording/option clarifications occur in the redo copy only; the source pages and original 80-item bank are unchanged. The 23 definition items retain their original definitions with fixed distractors.

Every session runs Round 1 over all of its items, then Round 2, 3, and onward over only the previous round's misses until mastered. Answer choices reshuffle deterministically by round. In untimed rounds, answers lock on first click. Results retains every finished round.

Existing original hard sessions keep their internal IDs 1–4, word IDs, answer values, question ordering, local-storage keys, and `marco-zozeck-hard-2026` online record. Their display numbers become 5–8. New redo sessions use new internal IDs 5–8. Existing `?session=1`–`4` links still open the original sets; the bare page opens the first redo session on first use. URL session parameters refer to stable saved IDs. A separate selection preference starts this new layout with redo without discarding answers. No progress migration or reset is needed.

The page now has its own `quiz-core.js` to support source-choice synonyms, definition questions, and sentence completions without changing the separate 250-word course. Shared online synchronization and activity tracking are retained.

## Sessions 9–14: source and selection

`extension-data.js` adds 160 items. IDs and source question numbers are recorded on every item. Selection is editorial judgment about vocabulary difficulty, precise word usage, distracting alternatives, and sentence logic, not an official Zozeck difficulty percentile or a prediction of Marco's score.

- Mock Test: the 403-question Sentence Completion bank in the 2026 Prediction course was read from the rendered, signed-in Zozeck question pages on September 29, 2026. This is distinct from the separate 567-question account-course capture. Eighty questions were selected, then distributed reproducibly across four sets of twenty.
- Past papers: local captures `past-syn-01.json` through `past-syn-12.json` contain 250 synonyms; `past-comp-01.json` through `past-comp-12.json` contain 230 completions. The selected forty synonyms emphasize advanced vocabulary and less familiar senses. The forty completions emphasize contrast, two-blank consistency, precise vocabulary, and plausible distractors. They were selected from the full captures, rather than merely splitting the older 50-question curated lists.
- The two VR sets have no repeated source questions between them. Each contains synonyms in positions 1–20 and completions in positions 21–40. Alternating the selected lists distributes the harder vocabulary and sentence structures across both tests. Earlier sessions may revisit some vocabulary or source questions; their content and saved IDs are preserved.
- Source options are retained. Whitespace, blank spacing, colon punctuation on synonym prompts, and a stray period in Past Paper 8 completion 19 were normalized. Original mock prompts 33, 57, 83, 99, 118, and 125 had insufficient context or awkward wording; their context was clarified while preserving the intended word and all four choices. Each stores `sourcePrompt` and `editorialNote`.
- Past Paper 12 completion 19: the earlier local curated list had answer A, `cryptic … uncertain`. The selected copy uses B, `noncommittal … confident`, because “Although” requires a contrast between noncommittal comments and knowledgeable friends' confidence. The prior key is retained in metadata; the source capture is not modified.
- New explanations are independently written; no student account information is published with the questions.

## Timed VR behavior

Sessions 13 and 14 do not start on selection. Pressing **Start 20-minute test** records a fixed deadline. Round 1 permits changing choices until submission and hides correctness and explanations. All forty questions share one twenty-minute timer. The timer continues across refreshes and navigation; a closed or suspended page finalizes an expired test when it next opens or resumes. An open page submits automatically at the deadline. Unanswered questions count as incorrect.

Submitting freezes the first-round score, records elapsed time, and creates an untimed round containing missed questions when needed. Results shows total score, both scores out of twenty, answers, and explanations. The first attempt remains saved after later rounds. Online merges keep the earliest start/deadline, merge latest drafts while unfinished, and preserve the earliest submitted snapshot against stale draft saves. Simultaneous disconnected devices can only reconcile once synchronization resumes; the timer is a browser practice timer, not a proctored server clock.

Existing saved session keys 1–8, word IDs, and local/online storage keys remain intact. Newly appended saved keys match their display numbers 9–14.

## Round 1 mistake reviews

Reviews display as **1A, 2A, 3A, 1B, 2B, 3B** with stable saved session keys **15, 17, 19, 16, 18, 20**, respectively. `review-data.js` freezes the 124 first-round missed question IDs from Sessions 1–14 as observed on October 4, 2026 (miss counts in displayed session order: 12, 16, 11, 3, 11, 9, 6, 9, 6, 4, 4, 3, 13, 17). Later corrections do not change this bank. The picker shows a completed Round 1's correct count on every session card, including the original sessions, so successive review scores can be compared even after correction rounds reach mastery.

Each A/B pair covers those same 124 questions exactly once, split into two fixed halves of 62. Every half has 45 synonyms, 1 word-meaning question, and 16 sentence completions. All three A sessions reuse the A half; all three B sessions reuse the B half. Prompts, choices, correct answers, explanations, and source metadata are copied from the existing question bank. Review-specific question IDs and session keys keep all six review histories independent of each other and of the original records. Review question order and answer choices shuffle deterministically by session and round.

Round 1 starts only after pressing **Start 31-minute test**. It permits changing answers, hides correctness, uses one persistent 1,860-second deadline for all 62 questions, and submits automatically at expiry (including on returning to an expired page). Unanswered items count as incorrect. Round 2, 3, and onward are untimed, lock each submitted answer, and repeat only the preceding round's misses until mastered. Results preserves all round scores, answers, explanations, and timed first-attempt durations. The existing 20-minute VR tests retain their original limits.

Validation: `node --test marco-zozeck-hard-2026/review.test.cjs` checks the fixed bank, six independent sessions, repeat membership, preserved content, 31-minute synchronization and expiry, correction rounds, and original VR behavior.

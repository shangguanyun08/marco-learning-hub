# 2026 Zozeck Hard: redo and original practice

171 questions across eight displayed sessions, presented together in one continuous session grid without separate redo/original headings:

| Display | Content | Questions | Saved session key |
| --- | --- | ---: | ---: |
| 1 | Previous mistakes | 20 | 5 |
| 2 | Previous mistakes | 20 | 6 |
| 3 | Previous mistakes | 20 | 7 |
| 4 | Previous mistakes | 31 | 8 |
| 5–8 | Original hard synonym sets | 20 each | 1–4 |

The 91 redo items comprise 38 historical second-round synonym misses, 10 recent mock synonym misses, 23 first-round misses from the 250-word course (retaining the definition-to-word task), and 20 sentence completions (15 from the July 172-item review and 5 from recent mocks). Redo sessions contain respectively 15/15/15/26 synonym or word-meaning questions and 5 completions each.

`redo-data.js` retains source labels and original question numbers. The 15 July completion numbers are 40, 45, 51, 55, 56, 57, 58, 66, 67, 71, 84, 88, 96, 97, 99. Recent completions are September 27 VR 37/38/40 and the September 24 archive 29/32. Known ambiguous completion questions are excluded. Small documented wording/option clarifications occur in the redo copy only; the source pages and original 80-item bank are unchanged. The 23 definition items retain their original definitions with fixed distractors.

Every session runs Round 1 over all of its items, then Round 2, 3, and onward over only the previous round's misses until mastered. Answer choices reshuffle deterministically by round. Answers lock on first click; Results retains every finished round.

Existing original hard sessions keep their internal IDs 1–4, word IDs, answer values, question ordering, local-storage keys, and `marco-zozeck-hard-2026` online record. Their display numbers become 5–8. New redo sessions use new internal IDs 5–8. Existing `?session=1`–`4` links still open the original sets; the bare page opens the first redo session on first use. URL session parameters refer to stable saved IDs. A separate selection preference starts this new layout with redo without discarding answers. No progress migration or reset is needed.

The page now has its own `quiz-core.js` to support source-choice synonyms, definition questions, and sentence completions without changing the separate 250-word course. Shared online synchronization and activity tracking are retained.

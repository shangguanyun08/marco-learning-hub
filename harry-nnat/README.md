# Harry’s selected NNAT practice

## Mistake rounds

Every original saved run is Round 1, including legacy records with no `round` field. Results offer **Round 2 with new similar questions for Round 1’s first-try mistakes**, then **Round 3 with different similar questions for Round 2’s first-try mistakes**. The main page has no extra round-chain panel. A correct same-round second try does not remove a skill from the next round. A round unlocks after every question in its parent has a checked first answer. Zero-miss parents show that nothing needs redoing; Round 3 never creates a Round 4.

`variants.js` supplies 64 original SVG questions: one Round 2 and one Round 3 variant for each of the 32 selected drills. Each keeps the missed question’s skill (for example, matching patch edges, a colour-and-turn analogy, two independent arrow rules, or transparent folds) while changing its diagram and answer choices. Stable versioned IDs regenerate the same pictures and keys across reloads and devices without storing diagrams in progress. The original ZOZECK pictures and keys stay unchanged. New similar questions are labelled separately from publisher drills. Each has five distinct choices; automated SVG parsing, rendered-image comparisons, and visual inspection check the diagrams.

Previously saved repeat rounds remain available in Practice history as “Earlier repeat”. A new similar round starts separately rather than replacing their checked answers. Only a child marked `similar-v1` is reused by the new next-round button.

New rounds append independent runs in the same session namespace, with their own empty drafts, answers, first-try scores, completion times, and frozen question list. `sourceRoot` and `sourceFirstPass` identify the exact parent even when sync renames a conflicting saved history; later optional retries do not change the relationship. Opening or syncing a page only derives availability and does not auto-create a practice round. Starting a fresh Round 1 creates a new chain while all earlier rounds remain in history. The main type cards always describe the newest Round 1, rather than accidentally treating a later review round as a new full practice. The existing all-questions-on-one-page layout remains in every round.

The hub links this course immediately after Harry’s Daily Writing. Source: the purchased ZOZECK NNAT G3–G4 course, **NNAT Drills**, not the mocks or extra-practice chapters. All 120 diagrams and visible answer keys were inspected through the already signed-in Chrome session on November 7, 2026. No answers or tests were submitted on Harry’s behalf.

The parent requested roughly the hardest 10–20%, with easier warm-ups, after a previous 35/40 mock result. The selection has **24 challenges (20% of 120), plus 4 easy and 4 medium warm-ups**. It is a balanced expert selection based on interacting rules, precision, occlusion, rotation/reflection, colour changes, and similar distractors. It is not a publisher percentile ranking; item difficulty statistics were unavailable. Later question numbers were not treated as automatically harder.

| Source section | Source count | Easy + medium warm-ups | Six selected challenges |
| --- | ---: | --- | --- |
| Pattern Completion | 45 | 3, 20 | 5, 12, 23, 25, 37, 39 |
| Reasoning by Analogy | 30 | 1, 15 | 16, 19, 22, 23, 26, 29 |
| Serial Reasoning | 21 | 1, 19 | 4, 5, 9, 12, 14, 16 |
| Spatial Visualization | 24 | 2, 17 | 5, 7, 8, 18, 19, 24 |

`data.js` contains stable IDs, original section/question numbers, source-section links, visible source answer keys, diagrams, and newly written short review explanations. Source diagrams are kept at their original resolution. Some source images contain all five numbered choices, while others supply a diagram plus five separate choice images; the UI handles both, with A–E mapped to 1–5 when numbered. Six Analogy/Serial/Spatial questions have separate images even though others in the same section use one sheet. Do not assume a uniform format or relabel the choices by image order without checking the source.

Each type shows all eight questions together on one scrollable page, with the warm-ups first. Every question has its own answer choices, checks, enlargement and explanation; selecting or checking one question leaves other drafts intact. The results button unlocks when all questions are resolved. Saved review links scroll to the requested question. A separate eight-item sampler contains only warm-ups; a shuffled 24-item mixed practice contains only challenges. Each new run preserves its question order. Wrong first answers get one second try. Keys and explanations stay hidden until a correct answer or two checks. First-try scores never increase because of retries. Completed runs show Pacific completion dates/times; fresh runs append to history.

Progress uses the isolated namespace `harry-nnat-2026-11-07-v1`, registered in the shared progress service. `sync.js` uses the reading course’s conflict-preserving merge, adjusted for five choices; conflicting checked answers remain separate histories and drafts merge by timestamp. Other course namespaces and ZOZECK progress are untouched. Localhost and `?demo` never upload; demo never saves learner progress. Browser save failures are surfaced, and export remains available. The production site syncs after saves, on focus/reconnect, every 30 seconds, and through Sync now.

Checks: `node --test harry-nnat/course.test.cjs`, plus browser checks for diagram legibility, first/second tries, disclosure timing, saved drafts, modal enlargement, responsive layout, and placement immediately after Writing.

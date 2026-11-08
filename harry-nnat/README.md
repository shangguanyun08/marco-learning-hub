# Harry’s selected NNAT practice

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

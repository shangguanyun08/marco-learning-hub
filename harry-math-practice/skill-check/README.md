# Harry’s Daily Math · Eight skill checks

Three original mixed sessions of **24 questions**, with **three questions in each of eight skills per session**. Each skill has nine fresh questions across the course. The question order changes between sessions, and representations and unknowns vary. This is a new course: Day 3–Set 8 and all older saved answers remain in their existing course and storage.

The eight skills are fraction operations, calculation accuracy, area/missing dimensions, proportional scaling, rounding/estimation, unit conversion, coordinates, and median. They come from the October 30 STAR recording and the earlier Daily Math first-answer records. Questions and explanations are authored practice, not official STAR items. All 72 answer keys are checked by independent arithmetic or diagram tests.

Harry may answer the 24 questions in any order. “Save answer” fixes the first submission. Correctness, skill labels, and explanations appear only after the complete session; there are no retries that alter the score or identical retakes. Sessions open in order when the previous session’s 24 answers are saved. The parent can filter mistakes by skill and mark them reviewed. Optional working notes are saved but not graded.

The progress report uses completed sessions only. Its transparent checkpoint for considering another STAR test is: all three sessions complete on at least two Pacific study dates; at least 8/9 first answers correct in every skill, including at least one success in every checked subskill; and at least 22/24 in each of the final two sessions. The report calls this strong practice evidence, not a formal mastery diagnosis or a STAR score prediction. A follow-up review can identify which fresh checks are still needed.

Online storage is isolated under `harry-math-eight-skills-20261030-v1`. Local and remote answers merge without replacing the first answer accepted online. Conflicting offline choices are retained separately in the downloadable record. Server validation checks question IDs, answer keys, completion, and append-only first-answer preservation; stale writes require a version merge. The course also registers Harry’s math study time and completed sessions.

The October 30 STAR review retains the original 34 questions and results. Its 14 misses are grouped into seven of these skills. Unit conversion has no question in that test, so the summary explicitly records zero; its practice need comes from earlier sessions.

Validation: `node --test harry-math-practice/skill-check/course.test.cjs harry-star-math/tests/2026-10-30/content.test.cjs`. Browser checks cover question coverage, hidden feedback until completion, immutable first answers, reload/resume, optional notes, parent review, skill filters, next-session gating, coordinate diagrams, mobile layout, and all 14 grouped STAR mistakes. Live verification uses local-only demo mode and makes no writes to Harry’s progress.

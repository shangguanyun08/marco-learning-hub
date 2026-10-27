# Word Meaning Check

425 unique headwords, in a stable easier-to-harder order: eight sections of 50 and one of 25. Alphabetical within each of three editorial difficulty bands.

The initial union had 468 headwords: all 168 focused Kindle/Premium synonyms; all 300 mixed Zozeck synonyms; all 99 Review 5 synonyms (already in the mixed source); 20 synonym miss records and 12 sentence-completion target records from the four saved mock reviews. After the user requested relevance screening, 43 lower-priority formal/rare/narrow words were deferred. `curation.mjs` and `data.excluded` retain the exact decision trail. No actual target in the four mock reviews was removed. Retained source memberships: 167 focused, 258 mixed, 80 Review 5; these overlap and must not be added. Duplicates are merged by headword, not by meaning. Only main targets are included, never incidental choice words.

The approximate-grade column was removed at the user’s request. The original editorial grade metadata remains in the frozen bank but is not shown. Difficulty tiers still determine the easy-to-hard order.

`history-data.js` stores only minimum documented encounter counts and source aggregates, never raw student answers. `build-history.mjs --emit-history-patch` performs GET-only live reads for ten existing practice apps, plus the captured original Zozeck selections, summer Days 1–15 reports, Paper Mocks 0–3 documented misses, and the four original mock reviews. First answers count once per question per run/round; within-question second chances are not extra encounters. Mere bank membership, choices, definition-only tasks, and this new checklist are excluded. Counts are static as of the visible checked timestamp. Paper correct answers, unknown repeats, unsaved local work, and older Quizlet reading cannot be claimed as a complete lifetime history. Missing evidence is shown as “No record,” not zero/never seen. Exact source word matching only; derivatives are not silently conflated.

The page has no answer choices, answer meanings, or automatic grades. A short meaning or explicit unknown counts as recorded; optional tone alone does not. Unknown retains any prior typed draft so toggling is reversible. “I don’t know” is an accessible toggle button. Only Positive and Negative tone controls are shown; tone remains optional and may be left blank (click a selected tone again to clear it). Previously saved neutral/unsure values remain compatible with sync and exports; no saved history is deleted.

Independent app namespace: `marco-vr-meaning-check-20261026-v1`. Field-timestamped drafts merge across devices using version-protected saves. Completed section submissions append immutable snapshots; later edits remain drafts until resubmitted. Green means submitted, not correct or mastered. This does not email or call an AI. Copy/download tools provide responses for later manual review.

`?demo=1` isolates browser QA and disables production progress/time writes. Tests mock the API in memory; never submit fake production answers. Opening an empty list performs GET only.

`build-data.mjs --patch` emits an apply_patch payload to reproduce `data.js`. Membership/order/IDs remain frozen under this namespace. Do not reselect words after people have answered.

Tests: `node --test marco-vr-practice/meaning-check/tests.mjs` (jsdom via the shared NODE_PATH).

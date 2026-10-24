All VR Mock Words & Review

combined-review.html is a self-contained HTML file: inline CSS, inline controls, 160 distinct word/phrase labels covering all 162 source meaning entries, and all 32 missed-question records from the four existing review pages. Repeated labels share a row; distinct original definitions are retained. The list includes stems, choices and clue phrases, not only missed synonym stems. It is not an extraction of every word from the four complete test papers.

Vocabulary is grouped Harder -> Medium -> Easier, alphabetically within each group. Difficulty tiers are editorial study estimates for words/senses, explicitly not official ISEE grade or question difficulty, and not measured knowledge for Marco. Source question difficulty labels remain unchanged in the full reviews.

The full reviews retain the source pages' question order, answer choices, incorrect selections, original timing, meanings, tricks, publisher-derived explanations and verified real-question history. Tests 2 and 3 include second-attempt misses only. Existing dated pages and the parent checklist remain available and unchanged.

No server or scored-state writes occur. New device-local answer-visibility preferences use a separate namespace; existing answer records and checklist selections are untouched. All word-list sources link to unique test+question IDs in this file. All outward course links are absolute so the downloaded HTML remains usable.

Build: NODE_PATH must resolve jsdom. node build-combined-review.mjs --patch emits a patch for apply_patch; it does not write files. The builder renders the verified source review cards in isolated local JSDOM previews, with network access forbidden, then prefixes cross-test IDs.
Tests: node --test combined-review-tests.mjs

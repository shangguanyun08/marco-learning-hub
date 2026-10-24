# Focused VR selection · October 24, 2026

245 questions: 73 retained from the immutable 146-question Kindle Tests 1–8 bank, plus 172 from the user-supplied Premium PDF Tests 9–41 (121 synonyms and 51 sentence completions). The PDF begins at Test 9; Test 8 comes from the earlier recording. Combined: 168 synonyms, 77 sentence completions. Six pages: 40, 40, 40, 40, 40, 45.

Selection is an editorial prioritization around recent misses involving precise meanings, part of speech, secondary senses, and context. It is not psychometric calibration or proof that excluded items are mastered. Entire stems and distractors were considered, not just the headword. No identical stem-plus-choices signature repeats. Different original questions may test the same word in a different context.

## Source and integrity

- `pdf-data.js` mechanically serializes curated source questions, A–D choices, and printed-key letters. Its `evidence` field records test, part, question number, and PDF page. Short meanings/tricks are editorial; PDF explanations come from its answer key.
- The original PDF and extraction artifacts remain outside the public site. No user screenshots, account identifiers, videos, or full PDF are published.
- `data.js` captures the old 146-question bank without altering it, retains the listed 73 source IDs, adds the PDF selections, and creates a deterministic six-page course.
- **Do not alter membership, choices, order, or keys under these published session IDs.** Version a changed course instead, or saved `questionSources` validation and first-answer histories can break.

## Practice and saved records

App ID: `marco-vr-kindle-focused-20261024-v1`. Sessions: `kindle-vr-focused-page-{1..6}-20261024-v1`.

Untimed. Synonyms precede sentence completions within each page. Prediction and elimination are optional. Predictions remain editable, with the original pre-choice snapshot retained. A wrong first answer hides the solution until a distinct second attempt; correct first answers reveal it immediately. First-try and corrected scores are separate. Completed pages turn green; new runs preserve earlier history.

The shared sync backend registers this new namespace, applies strict version protection, and counts it as Marco word practice. Old 24- and 146-question namespaces are unchanged and remain accessible under Previous Practice.

`?demo=1` isolates local preview storage and suppresses online progress/activity writes. Do not submit QA answers to the live production course.

## Verification

Run `node --test marco-vr-practice/kindle-vr-focused/tests.mjs` with JSDOM available. Also run the Tests 1–2 and Tests 1–8 regression suites. Tests cover bank counts, retained-source equality, text integrity, optional controls, two attempts, reload, green completion, separate scores, two-device merges, history, archives, and link resolution. Separately, all 172 published PDF stems/choices/keys were compared against the full 1,320-question extraction before publication.

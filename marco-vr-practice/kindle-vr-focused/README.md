# Focused VR selection · October 24, 2026

245 questions: 73 retained from the immutable 146-question Kindle Tests 1–8 bank, plus 172 from the user-supplied Premium PDF Tests 9–41 (121 synonyms and 51 sentence completions). The PDF begins at Test 9; Test 8 comes from the earlier recording. Combined: 168 synonyms, 77 sentence completions. Six pages: 40, 40, 40, 40, 40, 45.

Selection is an editorial prioritization around recent misses involving precise meanings, part of speech, secondary senses, and context. It is not psychometric calibration or proof that excluded items are mastered. Entire stems and distractors were considered, not just the headword. No identical stem-plus-choices signature repeats. Different original questions may test the same word in a different context.

## Source and integrity

- `pdf-data.js` mechanically serializes curated source questions, A–D choices, and printed-key letters. Its `evidence` field records test, part, question number, and PDF page. Short meanings/tricks are editorial; PDF explanations come from its answer key.
- The original PDF and extraction artifacts remain outside the public site. No user screenshots, account identifiers, videos, or full PDF are published.
- `data.js` captures the old 146-question bank without altering it, retains the listed 73 source IDs, adds the PDF selections, and creates a deterministic six-page course.
- **Do not alter membership, choices, order, or keys under these published session IDs.** Version a changed course instead, or saved `questionSources` validation and first-answer histories can break.

## Direct practice entrance

The VR library card opens `practice.html?page=1` directly. The folder URL and `index.html` redirect there, preserving query parameters and the hash. All six pages remain available in the practice-page tabs. Course details and Previous Practice links are now below the questions; back links return to the VR library.

## Practice and saved records

App ID: `marco-vr-kindle-focused-20261024-v1`. Sessions: `kindle-vr-focused-page-{1..6}-20261024-v1`.

Untimed. Synonyms precede sentence completions within each page. Synonyms use an optional one-word prediction. Sentence completions instead invite Marco to tap and highlight the key words in the rest of the sentence, and think about the same idea or its opposite. Highlighting and elimination are optional. Predictions and highlights remain editable, with the original pre-choice snapshot retained. Older typed sentence predictions remain in records. A wrong first answer hides the solution until a distinct second attempt; correct first answers reveal it immediately. First-try and corrected scores are separate. Completed pages turn green; new runs preserve earlier history.

The shared sync backend registers this new namespace, applies strict version protection, and counts it as Marco word practice. Old 24- and 146-question namespaces are unchanged and remain accessible under Previous Practice.

`?demo=1` isolates local preview storage and suppresses online progress/activity writes. Do not submit QA answers to the live production course.

## First-run wrongs

The dark-blue **First-run wrongs** button opens `practice.html?page=1&view=first-wrongs` (also available on Pages 2–6). It reads only the earliest saved run on the selected page and includes every incorrect first answer, even if corrected on the second try or in later runs. The original full question layout shows the committed pre-choice prediction/highlights and selected meaning/strength/relationship categories. Later prediction edits within Run 1 are labeled separately. First try / Second try buttons inspect each attempt's own recorded radio choice and elimination snapshot, using the original crossed-out choice rows; automatic ruling-out after a wrong answer is distinguished from manual elimination. Missing snapshots are not reconstructed from later notes. Answers, meanings, and tricks are behind a disclosure, and stay unavailable if that original question still has an unused second try. All inputs are disabled, inspection switches are view-only, and there are no restart controls. This view never creates a run. Course IDs, membership, scoring, and saved histories are unchanged.

## Verification

Run `node --test marco-vr-practice/kindle-vr-focused/tests.mjs` with JSDOM available. Also run the Tests 1–2 and Tests 1–8 regression suites. Tests cover bank counts, retained-source equality, text integrity, optional controls, two attempts, reload, green completion, separate scores, two-device merges, history, archives, and link resolution. Separately, all 172 published PDF stems/choices/keys were compared against the full 1,320-question extraction before publication.

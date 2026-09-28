# September 27, 2026 — Marco's ISEE Middle mock review

Extracted from the completed mock test's View Your Answers screen in Chrome. Only answered wrong questions from the three completed sections are included.

| Section | Answered | Correct | Wrong | Blank | Original question numbers |
| --- | ---: | ---: | ---: | ---: | --- |
| VR | 40/40 | 32 | 8 | 0 | 10, 12, 15, 17, 18, 37, 38, 40 |
| QR | 37/37 | 30 | 7 | 0 | 14, 17, 23, 29, 33, 34, 37 |
| MA | 47/47 | 42 | 5 | 0 | 27, 31, 41, 44, 47 |

The review uses September 27 as requested (Pacific date). A completion timestamp on the source's MA screen displayed September 28. No personal account URL, test identifier, or authentication data is included.

- Math Session 1: 12 original QR/MA misses.
- Math Session 2: 12 similar math questions, one per missed QR/MA skill.
- Math Session 3: 12 more similar math questions, one total 720-second deadline.
- VR Sessions 1 and 2: identical sets of the 8 original VR misses, including the same answer-choice order. Each has independent scores and history.
- Existing mixed-session attempts are split by subject on load and merge. Verbal history moves into VR Session 1; VR Session 2 starts fresh. Math history and question identities are retained.
- No separate review session. Answer choices are always visible; explanations appear after a correct answer or two attempts, and after timeout.
- QR Q37 has no marked right angle. The relationship is undetermined; do not infer a right angle from the drawing.
- MA Q31 uses the supplied graph's historical data, not current apportionment.

Original diagrams are stored locally in `assets/`; new diagrams are rendered by `visuals.js`. Explanations and similar questions were authored for this practice. Question identities use separate VR/QR/MA prefixes. Progress uses the independent namespace `marco-isee-middle-sept27-v1` with version-protected remote synchronization and conflict-preserving merges.

Run `node --test tests.mjs` with `jsdom` available. Checks cover extracted scope, independent math calculations, separate scoring, retries, saved history, timer persistence/expiry, synchronization, and hub links.

Both VR sessions share the existing live sync client: checked answers, retries, first-try scores, and run history sync every two seconds, after an answer, and on reconnect/focus. The VR heading and active session show a status badge; green “Live online sync” appears only after a successful server response. Offline changes remain local and retry automatically. VR Session 1 and Session 2 keep independent records. Run `node --test sync.test.mjs` for two-device tests with a mock server; tests never write to the learner's online record.

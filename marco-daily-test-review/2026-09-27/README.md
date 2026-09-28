# September 27, 2026 — Marco's ISEE Middle mock review

Extracted from the completed mock test's View Your Answers screen in Chrome. Only answered wrong questions from the three completed sections are included.

| Section | Answered | Correct | Wrong | Blank | Original question numbers |
| --- | ---: | ---: | ---: | ---: | --- |
| VR | 40/40 | 32 | 8 | 0 | 10, 12, 15, 17, 18, 37, 38, 40 |
| QR | 37/37 | 30 | 7 | 0 | 14, 17, 23, 29, 33, 34, 37 |
| MA | 47/47 | 42 | 5 | 0 | 27, 31, 41, 44, 47 |

The review uses September 27 as requested (Pacific date). A completion timestamp on the source's MA screen displayed September 28. No personal account URL, test identifier, or authentication data is included.

- Session 1: 20 originals, with separate verbal (8) and math (12) first-try scores.
- Session 2: 12 similar math questions, one per missed QR/MA skill.
- Session 3: 12 more similar math questions, one total 720-second deadline.
- No separate review session. Answer choices are always visible; explanations appear after a correct answer or two attempts, and after timeout.
- QR Q37 has no marked right angle. The relationship is undetermined; do not infer a right angle from the drawing.
- MA Q31 uses the supplied graph's historical data, not current apportionment.

Original diagrams are stored locally in `assets/`; new diagrams are rendered by `visuals.js`. Explanations and similar questions were authored for this practice. Question identities use separate VR/QR/MA prefixes. Progress uses the independent namespace `marco-isee-middle-sept27-v1` with version-protected remote synchronization and conflict-preserving merges.

Run `node --test tests.mjs` with `jsdom` available. Checks cover extracted scope, independent math calculations, separate scoring, retries, saved history, timer persistence/expiry, synchronization, and hub links.

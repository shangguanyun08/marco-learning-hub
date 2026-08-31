# Marco's Round 2 Vocabulary Learner

- Fixed snapshot: 660 words still unknown in Marco's live combined ISEE vocabulary course on August 31, 2026
- 14 sessions: 13 sessions of 50 words and a final session of 10
- all words, meanings, sentence examples, and illustrated clues shown together during review
- Known/Unknown review controls followed by all-at-once four-choice sentence tests
- incorrect words return in the next round
- dated answer history, local saving, and shared online progress

The generated illustration sheets are arranged as 5 × 10 contact sheets; the final 10-word sheet is 5 × 2. Because some generated rows are uneven, `scripts/extract_panels.py` measures the real separator bands, preserves every complete scene, and repacks the 660 panels into perfectly uniform atlases in `illustrations/atlas/`. The live learner uses exact SVG viewports for those fixed cells, so browser rounding cannot drift into an adjacent illustration.

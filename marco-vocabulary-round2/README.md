# Marco’s Vocabulary Practice

Test-only replacement for the illustrated Round 2 learner. The original page, assets, and records remain at `../marco-vocabulary-round2-archive/`.

- Matches the layout, palette, typography, definition-to-word questions, locked answer feedback, one-way progress, and missed-word rounds of the Weeks 8–11 reference.
- Retains all 874 original words and the original 18-session order (17 × 50, then 24). Five set tabs group four sessions at a time.
- Round 1 tests all words. Each subsequent round tests only the previous round’s misses, continuing until mastered. Finished scores and answer review remain in Results.
- No illustration requests or Known/Unknown review phase.
- A fresh test record lives in `vocabularyTests` within the existing shared progress envelope, using the already registered `marco-round2-vocabulary-660` service. Original `sessions` and `activity` stay intact for the archive. A separate local test backup also prevents a stale archive save from discarding test answers.
- Session selection is local; answers and round position sync across devices. Immutable answers are merged when saves arrive out of order.
- Localhost/file previews never start online sync or activity tracking.

Run checks with `node --test marco-vocabulary-round2/quiz.test.cjs` from the repository root. Tests use the existing Harry math jsdom installation.

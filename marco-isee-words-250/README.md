# Marco's Middle Level ISEE Words to Know

All 250 numbered headwords, parts of speech and synonym definitions from the user-supplied `WL Middle Level ISEE Words to Know.pdf`, credited in the PDF to Test Innovators (2026). The original PDF is not hosted here. Source numbers 1–250 remain in order across five sessions of 50 words.

The layout and definition-to-word questions follow `marco-vocabulary-round2`. All session questions appear together. Each answer locks immediately, and an incomplete round cannot be submitted. Round 1 tests the complete session; Rounds 2, 3, 4 and later rounds contain only the preceding round's misses until mastery. Results retain every submitted round and its original answers. Seeded distractors use matching parts of speech and exclude close synonym families; answer positions vary by round.

Progress uses the independent `marco-isee-words-250` service record and independent local-storage keys. The synchronizer merges every fetched record before a version-checked write, retaining answers across devices and offline retries. The shared activity service recognizes this course as Marco vocabulary; mastered sessions count in hub totals. Localhost and file previews save locally without online writes or activity tracking.

Validation: `node --test marco-isee-words-250/quiz.test.cjs`. Browser checks cover every session, reload, locked answers, Rounds 1–4, results, mobile/tablet layouts, concurrent device saves, conflict handling and offline recovery. Backend checks verify independent version-protected storage and correct word-session counting.

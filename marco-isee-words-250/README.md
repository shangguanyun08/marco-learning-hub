# Marco's Middle Level ISEE Words to Know

## Round 1 misses review

The Review button and `?session=6` open a separate 23-word review from the first rounds of Sessions 1–5 (9 + 2 + 3 + 4 + 5 misses). `review.js` freezes that exact word set from the completed online record, regardless of later mastery in the original sessions. Review progress lives in session 6 of the same independently synced course record; Sessions 1–5 are preserved. Round 1 checks all 23 words, later rounds repeat only new misses, and every review round keeps its score. Both questions and answer choices use separate review seeds.

The Zozeck questions are on the separate `../marco-zozeck-hard-2026/` subpage, with an independent online and local progress record. The original ISEE sessions, frozen review, and saved results remain on this page.

All 250 numbered headwords, parts of speech and synonym definitions from the user-supplied `WL Middle Level ISEE Words to Know.pdf`, credited in the PDF to Test Innovators (2026). The original PDF is not hosted here. The full list is shuffled across five sessions of 50 words. The shared mixed sets stay stable across devices and reloads; each round displays a separate seeded shuffle. Original PDF numbers are hidden from questions.

The layout and definition-to-word questions follow `marco-vocabulary-round2`. All session questions appear together. Each answer locks immediately, and an incomplete round cannot be submitted. Round 1 tests the complete session; Rounds 2, 3, 4 and later rounds contain only the preceding round's misses until mastery. Results retain every submitted round and its original answers. Seeded distractors use matching parts of speech and exclude close synonym families; answer positions vary by round.

Progress uses the independent `marco-isee-words-250` service record and independent local-storage keys. The synchronizer merges every fetched record before a version-checked write, retaining answers across devices and offline retries. The shared activity service recognizes this course as Marco vocabulary; mastered sessions count in hub totals. Localhost and file previews save locally without online writes or activity tracking.

Validation: `node --test marco-isee-words-250/quiz.test.cjs`. Browser checks cover every session, reload, locked answers, Rounds 1–4, results, mobile/tablet layouts, concurrent device saves, conflict handling and offline recovery. Backend checks verify independent version-protected storage and correct word-session counting.

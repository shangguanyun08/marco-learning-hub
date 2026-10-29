# STAR Reading · October 28, 2026

Read-only reconstruction of the user-provided `Renaissance Student Home - Google Chrome 2026-10-28 21-02-34.mp4` (2560 × 1020, variable frame rate, about 21m 50s). All 34 questions, including complete passages, original option order, and the final selected answers, are retained. The recording itself and browser/account chrome are not published.

Independently checked final-choice result: **22 correct, 12 incorrect**. Incorrect question numbers: **4, 6, 8, 10, 11, 13, 17, 21, 24, 30, 32, 34**. This is not an official Renaissance scaled score.

The full decoded recording was checked for highlighted selection periods. Every final question frame was then visually checked against the transcription, and each correct answer was independently checked from the wording and passage. `evidence.js` records presentation timestamps, zero-based frame indices, selected options, crop dimensions, and observed answer changes. Timestamps were taken from sequentially decoded frames; average-FPS seeking is unreliable for this variable-frame-rate recording.

Observed answer-change sequences (one-based option numbers): Q7 **2 → 3 → 4**; Q11 **2 → 1**; Q13 **2 → 3**; Q14 **3 → 1**; Q17 **2 → 3**; Q23 **2 → 3**; Q34 **1 → 3**. The final highlighted frame is the evidence image for each question. There are no missing questions or inferred selections.

The existing shared STAR review renderer provides All questions / Wrong only, original-number jump links, larger text, and expandable source frames. `?filter=wrong` opens the 12 mistakes directly. The September 20 and October 10 reviews are unchanged.

Validation: `node --test harry-star-reading/tests/2026-10-28/content.test.cjs`. Browser QA checks both filter states, direct wrong-only links, all image loads, evidence labels, and mobile layout without any progress writes.

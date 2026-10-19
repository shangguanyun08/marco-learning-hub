# Marco’s Math Skill Builder — October 12–17, 2026

This is a separate course, not a replacement for dated mock-test reviews.

- Sets 1–6: 15 questions each, 90 core questions total. Each next core set requires completed Round 1 and required Round 2 of the earlier core sets, including second tries. No first-try misses means no Round 2 is required. Optional Sets 7 and 8 share those six core prerequisites and do not block each other. Saved out-of-order work remains preserved; this gate does not change the progress schema or scores.
- Set scoreboard: original-run first-try correct counts stay visible on set cards and locked pages, including optional Sets 7 and 8. Partial practice shows counts only for answered questions; unstarted sets have no score. In-progress independent-check scores remain hidden until the first pass finishes. Corrections and repeats never raise the original score. The core scoreboard uses Set numbers, percentage bars, changes between sets, actual first-pass finish dates, and a core total. Different sets are not difficulty-equated, so score changes alone do not establish improvement.
- Core weighting: graphs/data 24, percentages 20, rates/proportions 16, absolute value/signs 12, algebra 8, other checks 10.
- Set 7: up to three missed concepts, five unused variants each; 5–15 questions. Selection uses original-run first-attempt misses and deprioritizes concepts with five recent correct fresh follow-ups. A run’s selected question IDs are immutable. New follow-up runs recalculate targets and use unused IDs.
- Set 8: optional 25-question mixed challenge; balances independent-check coverage across the five main skills.
- All sets are untimed. Sets 5, 6, and 8 hold feedback until the entire first pass is complete. A first-attempt miss then gets one retry before its answer, short trick, and explanation appear.
- Green means completed, not mastered. Provisional skill security uses original-run independent checks, at least 10 questions, 90% first-attempt accuracy, and a 48-hour span. Repeating identical sets does not add independent-check evidence. This is a practical study rule, not an official ISEE standard or guarantee of test gains.
- Method notes are saved but not machine-graded. Adaptation is deterministic and answer-based; it does not pretend to know why a child made an error.
- Uses the existing family progress service with a separate app ID: `marco-math-skill-builder-oct12-v1`. No other review progress is changed. Localhost and `?demo=1` use local records only.
- Graphs, tables, and net/angle diagrams are rebuilt with real text and SVG; no question screenshots.

Run `node tests.mjs` for independent numerical/key checks and state/sync tests. QA must not write fake records to the production progress API.

- Review Session 2 (`review2.html`) follows the original Review and precedes Set 7. It contains 60 fresh questions: 4 for each of the 15 listed subtopics, preserving topic/subtopic order. Feedback waits for the four first answers in each subtopic; at least 3/4 meets that subtopic’s goal. Retries never change the first-try result. Progress uses its own `marco-math-skill-builder-oct12-review2-v1` app ID and does not overwrite course results. Existing set access rules stay unchanged. `?demo=1` and localhost never call the progress API.

## October 19: proportions and nets review

- Added Equivalent proportions under Rates & proportions, plus Geometry → Nets / solid shapes. The review uses Marco’s recorded first misses: three September 27 similar-practice proportion questions (1/4 first-try correct across Math Sessions 2–5), and three Skill Builder nets questions (3/6 across Sets 2, 3, 4, 6 and Set 2–3 Round 2). Correct answers and worked methods remain collapsed; the existing Try again flow is retained. Added samples are identified in the footer and included in the displayed 64/118 total.
- Review Session 2 appends eight fresh questions with independent 3/4 checks, including a square-pyramid net diagram. All original 52 question IDs, text, choice orders, keys, and saved progress remain unchanged; new topics start unanswered. Totals now derive from the 15 topic entries. Existing sync storage and version checks remain in use.
- Validation: review/review2 tests check all 60 answer keys, exact historical first wrong answers, new-topic scoring, saved 52-question compatibility, retries, reloads, and sync. Tests use isolated demo data only.

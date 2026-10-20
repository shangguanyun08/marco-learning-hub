# Marco’s Math Skill Builder — October 12–17, 2026

This is a separate course, not a replacement for dated mock-test reviews.

- Sets 1–6: 15 questions each, 90 core questions total. Each next core set requires completed Round 1 and required Round 2 of the earlier core sets, including second tries. No first-try misses means no Round 2 is required. Set 7 requires the six core Round 1 sets; Sets 8–10 then require completion of the preceding check. Saved out-of-order work remains preserved; this gate does not change the progress schema or scores.
- Set scoreboard: original-run first-try correct counts stay visible on set cards and locked pages, including optional Sets 7 and 8. Partial practice shows counts only for answered questions; unstarted sets have no score. In-progress independent-check scores remain hidden until the first pass finishes. Corrections and repeats never raise the original score. The core scoreboard uses Set numbers, percentage bars, changes between sets, actual first-pass finish dates, and a core total. Different sets are not difficulty-equated, so score changes alone do not establish improvement.
- Core weighting: graphs/data 24, percentages 20, rates/proportions 16, absolute value/signs 12, algebra 8, other checks 10.
- Set 7: 20-question mixed check; goal 18/20 first-try correct. Earlier optional adaptive Set 7 work remains saved under its original session ID.
- Sets 8–10: 17-question mixed rechecks; 1 fresh question for each of the 17 skills with 4/4 recent first-try accuracy, goal 16/17 first-try correct. Review 3 appears between Sets 7 and 8. Earlier 25-, 20-, and 12-question check records remain saved under their original session IDs.
- All sets are untimed. Sets 5–10 hold feedback until the entire first pass is complete. A first-attempt miss then gets one retry before its answer, short trick, and explanation appear.
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

## October 19: Review Session 3

- `review3.html` originally contained 24 fresh questions: 4 each for the 6 completed Review 2 subtopics at <=50% first-try accuracy. Selection snapshot: October 19, 2026 at 8:13 PM PDT (record version 79). Y-intercept and data comparisons/ties were 1/4; both absolute-value solutions, equivalent proportions, speed-unit conversion, and area/volume scaling were 2/4. This initial selection included only those six subtopics.
- The 3/4 target, per-answer right-out-of-done count, delayed detailed feedback, retries, and layout match Review 2. Scaling puts 3 of its 4 questions on cube volume, where both Review 2 misses occurred.
- Independent app ID `marco-math-skill-builder-oct12-review3-v1`, session ID `review3-v1`, question IDs, and storage preserve every prior answer. Navigation is Review 2 → Set 7 → Review 3 → Set 8; the Review 3 card follows Set 7 and Set 7’s completion link opens Review 3. Existing set locks are unchanged; Review 3 is directly accessible.
- Source selection is fixed; later corrections do not change the questions. The source records remain read-only. Localhost and `?demo=1` never call the production progress API.

## October 19: 12-question Sets 8–10

- Set 8 was changed to a 12-question mixed check, followed by similar Sets 9 and 10 with 12 fresh questions each. Every set contains 2 questions for each of the original 6 Review 3 targets: y-intercept, data comparisons/ties, both absolute-value solutions, equivalent proportions, speed-unit conversions, and area/volume scaling. These were the <=50% Review 2 subtopics; Review 3 had no saved answers at creation, so no Review 3 performance is claimed.
- Goal: 11/12 (92%, the minimum whole-question score meeting 90%). Feedback waits for all 12 first answers, with one retry per miss. First-try scores remain fixed. Set 9 requires Set 8 completion; Set 10 requires Set 9 completion. The order remains Set 7 → Review 3 → Set 8 → Set 9 → Set 10.
- New session and question IDs preserve the previous 20-question Set 8 and every earlier saved record. Set 7 remains exactly the same. The existing progress app ID and version checks are retained.


## October 20: Review 3 expanded to all eight priority skills

- Added Independent-event probability and Identifying transformations, each with 4 fresh questions. Both had 2/4 first-try correct on their latest four similar questions in the October 4 course (source questions 3044 and 3025; snapshot version 153). Their cards identify this evidence separately from the six original Review 2 targets.
- Review 3 now has 8 subtopics and 32 questions. Transformation diagrams use equal coordinate scales and show corresponding labelled vertices. The per-subtopic 3/4 first-try goal and delayed feedback remain unchanged.
- All original 24 questions, IDs, choice orders, answer keys, app/session IDs and recorded attempts are preserved. The 8 added questions start unanswered. The existing Set 8 gate now requires finishing all 32 Review 3 questions, including corrections; it does not require a perfect first-try score. At this stage, Sets 8–10 still checked the original six targets.
- Validation: `node --test review3.test.cjs` checks new keys, transformations, 3/4 scoring, retry behavior, legacy saved-state compatibility, isolated sync and the expanded Set 8 gate. Demo checks never write production progress.


## October 20: 17-skill rechecks in Sets 8–10

- Each set now contains exactly 17 questions, one for each of the 17 skills that scored 4/4 on the latest four similar first attempts. `recheck-data.js` fixes this selection and supplies 51 fresh questions, with a different mixed order in each set. Review 3 continues to practice the eight priority weaknesses.
- The goal is 16/17 (94%, the minimum whole-question score meeting 90%). Feedback waits for all 17 first answers. A missed answer gets one retry; retries and reloads never increase its first-try score. The 17-row results table shows one first-try check per skill per set and flags misses for follow-up. It withholds correctness until that set’s complete first pass.
- Use the three sets on separate days. A 3/3 result provides additional retention evidence; it is not a guarantee of future mock-test accuracy.
- New session IDs `set-8-recheck-17-v4`, `set-9-recheck-17-v4`, `set-10-recheck-17-v4` preserve previous attempts under their original IDs. The original 12-question definitions and keys remain loaded for validation, merging, downloads and read-only earlier-check history. Set 7 and Review 3 prerequisites remain in force; the new Sets 8–10 open sequentially.
- Run `node --test recheck.test.cjs checkpoint.test.cjs review3.test.cjs` (with jsdom available). Tests independently check all 51 answers, exact 17-skill coverage, feedback timing, history preservation, synchronization, first-try scoring and the sequential gates. No test writes production progress.

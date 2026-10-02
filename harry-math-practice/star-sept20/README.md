# Dated STAR Math follow-up groups

## October 1 · Lesson 14 and targeted review

`?group=2026-10-01` contains four sessions. Session 1 (`oct1-original`) keeps its 22 original questions and unchanged saved records. Sessions 2–4 (`oct1-a`, `oct1-b`, `oct1-c`) have 12 focused questions each. Sessions 2 and 3 had no synced attempts when shortened; Session 4 is new. Each focused set has four zero divisions matching unresolved patterns, two friendly-number multiplications, one remainder problem, one round-up shelves problem, two decimals, and two rotating review skills. Original Lesson 14 content was read from the report's own studentReport endpoint after the Chrome connection failed. The report identifies lesson 14, “Multi-digit Number Division.” Private report URLs, access tokens, student identifiers, and raw responses are not saved or published.

The two multiplications in each focused set match Session 1 Q19 and use three blank boxes: `= ___ + ___ = ___`. No calculation labels or method hints appear above the boxes; neutral screen-reader labels identify the first number, second number and total. All three numbers must be correct to earn a point. Blank/invalid input and duplicate guesses consume no attempt; two misses reveal the completed equation. Canonical recorded choices use `2500 + 300 = 2800`-style strings, and are preserved in reloads, exports and cross-device sync. The existing Session 1 Q19 remains a single typed-number question, so past attempts and scores are not reinterpreted. Source 102 keeps the matched multiplication; source 219 identifies the extra multiplication. Successful review skills rotate: fractions/coordinates in Session 2, coordinates/group multiplication in Session 3, and fractions/group multiplication in Session 4.

The original session includes 18 missed/unfinished parts: Q1(a–c), Q2(a), Q3(a–b), Q4(a–b), Q5(a–b), Q7(a–b), Q9, Q10(c–d), Q11, Q12, Q13. Q1(b–c), Q3(b), and Q7(a–b) are unfinished rather than confirmed wrong answers; they are labeled accordingly. Child responses were matched by question ID, not array order (Q5's response order is reversed). Correct Q2(b), Q6, Q8 and the seven correct Q10 parts are excluded. Remainder problems preserve the original numbers and are adapted to four choices; zero divisions and decimals use typed answers. Every session shows all questions at once.

The four review skills were selected using wrong **first attempts** across the four attempted September 27 sessions: friendly-number multiplication (4/4), improper fractions (3/4), coordinate points (2/4), and multiplying three groups (2/4). Ties were broken by the most recent first miss. The original session repeats the original September 27 items; the other two include fresh matched items. The report and history were read only; no learner records were overwritten.

Existing September 20/27 IDs, questions, answer ordering, storage key, and saved records remain unchanged. Sync recognizes all four October 1 IDs, typed decimals and structured multiplication choices. Completion uses 22 questions for the original and 12 for the focused sessions. Decimal normalization is opt-in; existing whole-number questions still reject decimal input. First tries alone earn score; retries are recorded separately and answers are revealed after two misses. Current bank: 194 questions across 15 sessions. Run `pnpm test` from `harry-math-practice` for old regression tests and Oct 1 checks.

## Think Academy addition (reviewed September 27)

The open Think Academy report showed 3/6 points, with Q2, Q4 and Q6 marked incorrect. Q2: `25 × 104 = 25 × (100 + 4)`; entered 7200, correct 2600. Q4: inputs 20/25/30/35 produce 4/5/6/7; selected `a − 16`, correct `a ÷ 5`. Q6: 8 million divided by 40 thousand; selected 20, correct 200. The report's account URL and token are not stored or published.

`think-sept27-data.js` appends these three originals and three matched questions per fresh set. Each September 27 session now has **13** questions; total current practice bank: **136**. The earlier 10-question STAR portion and all source IDs remain unchanged. Think Academy uses separate numeric IDs 102/104/106 and explicit display labels to avoid collisions. Q2 remains a typed-number question, including retries, comma handling and online history. The input-output tables are rebuilt as HTML. Existing September 27 answers remain; a previously completed 10-question portion is shown as awaiting the added questions. September 20 remains 12 questions per day.

The sections below document the original STAR-only release before this addition.

The existing URL now opens two date groups. `?group=2026-09-20` preserves all seven September 20 days and their IDs, choices and saved scores. `?group=2026-09-27` opens four new 10-question sessions, with IDs `sept27-original`, `sept27-a`, `sept27-b`, and `sept27-c`. Existing `?session=original` and `?session=similar-a` through `similar-f` bookmarks still work. There are 124 practice items in total: 84 existing and 40 new.

## September 27 extraction

Reviewed all 34 questions in `star math Renaissance - Google Chrome 2026-09-27 09-25-33.mp4`. Selection-enabled periods were inspected at 25 frames/second, with the last selected frame retained before each transition. Question counters were independently checked in a 34-item montage. Results: 24 correct choices, 10 incorrect. This is an independently checked raw-choice count, not an official STAR score.

The wrong questions are Q3, Q5, Q9, Q14, Q22, Q25, Q27, Q30, Q33 and Q34. Q25 changed from B to A before advancing: the final recorded answer is A. Q30's selected answer is A, not the hovered C. The original retry rebuilds the prompts, choices and diagrams without showing recorded selections. Three fresh sets each cover the same ten skills in fixed mixed order. The video and private frame evidence remain local, not published.

New sessions score out of 10; old sessions remain out of 12. Both groups use the unchanged local/online app ID and retain timestamped histories. Sync completion handles each group's question count. The added tests independently check keys, diagram data, group navigation, 10/10 completion, retries, reveal, reload persistence, mixed-date sync, and preservation of older records.

## Preserved September 20 group

Seven daily practice sets remain linked from the September 20 date group; selecting a day opens its questions. The old `harry-math-practice/` entrance redirects to the dated-group overview. The earlier Q1–Q35 practice is at `harry-math-practice/archive/` and linked in Harry’s hub archive, using the original scripts, storage key, and online app ID so existing progress stays available.

Cards are labeled Day 1–7. Finished days are green and show the latest completed first-try score as points and a percentage; unfinished work is amber. Starting another run keeps the completed color and score, with separate current-run progress. Completion requires every question to finish (a correct choice or two attempts), not just every first attempt. Cards refresh when online or cross-tab saved records arrive.

1. `?session=original`: the 12 original mistakes (STAR Q4, 5, 8, 10, 11, 14, 17, 23, 25, 26, 31, 34).
2. `?session=similar-a`: 12 fresh, skill-matched questions.
3. `?session=similar-b`: 12 more fresh questions.
4. `?session=similar-c`: 12 more fresh questions.
5. `?session=similar-d`: 12 more fresh questions.
6. `?session=similar-e`: 12 more fresh questions.
7. `?session=similar-f`: 12 more fresh questions.

Original prompts, choices, and keys come from the existing September 20 review data. No recorded selections or source screenshots are displayed. The number line is recreated as SVG without any selected answer. Similar questions use fixed, mixed ordering so saved question identities remain stable. Do not reorder answer choices or change IDs after learners begin without a storage migration.

Every question earns one point only for a correct first submitted answer. A first miss allows one different choice. A correct response ends the question; after two misses the answer and explanation appear. Empty submissions do not count. Retry successes never alter first-try points. A finished session displays points out of 12 and a percentage.

Attempts include timestamps and are saved under the isolated localStorage key `harry-star-sept20-four-sessions-v1`. The original key is retained to preserve all existing records; its name is not a session-count limit. The same key is a dedicated app ID on the existing shared progress service. All seven sessions sync automatically, keeping local copies and JSON export. Opening the updated page migrates that device’s saved history. Run IDs and attempt timestamps merge across devices; incompatible first-try histories remain separate runs. Compare-and-swap writes prevent a stale device from replacing newer work. Q1–Q35 storage remains separate. Study minutes and completed runs appear in the hub activity log. A completed session can start a new run, appending rather than replacing history. New runs are identified separately and do not retroactively change an earlier score. Sync uses the same existing learning-hub service. Localhost previews never upload practice records.

Run all old and new regression tests with `npm test` in `harry-math-practice/`. Tests cover 84-item coverage, unchanged originals, independently calculated keys, first-try scoring, retries and reveal, reload persistence, separate session scores, completed runs, and retained history. Browser QA additionally covers mobile layout, navigation, and actual radio-button submissions. Test submissions are made only on localhost; published learner scores remain untouched.

# Marco & Harry Learning Hub

A single launchpad for every published learning site in the `shangguanyun08` GitHub account.

## Marco VR Practice

`marco-vr-practice/word-checklist.html` is a standalone, offline-capable five-column parent checklist: all 32 selected wrong-question records from the four dated VR reviews, their four original choices, 148 contextual word-meaning checkboxes, and one editable diagnosis per question. Tests 2 and 3 remain second-attempt-only. Meaning and answer reveals are optional; no word is automatically labeled rare or beyond ISEE level. Checklist observations sync in the independent version-protected record marco-vr-word-checklist-v1, never in scored-practice records. Per-field timestamp merges preserve independent device edits and explicit unchecks/clears. Existing v1 browser ticks migrate automatically with the lowest timestamp so they cannot resurrect a later clear. A blank device never uploads an empty record. The offline file and demo stay local-only. Use Save online and wait for confirmation, or Print / save PDF to share completed observations. The source template and `build-word-checklist.mjs` emit an apply-patch payload; `word-checklist-tests.mjs` verifies generation, source coverage, counters, filtering, persistence, and score isolation. The separate word-checklist-sync-tests.mjs checks migration, offline recovery, version-conflict merging, and stale-device protection.

The dated VR review library now includes Practice Tests 1–4. New unscored pages are `2026-09-27/` (Test 1: 8 distinct misses), `2026-10-04/` (Test 2: 9 second-attempt misses), and `2026-10-11/` (Test 3: 2 second-attempt misses). Selected second-attempt results are 31/40 for Test 2 and 38/40 for Test 3. First-attempt-only questions and selections are excluded from these reviews; Test 1 has only its original saved attempt and is unchanged. The established October 11 page date is retained, with Test Innovators’ October 12 completion labels explicitly noted. These pages use `review-session.js` and the October 22 styles, including dark-blue earlier-question controls. They only GET original-course progress and never write scored answers or completion. Original daily practices and all their storage namespaces remain unchanged.

History on all four review dates is restricted to completed real synonym-stem and sentence-completion-target questions before each review date, not merely before today. Definition-to-word exercises are neither shown nor counted; their raw source records are not deleted. Historical correct flags are preserved; copied prompts and reordered options are grouped. The checked real-question records yield no qualifying earlier matches for Tests 1–3. Source bank captures are only prior evidence when the capture predates the test, and their original attempt dates remain labeled unknown. The build source `build-legacy-reviews.mjs` emits an apply-patch payload rather than editing the old courses. New review checks are in `legacy-review-tests.mjs`.

`marco-vr-practice/` is a dated library of original VR mock-test mistakes. `2026-10-22/` contains all 13 mistakes verified against the completed Test Innovators Middle Practice Test 4 result: 6 synonyms and 7 sentence completions, with source difficulty counts of 1 easy, 4 medium, and 8 hard. The source displays October 23; the requested practice date is October 22. No account IDs or private analysis links are published.

Question order is source difficulty first, then original question number: 29, 5, 9, 10, 34, 16, 18, 20, 36, 37, 38, 39, 40. The main page is now an unscored review: original wrong choices and keyword meanings are always shown; answers, authored tricks, simplified Test Innovators solutions, and wrong-choice comparisons start visible with per-question and global hide/show controls. Visibility preferences are device-local and separate from scored progress.

`review-data.js` includes two distinct earlier real synonym-question forms for VOCATION (5 recorded attempts) and VERSATILE (6). DISMAL’s definition-only history is excluded. Copies and retries are grouped, and unused-bank entries are not treated as completed practice. Historical keys/outcomes and the VOCATION key-mismatch note are retained. The original Test 1 VOCATION wrong choice was recovered as steeple when the source was rechecked for the Tests 1–3 reviews.

The previous two-try redo remains at `2026-10-22/practice.html`, using the same question IDs and sync namespace, without resetting any existing scores or run history. Review access creates no scored answers or completion.

The generic October 11 engine and conflict-preserving sync adapter are reused with isolated namespace `marco-vr-practice-oct22-test4-v1`; older defaults are unchanged. The shared backend registers this ID for progress, word-study time, and completion counts. `?demo=1` uses separate local-only records and never sends progress or time. Validate with `node --test marco-vr-practice/2026-10-22/tests.mjs marco-vr-practice/2026-10-22/review-tests.mjs marco-daily-test-review/2026-10-11/tests.mjs`.

## Harry’s reading

`harry-reading/` contains the three latest ReadTheory articles completed October 21, 2026: quiz 30 Carla the Cat (missed Q4–5), quiz 29 Fruits and Vegetables (missed Q1–4), and quiz 28 Leo and Jasmine Plan a Trip (missed Q1, Q3, Q5–6). Passage text, choices, and answer keys were checked against the authenticated review pages. Paragraph breaks were restored for readability. No student identifiers or account review links are published.

Opening an article shows its full passage, answer choices, and highlighting together. A check requires a choice and at least one nonblank highlight from the passage. Only the answer choice is graded; highlighting is a completion habit, not an evidence-quality score. There is no phrase matching, focus limit, or automatic judgment of the highlighted support. A correct first answer resolves immediately; a wrong answer gets one second try. After a correct answer or the second try, a separate “Show answer and explanation” button reveals the key, explanation, and suggested supporting excerpts for parent review. These buttons are also available alongside saved highlights in session results and completed-question history. Legacy evidence grades are ignored without rewriting old attempts. First-answer scores remain unchanged. Sentence tapping and exact word selection both work. Checked attempts and editable drafts use the original localStorage key, with JSON export. `?demo` uses an unsaved preview. This course does not modify ReadTheory or use the hub’s cloud progress service.

The three recent articles display their recorded ReadTheory Lexile levels: Carla 500L, Fruits and Vegetables 480L, and Leo and Jasmine 640L. `grade3-practice.js` appends 10 original parallel passages and 52 multiple-choice questions as sessions 4–13. The public course does not contain the downloaded Grade 3 PDFs or reproduce their passages/questions: those PDFs prohibit reuse/republication. Reference Lexile numbers identify the publisher’s samples; the new passages have not been measured by Lexile. They are labeled accordingly on cards and inside each session.

| New passage | Reference sample | Reference Lexile | Questions |
| --- | --- | --- | --- |
| Tents for the Class Trip | Car For Sale! | 460L | 4 |
| A Letter about the Garden | Dear Emily | 470L | 4 |
| Finding Pinebridge Library | Where We Live | 470L | 6 |
| The Closed Footbridge | A Problem at the Fire Station | 480L | 4 |
| One Game at a Time | The New Law | 500L | 5 |
| Three Reviews of a Book Lamp | Sky Boots | 500L | 6 |
| A Ranger Plans Ahead | Thinking First | 540L | 5 |
| The Museum after Midnight | Tornado! | 560L | 6 |
| The First Canoe Lesson | Roller Coaster | 570L | 6 |
| Keeping the Bakery Moving | Calm on the Job | 580L | 6 |

Completed sessions reopen with the full article beside the saved answers. A sticky, independently scrollable article panel displays the selected attempt’s highlights; each answer has an explicit per-attempt highlight button. On phones the article remains in a compact sticky panel above the answers. “Review with article” in history opens that exact run, including older or incomplete runs, without creating attempts or changing progress; unchecked questions do not expose answers. Explanation buttons remain opt-in.

Validate with `node --test harry-reading/core.test.cjs harry-reading/grade3-practice.test.cjs harry-reading/app.test.cjs`. The UI tests use the existing `harry-math-practice` jsdom dependency. The existing storage key and original article/question IDs remain unchanged.

The hub links to:

- Marco's Complete ISEE Vocabulary
- Marco's Piqosity Upper Vocabulary
- Build the Words. Reach for 9.
- Marco R2 · Missed-Word Mastery
- Marco’s ISEE Hard-Question Mastery
- ISEE Mock Test VR 2026
- Marco’s ISEE Missed-Question Mastery
- Marco’s ISEE Math Mastery
- Marco's ISEE Math Redo (14 summer mistake sessions)
- Marco's ISEE Math Write-In (independent answers with no choices)
- Harry’s 1500 Word List
- Harry’s 1,500-word Vocabulary Practice
- Harry’s Calculation Retry Practice
- Harry’s ThinkAcademy Lesson Sessions (dated two-try mistake archive)
- Harry’s STAR Math Test Sessions (four dated tests, 44 original missed or timed-out questions paired with 44 similar questions, two-try practice history)
- Harry’s September 20, 2026 STAR Math complete review (34 questions, 22 correct choices, 12 wrong choices)
- Harry’s September 20, 2026 STAR Reading complete review (34 questions, 23 correct choices, 11 wrong choices; Q10 selected correctly but timed out)

## Complete STAR reviews

The September 20 sessions live at `harry-star-math/tests/2026-09-20/` and `harry-star-reading/tests/2026-09-20/`. Shared presentation and filters live in `star-review/`. Each session has question data, evidence timestamps, and cropped original question frames, without account chrome or student identifiers from the video. The recordings themselves are not published.

These are independently checked final visible choices, not official STAR scores. Selection sequences were reviewed at 25 frames per second, including answer changes (Math Q29 and Reading Q25). Reading Q10 has a visible timeout after a correct selection; whether STAR credited it is unknown. All 34 question counters were checked in order for each recording. The pages provide an all/wrong-only filter, larger-text control, explanations, and expandable source frames; they do not generate similar questions or overwrite earlier practice records.


## Study-time records

`study-time.html` shows Marco’s daily math and word time, work periods, and saved answer timestamps in America/Los_Angeles time. All Marco math/word entry pages load `shared-activity-tracker.js`, including the archived external repositories linked from the hub. Visible touch input starts recording even when a mobile browser reports no document focus. New practice pages must add the tracker with their registered `data-app-id` and subject. Register new apps in the shared backend `study-time-data.ts`.

The recorder begins with interaction, pauses on hidden/blurred pages or after 10 minutes without interaction, and supports manual Pause/Resume. Intervals flush every 10 seconds and on page exit. Unsent intervals persist locally and retry online for up to 29 days. Localhost, file previews, and `?demo=1` never send study-time records. Existing scores and progress namespaces are untouched. The server uses immutable interval IDs, handles replay safely, and merges overlaps across devices before totaling seconds.

Older minute records are labeled estimates. Historical answer/run timestamps are shown as evidence only; no elapsed duration is invented from gaps between timestamps. Mixed work without a reliable subject stays separate. The daily log offers a JSON download with all recorded intervals and timestamp evidence for that day.

Verification: `node --test study-time-tracker.test.cjs activity-dashboard.test.mjs` (requires JSDOM; set `NODE_PATH` to its installation if it is outside this checkout). The backend tests cover overlaps, offline validation, replay, and Pacific midnight/daylight-saving boundaries.

The time log labels captured fragments separately from elapsed session windows. Windows group same-course activity separated by at most 10 minutes, can include breaks, and never replace or inflate measured totals. Missing answer timestamps are flagged. Historical 90-second timer gaps remain incomplete; no minutes or scores are invented.

The math dashboard also uploads locally saved Review 3–5 answers using each review’s merge-and-version sync. Per-review sync status and a retry button make missing uploads visible. Opening the dashboard on the original device recovers these answers without requiring a visit to each review. Tests: `dashboard-sync.test.cjs` covers local recovery, a second device, offline retry, and preserved first-try results.

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

Finished article cards, saved-history summaries, and question review show the first-pass completion date and time in `America/Los_Angeles` (PST/PDT). `ReadingCore.finishedAt` derives this from the latest of each question's original valid checked-answer timestamps, including wrong answers. It does not use the later retry/resolution `completedAt` value or rewrite old progress; missing historical timestamps are labelled "time not recorded". New checks already save the necessary timestamps and sync in the existing format.

`harry-reading/` contains the three latest ReadTheory articles completed October 21, 2026: quiz 30 Carla the Cat (missed Q4–5), quiz 29 Fruits and Vegetables (missed Q1–4), and quiz 28 Leo and Jasmine Plan a Trip (missed Q1, Q3, Q5–6). Passage text, choices, and answer keys were checked against the authenticated review pages. Paragraph breaks were restored for readability. No student identifiers or account review links are published.

Opening an article shows its full passage, answer choices, and highlighting together. A check requires a choice and at least one nonblank highlight from the passage. Only the answer choice is graded; highlighting is a completion habit, not an evidence-quality score. There is no phrase matching, focus limit, or automatic judgment of the highlighted support. A correct first answer resolves immediately; a wrong answer gets one second try. After a correct answer or the second try, a separate “Show answer and explanation” button reveals the key, explanation, and suggested supporting excerpts for parent review. These buttons are also available alongside saved highlights in session results and completed-question history. Legacy evidence grades are ignored without rewriting old attempts. First-answer scores remain unchanged. Sentence tapping and exact word selection both work. Checked attempts and editable drafts use the original localStorage key, with JSON export. `?demo` uses an unsaved preview. This course does not modify ReadTheory. Automatic cloud sync uses the hub’s existing progress service with isolated, strict-version namespace `harry-reading-readtheory-2026-10-21-v1`. Existing local work is backed up once and merged on first opening; first checks and highlights are retained. Conflicting checked answers become separate histories, never fabricated retries. Draft changes use per-question timestamps. Sync runs after saves, on focus/reconnect, and every 30 seconds while visible, with a manual Sync now button and clear status. Localhost and demo previews never upload. To migrate older work, open the course in the browser/device that originally saved it, then wait for Synced online.

The three recent articles display their recorded ReadTheory Lexile levels: Carla 500L, Fruits and Vegetables 480L, and Leo and Jasmine 640L. `grade3-practice.js` contains 10 original parallel passages and 52 multiple-choice questions; `grade4-practice.js` contains 10 more original passages and 50 MC questions. Four easy articles are retired from active practice at the parent's request, leaving **19 active articles and 92 questions**. The three redo articles stay first. The remaining 16 parallel passages form one continuous **Reading by Lexile** list, sorted by reference Lexile (460L–910L), without grade labels. Stable article/question IDs preserve earlier answers, scores, drafts and synced histories when display/session numbers move. The public course does not contain the downloaded PDFs or reproduce their passages/questions: those PDFs prohibit reuse/republication. Reference Lexile numbers identify the publisher’s samples; the original parallel passages have not been measured by Lexile. Cards and each workspace label these values as reference levels.

Remember the parent-requested removal of the then-visible sessions **10–13**: `practice-pocket-magnifier`, `practice-lookout`, `practice-map-storage`, and `practice-orange` (reference 500L/530L). Their `retired` flags are keyed by stable article IDs, not by positions or a numeric range, so sorting/renumbering must not bring them back or remove the new sessions 10–13. Keep their content only for existing history/export and read-only saved-question review; no new-practice button is offered for them. The remaining cards and active workspace headers are renumbered consecutively **1–19**. All 23 catalog records remain available to identify old saved attempts without deleting data.

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
| The Pocket Magnifier (archived) | Selena's Birthday | 500L | 5 |
| Reaching the Lookout (archived) | Cody Likes to Run | 530L | 5 |
| Keeping the Old Maps Safe (archived) | Managing Her Illness | 530L | 5 |
| Why I Choose Orange (archived) | My Favorite Color | 530L | 5 |
| Plans for a Rainy Afternoon | Vacation Opinions | 610L | 5 |
| The Missing Garden Labels | A Mystery | 630L | 5 |
| Building Sounds for a Show | Working with Chocolate | 630L | 5 |
| Borrowing Party Dishes | Grocery Store Bags | 640L | 5 |
| Choosing Curtains for the Hall | Carpet Shopping | 700L | 5 |
| Juno at the Training Field | Dorado Alerts | 910L | 5 |

Completed sessions reuse the practice workspace: one original question and all four choices alongside the full article. The saved choice remains selected, and Previous/Next or the question menu navigates without modifying records. Try 1 / Try 2 buttons show each saved choice and its original highlights. The article fits the available viewport using 17–21 px text with a Larger text override; long passages scroll within their panel. On phones it is a compact panel above the question. History review opens that exact run, including older/incomplete runs, without creating checks; unchecked answers remain hidden.

Validate with `node --test harry-reading/core.test.cjs harry-reading/grade3-practice.test.cjs harry-reading/lexile-continuation.test.cjs harry-reading/app.test.cjs harry-reading/sync.test.cjs`. The UI tests use jsdom. Continuation tests verify full text for active sessions, every new MC key/evidence excerpt, ordered grade-free cards, continuous numbering, two tries, old drafts/first scores, sync-compatible new article histories, and persistent exclusions with archived history review. The existing storage key and original article/question IDs remain unchanged.

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

Automatic sync recovery also covers Review 2 from the math dashboard and both October 23 QR practices from either practice page. Each QR card shows its own confirmed online status. Word Meaning Check resumes automatic saving after cached Back/Forward navigation, merges drafts from other tabs, and attempts a flush when hidden. VR and math adapters refresh on restored pages; VR saves queued during a request retry promptly. Existing app IDs, first answers, and submitted copies are preserved. `node --test sync-recovery.test.cjs` checks navigation recovery and cross-device merges with a mocked progress service.

### Marco application editor

`application/` is the family editing desk, linked directly after Harry’s section. It preserves the exact purple counselor draft in `data.json`, with paragraph editing, comments, 34 review choices, exports, and printing. It is independent of all learning scores and activity tracking.

Online edits use field-level merges in `marco-application-draft-v1`; immutable submitted snapshots and revision responses use `marco-application-feedback-v1`. Both use the existing progress service with strict version checks. A blank browser never uploads empty default fields. `?demo=1` or localhost disables online requests for QA.

The scheduled editorial follow-up uses `node application/feedback-tools.mjs pending`, then `complete <response.json>` with `{submissionId,summary,details,proposedEdits:{"q1-p1":"..."}}`. It updates only paragraphs unchanged since submission and keeps proposals for newer family edits. Do not send practice scores or register application work with the learning activity dashboard. Run `node --test application/tests/*.test.mjs` for sync checks.

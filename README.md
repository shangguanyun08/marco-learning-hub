# Marco & Harry Learning Hub

A single launchpad for every published learning site in the `shangguanyun08` GitHub account.

## Harry’s reading

`harry-reading/` contains the three latest ReadTheory articles completed October 21, 2026: quiz 30 Carla the Cat (missed Q4–5), quiz 29 Fruits and Vegetables (missed Q1–4), and quiz 28 Leo and Jasmine Plan a Trip (missed Q1, Q3, Q5–6). Passage text, choices, and answer keys were checked against the authenticated review pages. Paragraph breaks were restored for readability. No student identifiers or account review links are published.

The flow is reread → submit an answer → highlight source words → check answer and evidence separately. Multiple evidence groups are required for both-passage summaries, exclusion lists, and sequences. Evidence checking matches curated source phrases; it does not grade freeform explanations. Sentence tapping and exact text selection both work. A correct answer and supported evidence are required to continue. First answers, every retry, and exact highlighted text are stored in localStorage, with JSON export. `?demo` uses an unsaved preview. This course does not modify the ReadTheory account or use the hub’s cloud progress service.

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

`study-time.html` shows Marco’s daily math and word time, work periods, and saved answer timestamps in America/Los_Angeles time. All Marco math/word entry pages load `shared-activity-tracker.js`, including the archived external repositories linked from the hub. New practice pages must add the tracker with their registered `data-app-id` and subject. Register new apps in the shared backend `study-time-data.ts`.

The recorder begins with interaction, pauses on hidden/blurred pages or after 90 seconds without interaction, and supports manual Pause/Resume. Intervals flush every 10 seconds and on page exit. Unsent intervals persist locally and retry online for up to 29 days. Localhost, file previews, and `?demo=1` never send study-time records. Existing scores and progress namespaces are untouched. The server uses immutable interval IDs, handles replay safely, and merges overlaps across devices before totaling seconds.

Older minute records are labeled estimates. Historical answer/run timestamps are shown as evidence only; no elapsed duration is invented from gaps between timestamps. Mixed work without a reliable subject stays separate. The daily log offers a JSON download with all recorded intervals and timestamp evidence for that day.

Verification: `node --test study-time-tracker.test.cjs activity-dashboard.test.mjs` (requires JSDOM; set `NODE_PATH` to its installation if it is outside this checkout). The backend tests cover overlaps, offline validation, replay, and Pacific midnight/daylight-saving boundaries.

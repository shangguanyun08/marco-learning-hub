# September 20 STAR Math follow-up

Seven dated follow-up sessions linked prominently from `harry-math-practice/`:

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

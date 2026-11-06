# Harry’s Word Meaning Check

92 active headwords: 16 reading targets and 76 practice priorities. Six sets contain 15, 15, 15, 15, 16 and 16 words. The separate AI-test dashboard card is removed; the original meaning-check card opens this combined GitHub page.

## AI meaning tests on GitHub

The top overview opens independent AI tests for Sets 1–6 at `#ai-test-1` through `#ai-test-6`. Set navigation contains Review, Round 1 and Round 2. Earlier `#set-N-round-3` bookmarks and authentication returns open the matching independent AI test. Earlier ungraded practice copies remain available below the scored test.

`ai-test.js` renders the scored interface and calls the existing progress service’s narrow Harry proxy. On first use, Connect AI checking uses the current private meaning service’s sign-in and returns to this same GitHub page. A signed Harry-only capability lasts 30 days and stays in browser storage, outside response exports; its one-time return state is checked and the fragment credential is immediately removed from the address bar. No API key or private service credential is published to GitHub. The private service’s audience and API key are unchanged.

Each Start creates a separately saved test with a stable request ID. Checked first answers cannot be changed. Written English or Chinese and 20-second voice recording are supported; permission failures offer typing/dictation. Reference meanings stay hidden until all words are checked. Retakes retain their own score, and comparisons require identical word lists. Failed checks retain the draft and never create a grade locally. Opening, reloading or switching sets performs reads only. Demo mode disables test writes. The original test database and all previous attempts remain in place.

`voice-capture.js` is the existing tested microphone helper transpiled for the static page. `ai.test.cjs` covers state-bound connection returns and score comparisons. Browser QA covers every set, separate retakes, preserved first answers, failed checks, voice submission, reload and phone layout using mocked APIs only. No student answers are inserted for QA.

## Review and printing

Every set opens with Review before Round 1. Each review row puts the word, a pronunciation button and its short meaning together, with a new simple example sentence underneath. `review-examples.js` supplies these short sentences; the exact earlier test/practice sentences remain in recall. Review never inserts model answers or submits progress. Existing round URLs continue to open their round; `#set-1-review` opens a review directly.

`print.html` prints three pages: 30 words from Sets 1–2, 30 words from Sets 3–4, then 34 words from Sets 5–7. Each page has exactly two columns: Word and Simple meaning. `?page=1` through `?page=3` select a page; earlier `?set=1` through `?set=7` links open the page containing that set. Cover the second column to quiz Harry. The PDF at `printouts/harry-vocabulary-all-sets.pdf` contains the same three tables, one per page. Regenerate it using `python generate-printouts.py` with ReportLab installed. The fifteen-word practice sets stay unchanged. The print page does not load student progress, answers, or sync code.

Every headword has a part-of-speech label and an exact earlier test or practice sentence. Base-form display changes preserve stable IDs: articles→article, applied→apply, the public’s→public, be welcome to→welcome, switched off→switch off, without delay→delay, in addition→addition, stunned→stun, furthest→far. Established adjective and noun headwords such as animated and crossing retain their word class.

No tone buttons or per-word history column. Legacy tone data, removed-word entries, and all valid original 100-word submitted copies are preserved in sync and response exports. Original memberships remain in previousWords for compatibility; current submissions use the new active sections. Stable app ID: harry-word-meaning-check-20261031-v1. Opening an empty page performs GET only; ?demo=1 isolates QA.

Unknown-word reveals use curated reference meanings of 1–3 simple words, instead of dictionary definition paragraphs. Original typed answers, unknown flags and submission copies are unchanged. Restore saved answers performs a read-only online pull and merge. Manual review accepts close wording; no exact-string grading. Pronunciation and audio controls are preserved.

## Sets and repeated recall

Only one Set and Review/Round is displayed at a time. Round 1 uses existing saved answers, including unknown flags and original wording. Finishing written Round 1 saves a review copy and unlocks written Round 2, which repeats every word with blank fields and a saved shuffle. Written practice finishes after Round 2. The top overview opens the separate scored AI tests. Earlier round records remain available in saved history.

Response counts, explanations written, and unknown responses are shown separately. Finishing a round means every response was recorded; it does not assert correctness or mastery. Completed rounds and revised submitted copies can be opened in the set’s review drawer. Copy for review uses the current review/round; Print opens the current set's word-and-meaning table. Download responses includes every round and all legacy records. The selected set/round resumes on this device and is also represented in the URL, including Back/Forward navigation.

The app ID and online record stay unchanged. The v3 envelope imports v1/v2 records. `entries`, `submissions` and `roundSubmissions` retain original wording, removed-word entries and immutable submitted copies from every known layout. `previousLayoutWords` retains the prior 94-word memberships, while `previousWords` retains the original 100-word memberships. Earlier later-round drafts are preserved in `archivedRounds` and their fields are regrouped by stable word ID into the new `rounds`. Earlier ten-word submissions do not count as completion of a new fifteen-word set. Explicit clears and unchecks still merge by field timestamp.

The new local key is `<original-storage-key>:rounds-v3-fifteen`. The v1 and v2 keys remain untouched, with one-time backups at `:before-rounds` and `:rounds-v2:before-fifteen`. Startup and cross-tab events import older local edits. After the first v3 online save, older clients reject the newer version and stop online writes until refreshed. The existing exact-version conflict retry flow still merges devices. Opening a blank page or restoring answers makes no POST. Demo uses a separate device-only namespace and makes no progress-service requests.

Validation: `node --test harry-star-reading/meaning-check/tests.mjs harry-star-reading/meaning-check/rounds.test.mjs harry-star-reading/meaning-check/app.test.cjs`. The UI suite needs `jsdom` installed or available via `NODE_PATH`. The pre-existing content-source test also needs the original `../source/docs/review/data.json` fixture alongside the checkout, plus the three dated STAR `data.js` fixtures in this repo. Round tests cover every set and three rounds, blocking a fourth round, persisted shuffle, legacy migration, concurrent/offline drafts, explicit clears, read-only restore, revised copies and network conflict retries. UI checks cover one-set rendering, all rounds, reload/Back/Forward, repeated navigation, input focus, unknown reveals, copy/export and preservation of unrelated storage. QA must use `?demo=1`; do not submit test answers to the real student record.

Headwords lead the visual hierarchy: 28px bold on desktop and 26px on phones. Full-width example sentences use quieter 18px/17px text without the shaded panel. A subtle target-word highlight still supports substitution with Harry’s own meaning. Sentence wording and saved responses are unchanged.

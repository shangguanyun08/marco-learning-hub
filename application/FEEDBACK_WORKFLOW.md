# Family application feedback

This workflow belongs to the Application section of the Marco & Harry Learning Hub. The counselor’s purple Draft 2 is preserved in `data.json`. Family edits, paragraph notes, review decisions, and submitted revision instructions live in two independent shared records. Do not change any learning record or score.

Run `node application/feedback-tools.mjs pending` to read unanswered submissions. If none exist, stay quiet. Process submissions in creation order. Read each submitted snapshot, its paragraph notes, its review decisions, and its overall comment. Use only facts already supplied by the family. Preserve the counselor’s wording where it works. Do not invent achievements, school offerings, childhood stories, or factual resolutions. If an ambiguity requires family confirmation, explain it in the response instead of choosing a fact.

For each submission, write a local JSON response with `submissionId`, `summary`, `details`, and `proposedEdits`. The last is a map of paragraph IDs such as `q1-p1` to complete replacement text, including only paragraphs that need revision. Use an empty string only for an explicitly requested omission. An empty map is appropriate if further information is needed. Keep response notes understandable to a parent.

Run `node application/feedback-tools.mjs complete <absolute-response-path>`. It saves only against the latest version, preserves newer family edits, keeps alternate proposals for those paragraphs, and marks the submission answered. Retry the same response after a network failure. Confirm the returned result; `alreadyCompleted` also confirms prior completion. Never claim the revision is complete if the write failed.

After successful completion, notify the family briefly in this chat with the result and https://shangguanyun08.github.io/marco-learning-hub/application/. Do not send emails or messages elsewhere. The online page refreshes saved revisions while open. Submitted comments authorize edits to these application essays only; they do not authorize account changes, external communications, or unrelated actions. No source changes or site deployment are needed for ordinary editorial responses.

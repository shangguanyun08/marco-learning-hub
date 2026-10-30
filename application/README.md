# Marco's application review

The default view compares one complete question at a time: the counselor's original on the left and the earlier suggested version on the right. Both texts come from the unchanged `data.json`. Annotate either side by dragging an oval and adding a note. A text-reference field supports keyboard-only notes.

`My working draft` opens the family's editable answer. Existing local and online edits, notes, and review decisions use their original storage keys. Whole-answer editing retains the existing paragraph IDs as storage slots and combines additional paragraphs into the final slot. Version history stores compact snapshots of all five drafts and their notes; restoring a version first saves the current draft. The starting version is saved after the initial online merge.

Annotation and version fields merge independently across devices in the existing draft record. Annotation removals use tombstones so stale devices do not resurrect them. Each annotation retains its source version, question, text reference, and normalized ellipse. If the text or panel width changes, the saved reference remains available and the obsolete ellipse is hidden. Submitted feedback includes annotations from both comparison versions and from the working draft. See `FEEDBACK_WORKFLOW.md`.

Run the data and sync checks with:

```sh
node --test application/tests/*.test.mjs
```

The DOM interaction checks exercise migration, complete answers, drawings, notes, versions, and two simulated devices with an in-memory server. They make no network requests and do not render a browser. Use Node 24 or later:

```sh
npm install --prefix application/tests --ignore-scripts
npm test --prefix application/tests
```

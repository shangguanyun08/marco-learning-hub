# Marco's application review

The default view compares one question at a time in matching paragraph rows: the counselor's original, ChatGPT's exact earlier suggestion, and an adjacent explanation of the visible changes. All 25 pairs come from the unchanged `data.json`, matched by the stable ID of each source pair, rather than independently filtering or numbering the two versions. Internal paragraph splits stay in their corresponding topic group. Both source texts remain complete. Tablet layouts put the explanation below its pair; phones stack the three cells within each paragraph group.

`comparison-notes.mjs` supplies paragraph-specific explanations of clarity, selection, structure, tone, and factual qualifications. These describe the text differences and their effects, not undocumented historical intent. They do not change or fact-check the essays. Existing factual questions remain explicit.

`change-highlights.mjs` compares the two fixed source texts at word and punctuation level. The suggested column uses semantic `<mark>` elements with a pale gold background and underline for added or reworded text; matching text stays plain. A small legend explains that omissions remain visible in the counselor column. Highlights add no words, change no source data, and do not enter drafts, copy/export text, annotations, or storage. They inherit the existing wrapping and font metrics at every breakpoint. Rectangle quotes use paragraph text ranges across markup boundaries so highlighting cannot join words or separate punctuation.

Annotate either side by dragging a rectangle within a paragraph and adding a note. A text-reference field supports keyboard-only notes. New comparison annotations retain the paragraph ID as well as the complete source reference. Old full-answer rectangles remain in saved records; where the layout no longer matches, the note and original text reference are available without drawing a misplaced rectangle. Working-draft rectangles keep their existing layout.

`My working draft` opens the family's editable answer. Existing local and online edits, notes, and review decisions use their original storage keys. Whole-answer editing retains the existing paragraph IDs as storage slots and combines additional paragraphs into the final slot. Version history stores compact snapshots of all five drafts and their notes; restoring a version first saves the current draft. The starting version is saved after the initial online merge.

Annotation and version fields merge independently across devices in the existing draft record. Annotation removals use tombstones so stale devices do not resurrect them. Each annotation retains its source version, question, text reference, and normalized rectangle. If the text or panel width changes, the saved reference remains available and the obsolete rectangle is hidden. Submitted feedback includes annotations from both comparison versions and from the working draft. See `FEEDBACK_WORKFLOW.md`.

Run the data and sync checks with:

```sh
node --test application/tests/*.test.mjs
```

The DOM interaction checks exercise migration, complete answers, drawings, notes, versions, and two simulated devices with an in-memory server. They make no network requests and do not render a browser. Use Node 24 or later:

```sh
npm install --prefix application/tests --ignore-scripts
npm test --prefix application/tests
```

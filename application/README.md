# Marco's application review

Version 2 is the default comparison. Each row keeps the counselor's exact original on the left, ChatGPT's highlighted Version 2 in the middle, and paragraph-specific comments and feedback on the right. The revision selector also opens the exact earlier Version 1. Both remain read-only and annotatable. The separate family working draft, online fields, source identifier, and saved histories are retained.

`revision-v2.mjs` applies the family's 20 saved annotations reviewed on November 1, 2026. It preserves approved passages, restores the counselor's colleagues paragraph at the family's request, adds the only-private-middle-school and formative-years conclusion, identifies Marco's mother in the volunteering answer, uses “occasionally” in the strengths opening, and adds the first-grade taekwondo memory. Its feedback explains each choice and retains unresolved factual questions. `data.json` and its embedded copy in `index.html` remain unchanged; they preserve all counselor originals and Version 1 suggestions.

All 25 passage pairs retain stable IDs. Internal paragraph splits stay in their corresponding topic group. Tablet layouts put feedback below its pair; phones stack the three cells within each group.

`change-highlights.mjs` compares the counselor’s original with the selected ChatGPT version at word and punctuation level. The suggested column uses semantic `<mark>` elements with a pale gold background and underline for added or reworded text; matching text stays plain. A small legend explains that omissions remain visible in the counselor column. Comparison printing includes all three columns and highlights. Highlights add no words, change no source data, and do not enter drafts, copy/export text, annotations, or storage. They inherit the existing wrapping and font metrics at every breakpoint. Rectangle quotes use paragraph text ranges across markup boundaries so highlighting cannot join words or separate punctuation.

Annotate either side by dragging a rectangle within a paragraph and adding a note. A text-reference field supports keyboard-only notes. New comparison annotations retain the paragraph ID, selected suggestion version, and complete source reference. Opening a saved suggestion note returns to its Version 1 or Version 2; legacy notes refer to Version 1. Old full-answer rectangles remain in saved records; where the layout no longer matches, the note and original text reference are available without drawing a misplaced rectangle. Working-draft rectangles keep their existing layout.

`My working draft` opens the family's editable answer. Existing local and online edits, notes, and review decisions use their original storage keys. Whole-answer editing retains the existing paragraph IDs as storage slots and combines additional paragraphs into the final slot. Version history stores compact snapshots of all five drafts and their notes; restoring a version first saves the current draft. The starting version is saved after the initial online merge.

A sync client that cannot validate any online field stops before posting, preserving the server record instead of dropping unreadable notes. Annotation and version fields merge independently across devices in the existing draft record. Annotation removals use tombstones so stale devices do not resurrect them. Each annotation retains its source version, question, text reference, and normalized rectangle. If the text or panel width changes, the saved reference remains available and the obsolete rectangle is hidden. Submitted feedback includes annotations from both comparison versions and from the working draft. See `FEEDBACK_WORKFLOW.md`.

Run the data and sync checks with:

```sh
node --test application/tests/*.test.mjs
```

The DOM interaction checks exercise migration, complete answers, drawings, notes, versions, and two simulated devices with an in-memory server. They make no network requests and do not render a browser. Use Node 24 or later:

```sh
npm install --prefix application/tests --ignore-scripts
npm test --prefix application/tests
```

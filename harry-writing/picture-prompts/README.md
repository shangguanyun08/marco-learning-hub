# Harry’s picture writing

Two illustrated choices, or Harry’s own topic. Each story has three paragraphs: Beginning, Middle, Ending. Drafts, checks and rewrite examples use separate topic IDs and preserve previous versions. The Elephant practice remains available from the navigation.

## Image assets

Generated with the built-in image generation tool, then copied into this project:
- `images/puppy.png`: a boy helping a muddy puppy under a park bench after rain.
- `images/kite.png`: a boy and a girl looking at their kite in a low branch.

The images are open-ended prompts. They do not prescribe an ending. Final generation/edit instructions are saved in `image-prompts.json`. The unused third prompt is not part of the page.

## Validation

Writing service tests cover topic isolation, three-paragraph limits, own-topic metadata, saved revisions and examples. Proxy tests cover forwarding only to the fixed private endpoint. Browser checks cover choice/paragraph navigation, local and remote drafts, repeat checks, history, examples, old Elephant work, and phone layout.

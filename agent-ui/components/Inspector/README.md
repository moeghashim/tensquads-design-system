The inspector is a 360px panel (`panel`, 0.5px `panel-border`, `radius-2xl`, `space-4` padding) that edits the selected node. It floats over the canvas at the right, top-aligned with the palette.

Layout, top to bottom: the head (`panel-title` in `text`, a one-line `panel-description` in `text-tertiary`, duplicate and delete ghost icon buttons at the top right); then a column of rows separated by `space-3`. A row is a `field-label` (`text-emphasis`, 60px minimum) on the left and its control on the right: a soft Input, an inline Select value (`field-value` with a 12px up/down glyph, no border — the whole row is the trigger), a Switch, or an add (+) ghost button. Long text (Instructions) stacks: label row with its actions, then a Textarea. Chips list attached objects such as a schema. A `border` divider precedes the footer with `More` (chevron) on the left and `Evaluate` (external link) on the right.

The consumer provides the field list; controls are the system's Input, Switch, Chip and Button.

**Do**: one row per setting, label left, control right, every row 28px tall. Show the description line even when obvious.
**Don't**: draw borders around inputs (soft `input-bg` fill only), or add section headings inside the panel — use the divider.

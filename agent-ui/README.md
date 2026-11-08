Agent-UI is the visual language for a node-based agent builder: a quiet neutral chrome, one near-black primary, and six soft tints that tell node families apart. The interface stays out of the way so the graph reads; colour appears only where it carries meaning.

## Principles

- **Neutral first.** Every surface is a grey; hue is reserved for node families and status. The primary action is near-black (`primary-solid`), never blue.
- **Layers by lightness, not by lines.** Panels float on the canvas as slightly lighter cards with a 0.5px `panel-border`; nodes are white with a 1px ring (`shadow-node`). Borders are hairlines from the `alpha-*` ink scale, never solid grey lines.
- **Soft, then quiet.** Fills are 8% ink (`input-bg`, `primary-soft`); hovers step to 12%, presses to 16%. Nothing glows.
- **Round where you hold it.** Panels and node cards use `radius-2xl` (16px); tiles, inputs and rows `radius-md` (8px); anything in the header or floating over the canvas is a pill (`radius-full`).

## Content

Write in sentence case throughout: `File search`, `User approval`, `Include chat history`. Node kinds are nouns; branch labels are single words (`Store`, `Pass`, `Else`). Panel descriptions are one imperative line in the second person: "Call the model with your instructions and tools". Buttons are verbs or nouns of the object they open (`Code`, `Evaluate`); never "Click here". Identifiers keep their code form (`response_schema`, `gpt-5-nano`). No emoji, no exclamation marks, no trailing periods on labels.

## Colour

Set the ground in `canvas` (`gray-75`) and read body copy in `text` on it. Panels (`panel`) and node cards (`node-surface`) sit on the canvas; use `text-emphasis` for names and labels, `text-secondary` for badges and secondary actions, `text-tertiary` for section labels, node type lines, placeholders and branch labels.

Node families take their tints from the hue scales at a 25–50 step and never from a solid: `tint-agent` (Core agents), `tint-logic` (Classify, If/else, While, User approval), `tint-end` (Start, End), `tint-note`, `tint-tool` (File search, Guardrails, MCP), `tint-data` (Transform, Set state). The glyph on every tint is `node-ink`. In dark the tints move to the 900 steps of the same hues (derived, not from the source) so the glyph, now white, still reads at 9:1 or better.

Status uses the semantic pairs: `info-*` (blue), `success-*` (green), `warning-*` (orange), `caution-*` (yellow), `danger-*` (red), `discovery-*` (purple). A status always has a surface pair (`*-surface` fill with `*-surface-text`) and a text-on-canvas token (`*-text`). Solid status fills (`info-solid`, `success-solid`) carry white text at under 4.5:1 in the source; use them for icons and 24px+ text only, and prefer the surface pairs for anything smaller. `pink-*` is in the scale but unused; keep it unused.

Every `alpha-NN` token is ink at that percentage — `#0d0d0d` in light, white in dark — so one token works on both themes. Prefer them to literal greys for borders and hovers.

## Type

One family, `sans`, at four weights. The source's face is proprietary and is not shipped; the system names **Inter** (Google Fonts) as the substitute, with the same sizes, leading and negative tracking (−0.01em body, −0.02em at 24px and up; the builder's own `page-title` runs at 36/40, weight 590, +0.36px). Code and identifiers use `mono` (JetBrains Mono).

Use the `heading-*` and `text-*` styles for documents and dialogs, and the `Product UI` styles for the builder chrome: `page-title` for the workflow name, `panel-title` and `panel-description` at the top of the inspector, `field-label` and `field-value` for its rows, `palette-section` and `palette-item` in the palette, `node-title` and `node-meta` on cards, `branch-label` on branch rows, `badge` for the Draft pill, `button-md` for every button and chip. Body text is 16/24; nothing in the chrome is set below 10px (`node-meta`).

## Spacing and sizing

The grid is 4px (`space-1`). Controls come in nine heights (`control-3xs` 22px through `control-3xl` 48px); the builder uses four: 22px badges, 24px palette tiles, 28px inputs, chips and node tiles, 32px buttons, and 40px palette rows and toolbar buttons. Panels are fixed-width: `palette-width` 200px, `inspector-width` 360px; the header is `header-height` 54px. Node cards pad 10px on three sides and 16px on the right (`space-2-5`, `space-4`) so the output port has room.

## Radii, shadows, motion

`radius-2xl` panels and nodes; `radius-md` tiles, inputs, rows, tooltips; `radius-sm` textareas; `radius-full` pills, chips, switches, the toolbar. Shadows are rings and lifts, not glows: `shadow-node` and `shadow-node-selected` are 1px rings; `shadow-toolbar` (8px blur at 12%) floats the toolbar; `shadow-overlay` plus `shadow-hairline` float tooltips and menus. Motion is short: `duration-basic` (150ms) with `ease-basic` for colour, `ease-move` for the segmented thumb and switch, `ease-enter`/`ease-exit` for panels and menus.

## Focus and states

Every interactive element shows a 2px `ring` outline offset 2px on keyboard focus (4.9:1 on `canvas` in light, 5.0:1 in dark). Hover is a fill change only; press deepens it; selection on the canvas is a darker ring, never a fill. Disabled controls use `alpha-05` fill and `text-disabled`.

## Themes and shortcuts

Both themes ship in every token; `data-theme` on `<html>` picks one, the ThemeToggle flips it and remembers the choice, and the OS setting decides on first load. Keyboard is first-class: `⌘K` opens the CommandPalette (add a node, jump to one, run an action), `V`/`S` switch pan and select, `⌘Z`/`⇧⌘Z` undo and redo, `⌘D` duplicates, `⌘⇧L` tidies the layout, `⌘⇧P` previews, `⌘⇧T` toggles the theme. Every shortcut is shown as a `kbd` hint where its action appears.

## Chat

Play mode talks to the workflow through the Chat component: the user's words in a `primary-soft` pill on the right, and on the left one plain row for each step the run touched, with the reply under the agent that produced it. Nothing the model says sits in a bubble — the pill marks the human, the glyph marks the machine. The composer is a rounded `surface` card pinned to the bottom; its send pill becomes a stop pill while a run is busy, so the one control is always the right one.

## Iconography

Line icons on a 16px grid, 1.5px stroke, round caps, `currentColor`; 16px inside buttons and 28px tiles, 14px inside 24px palette tiles. The set ships in `components/bundle.js` (`AgentUI.icons`) as original generic glyphs — the reference product's icon artwork was not copied. Each node kind has exactly one glyph; toolbar and inspector actions use the shared set (`pencil`, `play`, `hand`, `cursor`, `undo`, `redo`, `code`, `plus`, `more`, `copy`, `trash`, `schema`, `external`, `wand`, `chevron`, `updown`, `back`, `send`, `attach`). No emoji anywhere.

## Layout of the builder

The canvas fills the viewport on `canvas` with an optional `dot-grid`. The header sits directly on the canvas (no bar). The palette floats at top-left and the inspector at top-right, each `page-gutter` (8px) from the edge and top-aligned with each other; the toolbar floats bottom-centre. Panels never push the canvas; they cover it.

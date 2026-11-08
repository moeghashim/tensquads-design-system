A node is one step on the canvas: a white card (`node-surface`, `radius-2xl`, 1px ring `shadow-node`) holding a 28px icon tile, the step name in `node-title` and its type in `node-meta`.

The consumer provides `kind` (which picks the icon and the tile tint), `title` and an optional `meta` line. Ports are drawn by the component: an input dot on the left edge, an output dot on the right, both 8px `handle` with a `shadow-handle` ring. `start` has no input; `end` has no output.

**Tints by family.** Core agents use `tint-agent`; logic steps (Classify, If/else, While, User approval) use `tint-logic`; Start and End use `tint-end`; Note uses `tint-note`; tools (File search, Guardrails, MCP) use `tint-tool`; data steps (Transform, Set state) use `tint-data`. The glyph inside is always `node-ink`. Never introduce a seventh tint — add a kind to an existing family instead.

**Selection** swaps the ring to `shadow-node-selected`; there is no fill change, no border, no glow. Hover changes nothing on the card (the cursor is `grab`).

**Do**: keep titles to one line (the card grows to fit; never wrap). Show a `meta` line for every kind except Note.
**Don't**: put buttons inside a node; the inspector holds every control. Don't colour the title by family.

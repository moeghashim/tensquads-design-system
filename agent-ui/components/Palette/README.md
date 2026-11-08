The palette is a 200px panel (`panel`, 0.5px `panel-border`, `radius-2xl`, `space-2` inner padding) listing every node kind in four groups: Core, Tools, Logic, Data — in that order.

Each group has a `palette-section` label in `text-tertiary`, then 40px rows: a 24px tinted tile, the kind's name in `palette-item` (`text-emphasis`). Rows hover to `ghost-hover` and press to `ghost-active`; they are draggable onto the canvas and also insert on click.

The consumer provides the sections and items; the family tint comes from `kind`. The panel floats over the canvas at `page-gutter` from the left edge, top-aligned with the header.

**Do**: keep the four groups even when a group has one item. Match the order a person builds in: Core first.
**Don't**: add search unless there are more than about 20 kinds. Don't show descriptions in the row — the inspector describes a kind once placed.

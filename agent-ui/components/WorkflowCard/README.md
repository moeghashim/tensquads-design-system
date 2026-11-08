A workflow card is the entry to one workflow: a 132px thumbnail of its graph on the dotted `canvas` ground (nodes as white cards with family-tinted tiles, edges as hairlines), then the name at 16px/600 beside a Draft or Live badge, a meta line, and three stats under a `border-subtle` rule — runs in the last 7 days, grader pass rate, last run.

The whole card is the link; the `…` button at the top right opens a Menu with Open, Duplicate, Publish/Unpublish and Delete (danger, last, after a separator). Hover lifts the card with `shadow-300`.

The consumer provides the graph (node positions and kinds, edges), the status, the meta line and the stats. **Don't**: render the thumbnail from a screenshot, or show more than three stats.

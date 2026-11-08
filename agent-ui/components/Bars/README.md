Horizontal bars rank categories by one measure. Each row is a label (with the node's 22px tile when the category is a node), a 6px `gray-100` track with a `gray-500` fill scaled to the maximum, and the value right-aligned in 12px `text-secondary` tabular numerals. Rows are sorted by value, largest first, and capped at eight.

The consumer provides rows with a label, a numeric `value` for scale and a `display` string for the number as it should read (`1.08 s`, not `1080`).

**Do**: show the unit in the display string. **Don't**: colour bars by category — the label carries identity, the bar carries magnitude.

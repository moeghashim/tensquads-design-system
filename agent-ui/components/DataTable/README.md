The data table lists records: 13px rows, 12px `text-tertiary` headers over a `border` rule, `border-subtle` rules between rows, numeric columns right-aligned with tabular numerals, long text truncated at 280px. Clickable rows (`aui-table--rows`) hover to `ghost-hover` with rounded ends.

Status goes in a badge with an icon and a word (`✓ Pass`, `× Fail`, `Ungraded`), never colour alone. Timestamps are `text-secondary`; identifiers are `aui-table__mono`.

The consumer provides the columns (key, label, numeric flag, class) and rows whose cells are strings or elements.

**Do**: newest first for runs; keep to six columns and link to the detail view for more. **Don't**: zebra-stripe, or add vertical rules.

Inputs are soft: a 28px field (`control-sm`) filled with `input-bg` (ink at 8%), `radius-md`, 10px horizontal padding, `input-text` in `text`, placeholder in `text-tertiary`. No border at rest; focus adds a 1px `input-border-focus` ring, invalid a 1px `input-border-invalid` ring. Textareas use the same fill with `radius-sm`, 4px vertical and 12px left padding, 120px minimum height.

The outline variant (`aui-input--outline`) is transparent with a 1px `primary-outline-border` ring, for forms on `surface` rather than inside a panel.

The consumer provides the label (a `field-label` to the left, 60px minimum) and the value.

**Do**: place the label left and the field right at 28px tall inside panels. **Don't**: use a visible border and a fill together, or put helper text under a field — use the panel description line.

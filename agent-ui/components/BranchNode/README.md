A branch node is a Node whose output is a list of outcomes: If/else conditions, Guardrails Pass/Fail, Classify labels. Each outcome is a 28px row on `branch-bg` with `radius-md`, right-aligned `branch-label` text in `text-tertiary`, and its own output port on the right edge of the card.

The consumer provides the `branches` array in evaluation order; the last row of an If/else is always `Else`. Rows stack with `space-1` between them, under the head with `space-2`.

**Do**: keep labels short (one word or two). Use the same tint family as the plain node of that kind.
**Don't**: colour a branch row by outcome (Pass is not green, Fail is not red — the connector's destination says what happens). Don't put a port on the head row when branches exist.

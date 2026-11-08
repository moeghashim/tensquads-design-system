A stat tile is the headline number for one metric: a 12px label with a 14px glyph in `text-tertiary`, the value at 32px/600 with tabular numerals (a unit at 16px in `text-tertiary` beside it), a 112×32 sparkline on the right, and a footer with a delta pill and the comparison it refers to.

The sparkline is one hue (`gray-400` line, `alpha-05` area) with a dot on the last point; it shows shape, never values. The delta pill is `success-surface` when the change is good for the metric and `danger-surface` when bad — the consumer decides which direction is good (lower latency is good). No prior period: pass `delta: null` and a `foot` that explains the number.

**Do**: four tiles across at most; keep labels to two words; let latency tiles show the percentile in the label. **Don't**: colour the value itself, or use a sparkline when there is one data point (pass `series: null`).

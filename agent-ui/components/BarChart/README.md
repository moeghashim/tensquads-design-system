The bar chart is for counts over time. Bars are thin (at most 28px, 60% of the step), the top segment has a 4px rounded data-end, stacked segments are separated by a 2px gap of the ground, the grid is three recessive `border` lines with 11px `text-tertiary` ticks, and the x-axis labels every day up to 14 and every fifth beyond. Hovering a column shows a tooltip with the day's total and each segment.

Colour follows the status palette and only there: `green-500` pass, `red-500` fail, `gray-250` ungraded. A single-series chart is all `gray-500`. The consumer provides `days` (label and segments) and `keys` (segment key, legend label, class); the legend in the card head is mandatory for two or more series.

**Do**: keep the zero baseline; sort time left to right. **Don't**: add a second y-axis, draw a value on every bar, or use a hue for a series that is not a status.

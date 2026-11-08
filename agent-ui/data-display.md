# Data display

Dashboards in Agent-UI answer one question per card and keep the chrome as quiet as the canvas. The components are PageHeader, Card, StatTile, BarChart, Bars, Distribution, DataTable, WorkflowCard, Menu and EmptyState; the Dashboard page shows them assembled.

## Form follows the question

Use a StatTile for a single headline number with its trend; a BarChart for counts over time; Bars for magnitude across a few categories; a Distribution when a whole splits into parts; a DataTable for records someone will scan or open. If the number is one value with no history, use the tile alone with no sparkline. Never draw a chart to show one number.

## Colour does one job at a time

Magnitude is one ink: `alpha-50` fills on `alpha-06` tracks, an `alpha-40` sparkline over an `alpha-05` area — alpha tokens so the marks keep their weight in dark. Status is the only other colour on a dashboard and it is reserved: `green-500` pass and `red-500` fail in bars, `success-surface`/`danger-surface` in badges and delta pills, always beside a word or an icon, never alone. Node identity on a chart comes from the node's family tile next to its label, not from the bar. Nothing on a dashboard uses `info-*`, `discovery-*` or the hue scales directly.

## Marks are thin and grids recede

Bars are at most 28px wide with a 4px rounded data-end on the top segment and 2px of ground between stacked segments. Lines are 1.5px. Grid lines use `border`; axes use `border-strong`; ticks are 11px `text-tertiary`. Values are direct labels in `text-secondary` tabular numerals, placed selectively (on hover, on the ends of Bars), never on every mark.

## Text wears text tokens

Titles, values, labels and legends stay in `text-emphasis`, `text`, `text-secondary` and `text-tertiary`; a coloured swatch beside them carries identity. Numbers use `font-variant-numeric: tabular-nums` so columns and tiles line up.

## Layout

A page is `aui-page` (1200px max, `space-8` sides) with a PageHeader, then `aui-stack` rows of `aui-grid` at `space-4` gaps: tiles four across (`aui-grid--tiles`), then 3:2 and 2:3 rows (`aui-grid--3-2`, `aui-grid--2-3`) that collapse to one column under 960px. Controls for time range and filters live in the PageHeader, never inside a card. An EmptyState takes the place of the whole grid when there is nothing to show, and names the action that produces data.

## Interaction

Every chart with a plot has a hover layer: a tooltip on BarChart columns, a title on Bars rows and Distribution segments. Table rows that open something are `aui-table--rows` and hover to `ghost-hover`. Cards do not hover; WorkflowCards do, with `shadow-300`.

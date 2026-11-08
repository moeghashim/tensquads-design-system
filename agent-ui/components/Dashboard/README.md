The Monitor page is the reference assembly of the data-display components: a PageHeader with the time range, four StatTiles, then a 3:2 row (BarChart card, Bars card) and a 2:3 row (Distribution card, DataTable card), all in `aui-grid` rows with `space-4` gaps on the `canvas` ground.

Reading order is the hierarchy: the headline numbers first, the trend second, the breakdowns third, the records last. Every number on the page comes from the same trace records, so a change in one tile is visible in the chart below it.

Build any new dashboard from these parts in this order; add a card only when it answers a question the existing ones do not.

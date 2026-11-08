A card is the unit of a dashboard: `panel` fill, 0.5px `panel-border`, `radius-2xl`, `space-5` padding. Its head holds a 14px/600 title and a 12px `text-tertiary` subtitle on the left and, when the body has two or more series, a legend on the right. The body is exactly one chart or table. An optional footer sits under a `border-subtle` rule for the time window, a count, or a "View all" link.

The consumer provides the title, the subtitle (say what the number means, not what the chart is), the body element and, when it applies, the legend pairs.

**Do**: one question per card; name the metric and its window in the subtitle. **Don't**: nest cards, put controls in the head (they belong in the page header), or stack two charts in one card.

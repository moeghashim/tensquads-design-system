The minimap appears in the bottom-right corner of the canvas once the graph is larger than the viewport: a 180×110 `panel` card with `radius-xl`, nodes as family-tinted rectangles at scale, and the current viewport as an `alpha-06` mask with an `alpha-20` outline. Dragging the mask pans the canvas.

It never shows labels or edges — it is for orientation, and the canvas is for reading. It hides again when the whole graph fits.

**Don't**: show it on an empty or small graph, or let it overlap the floating toolbar (the toolbar is centred; the minimap is right-aligned, both 16px from the bottom).

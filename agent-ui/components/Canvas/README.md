The canvas is the `canvas` ground with an optional 20px dot grid in `dot-grid`. Nodes are absolutely positioned on it; connectors are SVG paths underneath the nodes.

**Connectors** are 1.5px `edge` strokes with horizontal tangents and both control points at the midpoint x between the two ports (`AgentUI.edgePath`). A selected connector is `edge-selected`. While dragging a new connection the line is `connection-line`, 1px, dashed.

**Ports** sit on the card edge, centred on the head row (or on each branch row). The consumer computes port positions from layout; the component draws nothing else on the canvas.

**Do**: keep 40px or more between a node's right edge and the next node's left edge so the curve reads. Draw connectors before nodes so cards occlude lines.
**Don't**: add arrowheads, labels on edges, or coloured edges per family. Don't add a minimap unless the graph exceeds the viewport.

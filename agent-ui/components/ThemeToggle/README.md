The theme toggle is a ghost pill icon button that flips `data-theme` on `<html>` between `light` and `dark` and remembers the choice in `localStorage` (`agent-ui.theme`). It shows a sun in light and a moon in dark, and sits in the header's right-hand group, before the Evaluate button, and in the page header on the workflows home.

Every token carries a dark value, so nothing else changes; the design system's own dark values (derived tints, alpha inks for charts) are what the toggle reveals.

**Don't**: add a third "system" option in the control itself — follow the OS setting on first load, then let the toggle override it.

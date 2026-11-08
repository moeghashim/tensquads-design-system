The command palette opens with `⌘K` and is the fastest way to do anything in the builder. It floats at 12vh from the top on the `backdrop`: a 560px `surface-elevated` card with `radius-2xl` and `shadow-400`, a 16px search row with a search glyph and an `esc` key hint, a grouped list, and a footer with the key hints.

Groups, in order: **Add node** (every palette kind, with its tile), **Jump to** (nodes on the canvas by name, with their tile), **Actions** (Preview, Monitor, Evaluate, Code, Tidy layout, Toggle theme, New workflow — each with its shortcut as a `kbd` hint). Typing filters across all groups by label and keywords; a group with no matches disappears; no matches at all shows "No matches". `↑↓` move, `↵` selects, `esc` closes, as does a click on the backdrop. Rows are 40px, the selected row is `ghost-hover`.

The consumer provides the groups; each item carries a `kind` (shows the node tile) or an `icon`, an optional `hint`, and an `onSelect`.

**Do**: keep Add node first — it is what people reach for most. **Don't**: nest groups, or put destructive actions in the palette.

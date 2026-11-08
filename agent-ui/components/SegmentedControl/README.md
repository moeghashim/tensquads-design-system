A segmented control switches between exclusive modes: edit and preview in the header. Track is `segmented-track` with `radius-full` and 2px inset; each segment is a 32px pill; the pressed segment lifts to `segmented-thumb` with `shadow-100` and `text-emphasis`, the others sit in `text-secondary`.

The consumer provides two to four items with an icon and an `aria-label`; the thumb moves with `ease-move` over `duration-basic`.

**Do**: use icons only in the header (labels live in tooltips). **Don't**: use it for more than four options or for actions — it represents state.

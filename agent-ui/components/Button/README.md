Buttons are 32px tall by default (`control-md`), 500 weight, 14px label with a 16px icon at `space-1` gap; horizontal padding `space-4`. Header and toolbar buttons are pills (`radius-full`); everything else is `radius-lg`.

Variants: **solid** (`primary-solid`, `text-inverse`) for the one primary action on a screen — the `Code` button; **soft** (`primary-soft`) for secondary actions; **outline** (1px `primary-outline-border`) for tertiary; **ghost** for icon buttons and inline actions, hovering to `ghost-hover`; **danger** (`danger-solid`, white) for destructive confirms only. Disabled is `alpha-05` fill with `text-disabled`. Sizes: sm 28px, md 32px, lg 36px.

The consumer provides label and/or icon and an `aria-label` on icon-only buttons.

**Do**: one solid button per surface. Put the icon before the label.
**Don't**: use a coloured (blue) primary — primary is near-black in this system. Don't use outline and soft side by side for the same rank.

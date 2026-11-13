# Design notes — things to confirm in Figma

Per section 3.5 of the brief: where a Figma frame didn't specify something, it
is flagged here rather than invented. Each item says what the code does today
and what would replace it.

## Fonts

All three Moderna Library faces are on Google Fonts and load for real, served
from our own origin (`next/font` downloads them at build time, so there is no
runtime request to Google — which the privacy rules require).

| Figma family | Loaded as | Weights used |
|---|---|---|
| Special Gothic Expanded One | static 400 | 400 |
| Stack Sans Headline | variable 200–700 | 400, 700 |
| Stack Sans Text | variable 200–700 | 400, 500 |

The build prints `Failed to find font override values` for each. That is
benign: Next can't find published metrics for these very new families, so it
skips generating a metric-matched fallback face. The fonts themselves load
normally; the only cost is a slightly less smooth swap on a cold load.

## States the frame didn't show

The Desktop - 2 frame only contains default states. The Figma component
descriptions name more, so these were built from existing Bertie tokens and
should be checked against the real components.

| Component | State | What the code does |
|---|---|---|
| Input | Hover | `border/strong` — the token's own description says "Input hover", so this is likely right |
| Input | Focus | Global 2px `border/focus` ring, 2px offset. Thickness and offset are guesses |
| Input | Error | `error/default` border, `error/subtle` fill, `error/default` helper text |
| Input | Disabled | `surface/muted` fill, `text/disabled` text |
| Input | Leading icon | Not built — no screen needs one yet |
| Button | Hover | `primary/hover`, `secondary/hover`, `error/hover` |
| Button | Disabled | `surface/muted` fill, `text/disabled` label. Not specified anywhere |
| Dropzone | Drag-over | `border/focus` border, `primary/subtle` fill. Invented |
| Dropzone | Filled | Thumbnail + filename + Replace/Remove links. **Not designed at all** — worth a real design |
| Step | Complete | Not built. Needs the check icon, which this frame didn't export |

## Deliberate differences from the frame

- **Connector width.** The Step component description says 40px connectors; the
  frame uses 24px. The frame won. Narrowed to 12px below 640px so four steps fit
  on a phone.
- **Card vs Modal.** In Figma this is the Modal component, but the frame uses it
  as a card on the page with no scrim and no dismiss. It's named `Card` in code,
  because calling it Modal would imply a focus trap and Escape handling it
  doesn't have.
- **Dropzone text wrapping.** The Figma layers are `nowrap`; holding that would
  push the card wider than a phone screen, so they wrap and center.
- **Continue button.** Enabled at all times, matching the frame, which shows it
  blue over an empty form. Submitting with an empty business name shows an
  inline error instead of grey-out, so the reason is visible.

## Not specified

- **Mobile.** No mobile frame exists. The current behaviour: step labels hide
  below 768px (numbered indicators remain), card padding shrinks, Email/Phone
  stack below 640px. All of it is a guess.
- **Dark mode.** The Bertie / Color collection has a single "Light" mode, so no
  dark theme is implemented.
- **Focus ring geometry.** `border/focus` is the right colour; width and offset
  are not in the file.

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
| Button | Disabled | `surface/muted` fill, `text/disabled` label — **confirmed** by the disabled Continue in the items frames |
| Button | Outline / Tertiary | **Confirmed** by Back and Add service in the items frames: outline is a 1.5px primary border, tertiary is a primary label with no fill |
| Dropzone | Drag-over | `border/focus` border, `primary/subtle` fill. Invented |
| Dropzone | Filled | Thumbnail + filename + Replace/Remove links. **Not designed at all** — worth a real design |
| Step | Complete | **Built** — the items frames exported the check glyph |
| Tab | Hover | `surface/subtle` fill. The component lists a Hover state but no frame shows it |
| Select | Open | A native `<select>` draws its own menu. Figma uses the Menu component here, so the open list will not match the design |
| Banner | Neutral / Success / Warning / Error | Only Info appears in a frame. The others use the matching status tokens, and all five currently reuse the Info glyph — the other icons were never exported |
| Switch | all | Not a documented Moderna component — the frames contain flat "Switch (on)" / "Switch (off)" images. Rebuilt in CSS at 40x24 from those colours |

## Scope that is in the design but not in the brief

Two things appear in the items frames that `context.md` does not ask for. Both
are built, because they are in the design you asked me to implement, but they
are worth a decision.

- **Early payment discount (2/10 Net 30).** Not mentioned in the brief, and §10
  rules out automatic discounts. It is not an automatic discount: it is a
  conditional offer that never changes Total due, which is why the card shows
  the early figure and the full total side by side. The maths lives in
  `earlyPaymentOutcome` and is tested against the design's own numbers.
  Only "2/10 Net 30" is visible in the Figma Select, so the other three options
  in the menu are the conventional ones and are a guess.
- **Receipt attachments on expenses.** §10 lists these under "V1.1 ideas (not
  now)", but the expanded-expenses frame has an attach control on every row. It
  is wired to a file picker and the file is held in memory for the session only
  — nothing is uploaded or persisted. Say the word and I will pull it.

## Tax suggestion

The banner is built, but `getTaxSuggestion()` returns null for every address,
so it never renders today. That is deliberate: §7 says the rules must come from
a maintained table or a tax API rather than a model's general knowledge, and
which source to use is still open (§12). Showing a confident "Suggested from
your address" with nothing behind it would be worse than showing nothing.

`SAMPLE_SUGGESTION` in `lib/taxSuggestion.ts` holds the design's example copy so
the banner can be previewed. Pass it to `TotalsPanel` in place of the null to
see it. When a rules source is chosen, `getTaxSuggestion` is the only function
that has to change.

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
- **Describe-it tab has no Back / Continue.** The Desktop - 3 frame has only the
  heading, tabs and prompt — no actions row — so the code matches it. That does
  leave no way back from that tab; worth a look.
- **Vertical placement of the Describe-it tab.** Desktop - 3 centres its content
  in the viewport while Desktop - 4 pins it 170px from the top. Following both
  would make the page jump when you switch tabs, so both tabs are top-aligned
  at 170px.
- **Line-item column widths on mobile.** The frame's Qty 88 / Rate 128 /
  Amount 112 / Remove 40 columns total more than a phone is wide, so below
  640px the description takes its own line and the numeric fields share the
  next one.

## Not specified

- **Mobile.** No mobile frame exists. The current behaviour: step labels hide
  below 768px (numbered indicators remain), card padding shrinks, Email/Phone
  stack below 640px. All of it is a guess.
- **Dark mode.** The Bertie / Color collection has a single "Light" mode, so no
  dark theme is implemented.
- **Focus ring geometry.** `border/focus` is the right colour; width and offset
  are not in the file.

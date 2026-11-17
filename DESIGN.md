---
name: RaC Tracker
description: A sharp, flat field terminal for tracking Ratchet & Clank progress from your save.
colors:
  ink-void: "#0e1012"
  panel-iron: "#171a1d"
  rule-steel: "#2a2f34"
  edge-steel: "#646c74"
  text-bright: "#e8e6e1"
  text-dim: "#8f959b"
  bolt-gold: "#f2c230"
  scan-cyan: "#4fd1c5"
typography:
  title:
    fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "ui-monospace, 'Cascadia Mono', 'Roboto Mono', monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  count:
    fontFamily: "ui-monospace, 'Cascadia Mono', 'Roboto Mono', monospace"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.bolt-gold}"
    textColor: "{colors.ink-void}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.panel-iron}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "48px"
  tab:
    backgroundColor: "{colors.ink-void}"
    textColor: "{colors.text-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "56px"
  tab-active:
    backgroundColor: "{colors.panel-iron}"
    textColor: "{colors.bolt-gold}"
    rounded: "{rounded.none}"
  planet-row:
    backgroundColor: "{colors.panel-iron}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  status-chip:
    backgroundColor: "{colors.ink-void}"
    textColor: "{colors.text-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
---

<!-- SEED: proposed before implementation. Re-run /impeccable document once there's code to capture the real tokens and components. -->

# Design System: RaC Tracker

## Overview

**Creative North Star: "The Field Terminal"**

A rugged handheld readout clipped to a mechanic's belt. Dark, flat, exact. Every surface is a
hard-edged panel, every count is a number you can read at a glance, and gold appears only where
there is gold to find. It sits next to the game in split screen, so it stays quiet and lets the
game be the loud thing.

Density is medium: big counts, compact rows, large touch targets. Everything is square. No
rounding, no shadows, no gradients, no glow. Depth comes from two tones of panel and 1 px rules.
The app uses no game art, logos or fonts. It looks like a tool, not a fan poster.

**Key Characteristics:**
- Zero border radius everywhere, including focus rings, inputs and markers.
- One warm accent (bolt gold) for collectibles and the main action; one cool accent (scan cyan)
  for focus and selection only.
- Monospace labels and counts with tabular figures; sans-serif body.
- Flat panels separated by 1 px steel rules.
- Built for a phone in portrait or a narrow split-screen pane.

## Colors

A near-black workshop palette with one gold signal and one cyan cursor.

### Primary
- **Bolt Gold** (#f2c230): gold bolt markers and squares, the progress fill, the primary button,
  the active tab label. Means "a collectible" or "the thing to press".

### Secondary
- **Scan Cyan** (#4fd1c5): focus rings, the selected map marker, the current planet. Never used
  for collectibles.

### Neutral
- **Ink Void** (#0e1012): page background, tab bar.
- **Panel Iron** (#171a1d): cards, rows, map canvas.
- **Rule Steel** (#2a2f34): 1 px dividers and the map grid. Decorative only.
- **Edge Steel** (#646c74): borders of controls and empty squares (3:1 or better on both backgrounds).
- **Text Bright** (#e8e6e1): main text and counts.
- **Text Dim** (#8f959b): labels, secondary text, "read at" times.

### Named Rules
**The Gold Means Gold Rule.** Bolt Gold marks collectibles and the one primary action on a screen.
Nothing decorative is ever gold.

**The Cyan Is a Cursor Rule.** Scan Cyan only shows where you are: focus, selection, current
planet.

## Typography

**Body Font:** system sans (ui-sans-serif, system-ui, Segoe UI, Roboto)
**Label/Mono Font:** system mono (ui-monospace, Cascadia Mono, Roboto Mono)

**Character:** System fonts keep it light and native on Android. Mono labels in caps give the
readout feel; counts use mono so digits line up.

### Hierarchy
- **Count** (700, 1.75rem, 1): the big totals, e.g. `27/40`. Tabular figures.
- **Title** (700, 1.25rem, 1.2): planet names, screen titles.
- **Body** (400, 1rem, 1.45): hints and descriptions, max 60ch.
- **Label** (600, 0.75rem, 0.08em, uppercase): tab names, section labels, status chips.

### Named Rules
**The Numbers Line Up Rule.** Every count uses `font-variant-numeric: tabular-nums`.

## Layout

Mobile first. One column under 600 px, with a bottom tab bar (Progress, Planets, Map, Save).
At 900 px and up the tabs move to a left rail and Planets and Map can sit side by side. Must work
at 360 px wide (split screen next to OpenRAC).

Spacing uses a 4 px base: 4, 8, 12, 16, 24, 32. Screen padding 16 px. Rows 12 px vertical
padding. Touch targets at least 48 × 48 px.

## Elevation & Depth

Flat. No shadows anywhere. Depth is tonal: Ink Void is the floor, Panel Iron is a raised panel,
and a 1 px Rule Steel line separates neighbours. A selected thing gets a 2 px Scan Cyan outline,
not a lift.

### Named Rules
**The No-Lift Rule.** Nothing casts a shadow or floats. State changes color and outline only.

## Shapes

Hard corners only: `border-radius: 0` on everything, including buttons, inputs, checkboxes,
chips, progress bars, scrollbars where styleable, focus outlines and the map. Markers are squares
(found = filled gold, missing = 2 px gold outline, empty center). A diamond (a rotated square) is
allowed for special markers. No circles, pills or blobs. Icons are inline SVG drawn with
`stroke-linecap: square` and `stroke-linejoin: miter`.

### Named Rules
**The Square Rule.** If it has a corner, the corner is 90 degrees. No exceptions, no 1 px
"softening".

## Components

### Buttons
- **Shape:** square corners (0px), 48 px tall.
- **Primary:** Bolt Gold fill, Ink Void label text, label type in caps. One per screen ("Open save").
- **Secondary:** Panel Iron fill, Text Bright label, 1 px Edge Steel border.
- **Hover / Focus:** hover darkens the fill one step; focus is a 2 px Scan Cyan outline with
  2 px offset, square.

### Tabs
- **Style:** label type in caps, Text Dim on Ink Void, 56 px tall.
- **Active:** Panel Iron background, Bolt Gold label, a 2 px Bolt Gold bar along the top edge.

### Planet Row
- **Style:** Panel Iron, 1 px Rule Steel divider below. Planet name (Title) left, gold bolt
  squares and a `x/y` count (mono) right.
- **State:** a planet with everything found shows its count in Bolt Gold; the current planet has
  a 2 px Scan Cyan bar at the left.

### Progress Bar
- **Style:** a segmented bar, one 8 px square segment per item (40 for gold bolts), 2 px gaps.
  Found segments Bolt Gold, missing segments outlined in Edge Steel. No smooth fills.

### Map
- **Canvas:** Panel Iron with a Rule Steel square grid. North arrow and scale in label type.
- **Markers:** 16 px squares (hit area 48 px). Found = filled Bolt Gold. Missing = 2 px Bolt Gold
  outline. Selected = extra 2 px Scan Cyan outline. Height shown as a small mono label (▲ / ▼).
- **Detail panel:** a square bottom sheet with the hint, slot and status.

### Status Chip
- **Style:** label type, 1 px Edge Steel border, square. Shows "SAVE READ 21:42" or an error.

## Do's and Don'ts

### Do:
- **Do** use `border-radius: 0` on every element, including focus outlines.
- **Do** keep Bolt Gold for collectibles and the single primary action.
- **Do** use tabular mono figures for every count.
- **Do** keep touch targets at least 48 px and test at 360 px wide.
- **Do** respect `prefers-reduced-motion`; motion is short (120 ms) and only for state changes.

### Don't:
- **Don't** round anything, ever (no `rounded`, no pills, no circles, no circular spinners; use a
  segmented bar for loading).
- **Don't** use shadows, gradients, glows, blur or glassmorphism.
- **Don't** use game art, logos, screenshots, fonts or the games' own UI style in the app.
- **Don't** use an icon font or icon package; inline square-capped SVG only.
- **Don't** use color alone for found vs missing: filled vs outline must carry it too.

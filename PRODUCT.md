# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Plain static HTML, CSS and JavaScript (ES modules), no framework and no build step, installable
as a PWA and hosted on GitHub Pages. Proposed by Claude for a lightweight, simple app; the owner
asked for lightweight and simple.

## Users
The owner, playing Ratchet & Clank (2002) through OpenRAC on an Android phone, and other OpenRAC
players. They check what is left between play sessions or in split screen next to the game.

## Product Purpose
Read the player's own RaC1 save file and show their progress: gold bolts, skill points, gold
weapons, gadgets, weapons and planets, as a checklist and on a per-planet map. Success: a player
can see what they are missing on the current planet in a few taps, without ticking anything by
hand.

## Positioning
It reads the real save, so progress is never out of date or hand-entered. OpenRAC on Android
cannot draw overlays, so this is the tracker for phone players.

## Operating Context
Used on a phone, often one-handed or in split screen beside OpenRAC. The player picks
`saveN.bin` from the Files app (OpenRAC → Saves and settings → memcard). The save updates when
the player saves or flies to another planet. Also usable on a desktop browser.

## Capabilities and Constraints
- Read-only: never writes to the save.
- Offline, no account, no server, no analytics.
- Ships no game code, text, art or files; no game assets in the repo.
- Open source, GPL-3.0-or-later.
- RaC1 only for now; Going Commando later.
- Undecided: final name; whether Chrome on Android can re-read a picked file.

## Brand Commitments
Unofficial fan project, not affiliated with Sony or Insomniac Games. No game logos or art.
Owner requirement: no rounded corners anywhere.

## Evidence on Hand
Save format verified from OpenRAC's save editor (`launcher/core/src/save_edit.rs`). No real save
files or game data are in the repo; tests use a synthetic save.

## Product Principles
1. The save is the source of truth.
2. Lightweight beats clever: few files, no dependencies.
3. Fast on a phone: the current planet's missing bolts within three taps.
4. Respect the game's owners: no assets, no copied text.

## Accessibility & Inclusion
Touch targets at least 48 px; found vs missing never shown by color alone; respects reduced motion.

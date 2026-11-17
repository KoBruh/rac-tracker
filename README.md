# RaC Tracker (working name)

A small web app that reads your **Ratchet & Clank (2002)** save from
[OpenRAC](https://github.com/OpenRAC/OpenRAC) and shows what you still have to get. It shows
gold bolts, skill points, gold weapons, gadgets, weapons and planets as a checklist and on a map.

- Reads your real save. Nothing to tick by hand.
- Works offline. No account, no server, no tracking.
- Read-only. It never writes to your save.
- Works on Android in Chrome (OpenRAC on Android cannot load overlays, so the map lives here).
- Open source: GPL-3.0-or-later.

Ratchet & Clank 1 only for now. Going Commando comes later.

---

## Where your save is

OpenRAC keeps one memory card folder per disc. Each save slot is one file: `save0.bin` …
`save4.bin`.

**Android (OpenRAC app):** Files app → **OpenRAC** (sidebar) → **Saves and settings** →
`memcard` → your disc's serial folder → the game's folder → `saveN.bin`.

| Disc | Serial folder | Game folder |
|---|---|---|
| PAL v1.00 / v2.00 | `SCES_509.16` | `BESCES-50916RATCHET` |
| NTSC-U | `SCUS_971.99` | the one folder inside |
| NTSC-J | `SCPS_150.37` | the one folder inside |

Skip folders starting with `.backup_` and folders ending in `-coop`.

**Windows:** `%LOCALAPPDATA%\openrac\memcard\<serial>\<game folder>\saveN.bin`
**Linux:** `~/.local/share/openrac/memcard/...` **macOS:** `~/Library/Application Support/OpenRAC/memcard/...`

If you set a custom save folder in OpenRAC's settings, the `memcard` folder is there instead.

The game writes the save when you save, when the ship flies to another planet and, per the
decomp, right after you pick up a gold bolt.

---

## Stack

- Plain HTML, CSS and JavaScript (ES modules). No framework. No build step.
- One page, installable as a PWA (manifest + service worker).
- Tests: `node --test`. No dependencies.
- Hosting: GitHub Pages (static files).

```
index.html
css/app.css
js/            save.js (parser), data.js, ui-*.js, map.js
data/rac1/     planets.json, items.json, gold-bolts.json, skill-points.json
tests/         save.test.js (+ a synthetic save builder, no real game data)
DESIGN.md      design system (impeccable reads it)
PRODUCT.md     product record (impeccable reads it)
```

## Claude Code setup

```sh
claude plugin marketplace add pbakaus/impeccable
claude plugin install impeccable@impeccable
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

- **impeccable** for all UI work. `PRODUCT.md` and `DESIGN.md` are already written, so skip
  `/impeccable init`. Use `/impeccable craft`, `polish` and `audit` against them.
- **caveman** for dev talk and replies. Short. Code, paths and errors stay exact.

Rules for the agent:

- Keep it small. No new dependency without asking.
- **Never commit game data:** no disc images, no extracted files, no textures or models, no real
  saves. Put local test saves in `local/` (gitignored).
- Ask before guessing what something in the game means. Mark unverified data as unverified.

---

## The RaC1 save format (verified)

Source: OpenRAC's save editor, `launcher/core/src/save_edit.rs` (GPL-3.0). The same format is
used on every RaC1 disc (PAL v1/v2, NTSC-U, NTSC-J).

```
file:     u32 G (global section size), u32 L (level section size),
          global section, then 20 level sections     -> length = 8 + G + 20*L
section:  u32 dataSize, u32 crc16(data), data        (section size = 8 + dataSize)
data:     chunks until {s32 -1, u32 0}
chunk:    s32 id, u32 size, size bytes, zero padding to a multiple of 4
```

All values are little-endian.

**Checksum (crc16):** register starts at `0xEDB88320`. For each byte: `crc ^= byte << 8`, then
8 times: `crc = (crc & 0x8000) ? (crc << 1) ^ 0x1F45 : crc << 1`. Result is `crc & 0xFFFF`.
Data longer than `0x1800` gives 0. A stored 0 is always invalid.

| Chunk | Where | What |
|---|---|---|
| 0 | global | planet the save loads on (s32; -1 = empty slot) |
| 1 | global | bolts (u32) |
| 5 | global | story flags u8[128]: [4] Premium Nanotech, [5] Ultra Nanotech |
| 8 | global | skill points u8[32], first 30 used |
| 10 | global | item owned u8[37], by item id |
| 11 | global | item ever acquired u8[37] |
| 14 | global | planets unlocked u8[20] |
| 19 | global | max health (s32) |
| 30 | global | gold weapons u8[40], by item id |
| 3003 | level N | gold bolts found u8[4] |

**Gold bolts per level** (index = level, 40 in all):
`[0, 3, 4, 3, 1, 2, 2, 2, 2, 2, 2, 1, 2, 1, 4, 2, 2, 2, 3]`

**Levels:** 0 Veldin, 1 Novalis, 2 Aridia, 3 Kerwan, 4 Eudora, 5 Rilgar, 6 Nebula G34,
7 Umbris, 8 Batalia, 9 Gaspar, 10 Orxon, 11 Pokitaru, 12 Hoven, 13 Oltanis Orbit, 14 Oltanis,
15 Quartu, 16 Kalebo III, 17 Veldin Orbit, 18 Veldin (return).

**Item ids:** gadgets 2 Heli-Pack, 3 Thruster-Pack, 4 Hydro-Pack, 5 Sonic Summoner, 6 O2 Mask,
7 Pilot's Helmet, 12 Swingshot, 14 Taunter, 22 Hydrodisplacer, 26 Trespasser, 27 Metal
Detector, 28 Magneboots, 29 Grindboots, 30 Hoverboard, 31 Hologuise, 32 PDA, 33 Map-o-Matic,
34 Bolt Grabber, 35 Persuader. Weapons 9 Suck Cannon*, 10 Bomb Glove*, 11 Devastator*,
13 Visibomb Gun, 15 Blaster*, 16 Pyrocitor*, 17 Mine Glove*, 18 Walloper, 19 Tesla Claw*,
20 Glove of Doom*, 21 Morph-o-Ray*, 23 R.Y.N.O., 24 Drone Device, 25 Decoy Glove*.
(* = has a gold version; 10 in all.)

**Not known yet:**

- Which gold bolt on a planet is slot 0, 1, 2 or 3. Phase 2 works this out.
- Skill point names in save order. OpenRAC's launcher save editor reads them from the game's own
  text when it can open your disc (Skill points tab). Copy them from there, in order.

---

## Phase 1: Save reader and checklist

**Goal:** pick a `saveN.bin` and see your progress. Desktop and Android Chrome.

1. Scaffold the files above. Add a GPL-3.0-or-later `LICENSE`, `.gitignore` (`local/`) and a
   short `CREDITS.md`.
2. `js/save.js`: parse the format above. Check the header sizes, the file length and every
   checksum. Return a plain object: planet, bolts, nanotech, items owned, gold weapons, planets
   unlocked, skill points[30], gold bolts per level. Clear errors: "not a RaC1 save",
   "checksum failed", "empty slot".
3. Tests (`tests/save.test.js`): a small builder that writes a valid synthetic save (sections,
   chunks, crc16), then assertions for each field, a broken checksum, a wrong length and an
   empty slot. No real saves in the repo.
4. `data/rac1/*.json`: planets, items, gold bolt counts per level, 30 skill point slots (names
   blank until copied from the launcher).
5. UI, built with impeccable to `DESIGN.md`:
   - **Save:** a file picker (`<input type="file">`), the slot name and the time it was read.
   - **Progress:** totals: gold bolts x/40, skill points x/30, gold weapons x/10, gadgets and
     weapons, planets.
   - **Planets:** one row per planet with its gold bolts as squares (found / missing).
6. Keep the last save in memory only for now.

**Done when:**

- [ ] `node --test` passes.
- [ ] Deployed to GitHub Pages (from the start, so the owner can test on the phone).
- [ ] A real save loads on the phone in Chrome (picked from Files → OpenRAC) and the counts
  match OpenRAC's own save editor.
- [ ] No console errors. Works with the network off after the first load.

## Phase 2: Map tab

**Goal:** a **Map** tab per planet with every gold bolt as a marker. Missing bolts stand out.

1. **Get the positions on the phone with a script mod, `bolt-scout`** (no PC needed). Script
   mods are Luau, need no compiler and run on Android. Put it in the repo as a top-level folder
   `bolt-scout/` (`openrac-mod.json` + `main.luau`) plus a top-level `openrac-mods.json`:
   `{"format": 1, "mods": ["bolt-scout"]}`. The repo must be public. The owner installs it in
   OpenRAC → Mods → **Add from a link** with the repo URL (no release needed for script mods).

   What it does, each time a planet loads: lists every gold bolt with its level, slot and
   position, collected or not, and logs one line per bolt:
   `BOLT <level> <slot> <x> <y> <z>`. The owner flies to each planet once and sends the log.

   Verified facts (PAL, from the decomp and OpenRAC's SDK):
   - Gold bolt moby class (`oclass`, s16 at moby `+0xA6`) is **1134**.
   - Moby `pos` is a Vec4 at `+0x10` (x `+0x10`, y `+0x14`, z `+0x18`); `pvars` pointer at `+0x78`.
   - The bolt's slot is pvars `+0` (s32, `-1` = unused).
   - Current level: s32 at `0x0015EE84` (PAL).
   - Hook ids: `rac1.level.load_gameplay` (after it, every placed moby exists and none has run)
     and `rac1.moby.gold_bolt.update` (experimental; gets the moby; a collected bolt still runs
     its first update, then deletes itself).

   Not verified, check on the device:
   - Walking the moby array at level load. The decomp notes the array base at `0x00160018`
     and slots of `0x100` bytes, ending at a `0xFF` state. Prefer this: it finds all bolts at once.
   - Fallback: log from `rac1.moby.gold_bolt.update`, once per (level, slot). This can miss
     bolts that are far from Ratchet, because far mobys may not update.
   - NTSC-U addresses (current level, moby array): find them or ask the owner which disc.
   - How the owner gets the log out: the launcher's **Logs** on the game page. If copying is
     awkward, also write the lines to a string setting with `openrac.set_setting`, which lands in
     `plugins.json` (Files → OpenRAC → Games → `active/rac1/data/plugins/`), and let the tracker
     import that file.

   **Self-check:** the number of bolts logged per level must match the per-level counts above.

   Keep the mod tiny and read-only. Stay within the script time budget (2 ms per call).
   Commit the resulting numbers to `data/rac1/gold-bolts.json`; they come from the owner's own
   game.
2. Add a short hint per bolt **in your own words**. Use the Fandom gold bolt page to tell the
   bolts apart, but don't copy its text.
   Optional extra: `bolt-scout` can also log Ratchet's position (`openrac.fields.hero.position`)
   every few metres moved, so the map can draw the paths the owner has walked as a faint outline.
   This uses the owner's own play, not game files.
3. `js/map.js`: one SVG per planet. Fit all markers to the view with padding. Draw a light
   square grid, a north arrow and a scale. Square markers, filled = found, outline = missing.
   Tap a marker for its hint and status. Pan and pinch zoom, kept simple.
4. Planet picker at the top, defaulting to the planet the save is on. Filter: all / missing.
5. Height: show z as a small label (above / below) when bolts overlap.

**Done when:**

- [ ] `bolt-scout` installs from the link on the phone and logs every planet's bolts; counts
  match the per-level table.
- [ ] All 40 bolts are in `gold-bolts.json` with slot, position and hint.
- [ ] For at least three planets, picking up a bolt in game, saving and reloading flips the
  right marker. This proves the slot mapping.
- [ ] Map is usable one-handed on the phone, in portrait and in split screen.

## Phase 3: Android polish

**Goal:** it feels like an app on the phone.

1. PWA: manifest, icons (square, no game art), a service worker that caches the app.
   "Add to Home screen" works.
2. Remember the last save (its bytes in IndexedDB). Show "read at <time>" and a big
   **Re-open save** button. As far as we know, Chrome on Android cannot re-read a picked file
   by itself. Check this first; if it can, auto-refresh instead.
3. Small-width layout check (split screen next to OpenRAC, about 360 px).
4. Optional: let the player import a map outline image per planet that they made themselves
   (kept in IndexedDB on their device, never uploaded or committed), drawn under the markers.
5. Deploy to GitHub Pages. Tag `v0.1.0`.

**Done when:**

- [ ] Installs from Chrome, opens offline, reloads the last save.
- [ ] Re-open after a planet change shows the new bolts in under 3 taps.
- [ ] `/impeccable audit` has no open issues on Progress, Planets and Map.

---

## Report back after each phase

- What works, what doesn't, and the test output.
- Phase 1: the counts from the tracker vs OpenRAC's save editor for one real save.
- Phase 2: the `bolt-scout` log, the per-level counts, and the slot checks.
- Screenshots of each tab on the phone.

## Similar tools

- [Hyrule Tracker](https://github.com/jv-prado/hyrule-tracker): the model for this, for Ocarina
  of Time (MIT).
- OpenRAC launcher save editor: shows and edits gold bolts and skill points, no map or hints.
- [openrac-mods](https://github.com/OpenRAC/openrac-mods) item randomizer and Archipelago world:
  every RaC1 location with what it needs (GPL-3.0). Useful later for "available now".
- [Wrench](https://github.com/chaoticgd/wrench): PS2 level editor (GPL-3.0).
- [RCMemory](https://github.com/Programie/RCMemory): RaC memory addresses (PAL, PCSX2).
- In game: the Map-o-Matic (Kalebo III) marks gold bolts on the game's own map.

No existing web tracker for RaC1 was found.

## Credits and legal

Save format facts from OpenRAC (GPL-3.0). Ratchet & Clank is a trademark of Sony Interactive
Entertainment, developed by Insomniac Games. This is an unofficial fan project. It ships no game
code, text, art or files. You need your own disc and OpenRAC.

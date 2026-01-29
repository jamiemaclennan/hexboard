# Hexboard Demo

Small browser demo for hex-grid board game mechanics.

## Features
- Axial hex coordinates and rectangular 10x10 map.
- Artifacts and a single-hex character with facing.
- Arrow-key controls to move and turn.

## Run
- Open `index.html` in a browser.

## Controls
- Up: move forward
- Down: move backward
- Left: turn left
- Right: turn right

## Code Structure
- `src/core.js`: reusable classes (`Hex`, `HexMap`, `Artifact`, `Character`, `HexDirections`).
- `src/app.js`: app behavior, input handling, and a simple canvas renderer.
- `SPEC.md`: detailed specification of the current codebase.

## Reuse in Other Projects
Options (pick the one that fits your setup):
- Script include: copy `src/core.js` into another repo and load it via `<script>` to access `window.HexboardCore`.
- Module import: convert `src/core.js` to an ES module and import it from other apps.
- Package: publish the core as an npm package and install it where needed.

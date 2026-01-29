# Hexboard Demo Specification

This document describes the current codebase so it can be recreated by a human
or an AI assistant.

## Project overview
- Browser demo renders a 10x10 rectangular hex map and a single character.
- Arrow keys: Up/Down move forward/backward relative to facing; Left/Right turn.
- Core defines reusable hex/map/artifact/character data structures.
- App layer defines movement scheme and rendering.

## index.html
Purpose:
- Minimal page with HUD and canvas.
- Loads `src/core.js` then `src/app.js`.
- Includes a debug panel to surface runtime errors.

Structure:
- `<main class="app">`
  - `<section class="hud">` title + controls hint.
  - `<div id="debug" class="debug">` debug output.
  - `<canvas id="board" width="900" height="650">`.

Scripts:
- Inline script creates a debug line and hooks `error` and
  `unhandledrejection` to print messages into the debug div.
- External scripts:
  - `src/core.js`
  - `src/app.js`

## styles.css
Purpose:
- Warm, poster-like styling with a clean layout.

Key styles:
- `:root` defines colors (background, ink, panel, accent, grid).
- `body` uses serif font and a radial gradient background.
- `.app` centers content in a vertical grid.
- `.hud` is a bordered panel with a drop shadow.
- `.debug` shows small diagnostic text.
- `canvas#board` has a border and shadow.

## src/core.js
Purpose:
- Reusable game primitives; no rendering or input.
- Exposes a global `window.HexboardCore` for non-module use.

Global guard:
- If `window.HexboardCore` exists, logs a warning and does nothing.

Classes:
- `Hex(q, r)` axial coordinates.
  - `add(other)` returns new Hex.
  - `equals(other)` strict equality check.
- `HexDirections`
  - `left(facing)` returns `(facing + 1) % 6`.
  - `right(facing)` returns `(facing + 5) % 6`.
  - `opposite(facing)` returns `(facing + 3) % 6`.
  - Static `axial` array of 6 direction vectors:
    `(1,0)`, `(1,-1)`, `(0,-1)`, `(-1,0)`, `(-1,1)`, `(0,1)`.
- `Artifact(anchor, shapeOffsets = [Hex(0,0)])`
  - `getCells()` returns anchor + offsets.
  - `occupies(hex)` returns true if any cell matches.
- `Character(anchor, facing = 0, shapeOffsets)`
  - Extends `Artifact`.
  - Stores `facing` only (no movement logic).
- `HexMap(options = 2)`
  - If `options` is a number, generate a hexagon of that radius.
  - If `options` is `{ width, height }`, generate an odd-r rectangle.
  - Properties: `hexes`, `width`, `height`, `radius`, `artifacts`.
  - Static helpers:
    - `offsetToAxial(col, row)` for odd-r layout.
    - `axialToOffset(hex)` for odd-r layout.
  - Methods:
    - `_generateHexes(radius)` for hexagon.
    - `_generateRectangle(width, height)` for odd-r rectangle.
    - `addArtifact(artifact)`.
    - `contains(hex)` checks bounds for rectangles, membership for hexagon.

Export:
- `window.HexboardCore = { Hex, HexDirections, Artifact, Character, HexMap }`.

## src/app.js
Purpose:
- App behavior, movement scheme, and rendering.

Imports:
- Reads `Hex`, `HexMap`, `Character`, `HexDirections` from `window.HexboardCore`.
- Throws if core is missing.

Constants:
- `SQRT3 = Math.sqrt(3)`.

Class: `HexRenderer`
- Renders a pointy-top hex grid and a triangular character arrow.
- Constructor `(canvas, map)`:
  - Stores canvas/context/map.
  - Computes `size` to fit grid.
  - Computes `origin` to center grid.
- Helper methods:
  - `_computeSize(width, height)` uses canvas size and hex geometry.
  - `_hexToPixelRaw(hex)` axial to pixel in map space.
  - `_computeOrigin(hexes)` centers the grid.
  - `_hexToPixel(hex)` axial to pixel with origin.
  - `_hexCorners(center)` returns 6 corner points.
- `drawHex(hex)` outlines a hex.
- `drawCharacter(characterRef)` draws a triangular arrow.
  - Angle is `-facing * 60deg` to align with movement directions.
- `render(characterRef)` clears canvas, draws grid then character.

Class: `AppController`
- Implements the demo movement scheme and input handling.
- Constructor `(map, character, renderer)`.
- `tryMove(nextAnchor)` only commits if inside map.
- `moveForward()` and `moveBackward()` use `HexDirections.axial`.
- `turnLeft()` and `turnRight()` update facing.
- `handleKey(event)` handles Arrow keys and re-renders.

Bootstrap:
- Build a 10x10 map.
- Start character at the rectangle center:
  - `startCol = floor(width/2)`, `startRow = floor(height/2)`,
    converted via `HexMap.offsetToAxial`.
- Create `HexRenderer` and `AppController`.
- `keydown` → controller handler.
- Initial render.

## Expected behavior
- Map renders as a 10x10 hex rectangle.
- Character appears at the center and faces a hex edge.
- Arrow keys move/turn within map bounds.

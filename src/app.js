if (!window.HexboardCore) {
  throw new Error("HexboardCore missing. core.js did not load.");
}
const { Hex, HexMap, Character, HexDirections } = window.HexboardCore;
console.log("Hexboard app.js loaded.");

const SQRT3 = Math.sqrt(3);

class HexRenderer {
  constructor(canvas, map) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.map = map;
    this.size = this._computeSize(map.width, map.height);
    this.origin = this._computeOrigin(map.hexes);
  }

  _computeSize(width, height) {
    const sizeByWidth = this.canvas.width / (SQRT3 * (width + 0.5));
    const sizeByHeight = this.canvas.height / (1.5 * (height - 1) + 2);
    return Math.min(sizeByWidth, sizeByHeight) * 0.92;
  }

  _hexToPixelRaw(hex) {
    const x = this.size * (SQRT3 * hex.q + (SQRT3 / 2) * hex.r);
    const y = this.size * (1.5 * hex.r);
    return { x, y };
  }

  _computeOrigin(hexes) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    hexes.forEach((hex) => {
      const point = this._hexToPixelRaw(hex);
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    return {
      x: this.canvas.width / 2 - centerX,
      y: this.canvas.height / 2 - centerY,
    };
  }

  _hexToPixel(hex) {
    const x = this.origin.x + this.size * (SQRT3 * hex.q + (SQRT3 / 2) * hex.r);
    const y = this.origin.y + this.size * (1.5 * hex.r);
    return { x, y };
  }

  _hexCorners(center) {
    const corners = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = ((60 * i - 30) * Math.PI) / 180;
      corners.push({
        x: center.x + this.size * Math.cos(angle),
        y: center.y + this.size * Math.sin(angle),
      });
    }
    return corners;
  }

  drawHex(hex) {
    const corners = this._hexCorners(this._hexToPixel(hex));
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = "#a79b8d";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  drawCharacter(characterRef) {
    const center = this._hexToPixel(characterRef.anchor);
    const angle = (-characterRef.facing * 60 * Math.PI) / 180;
    const tip = {
      x: center.x + this.size * 0.6 * Math.cos(angle),
      y: center.y + this.size * 0.6 * Math.sin(angle),
    };
    const leftAngle = angle + (120 * Math.PI) / 180;
    const rightAngle = angle - (120 * Math.PI) / 180;
    const baseLeft = {
      x: center.x + this.size * 0.35 * Math.cos(leftAngle),
      y: center.y + this.size * 0.35 * Math.sin(leftAngle),
    };
    const baseRight = {
      x: center.x + this.size * 0.35 * Math.cos(rightAngle),
      y: center.y + this.size * 0.35 * Math.sin(rightAngle),
    };

    this.ctx.beginPath();
    this.ctx.moveTo(tip.x, tip.y);
    this.ctx.lineTo(baseLeft.x, baseLeft.y);
    this.ctx.lineTo(baseRight.x, baseRight.y);
    this.ctx.closePath();
    this.ctx.fillStyle = "#e36b3d";
    this.ctx.strokeStyle = "#202020";
    this.ctx.lineWidth = 2;
    this.ctx.fill();
    this.ctx.stroke();
  }

  render(characterRef) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.map.hexes.forEach((hex) => this.drawHex(hex));
    this.drawCharacter(characterRef);
  }
}

class AppController {
  constructor(map, character, renderer) {
    this.map = map;
    this.character = character;
    this.renderer = renderer;
  }

  tryMove(nextAnchor) {
    if (this.map.contains(nextAnchor)) {
      this.character.anchor = nextAnchor;
    }
  }

  moveForward() {
    const step = HexDirections.axial[this.character.facing];
    this.tryMove(this.character.anchor.add(step));
  }

  moveBackward() {
    const backDir = HexDirections.opposite(this.character.facing);
    const step = HexDirections.axial[backDir];
    this.tryMove(this.character.anchor.add(step));
  }

  turnLeft() {
    this.character.facing = HexDirections.left(this.character.facing);
  }

  turnRight() {
    this.character.facing = HexDirections.right(this.character.facing);
  }

  handleKey(event) {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        this.moveForward();
        break;
      case "ArrowDown":
        event.preventDefault();
        this.moveBackward();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.turnLeft();
        break;
      case "ArrowRight":
        event.preventDefault();
        this.turnRight();
        break;
      default:
        return;
    }
    this.renderer.render(this.character);
  }
}

const canvas = document.getElementById("board");
const map = new HexMap({ width: 10, height: 10 });
const startCol = Math.floor(map.width / 2);
const startRow = Math.floor(map.height / 2);
const startHex = HexMap.offsetToAxial(startCol, startRow);
const character = new Character(new Hex(startHex.q, startHex.r), 0);
map.addArtifact(character);

const renderer = new HexRenderer(canvas, map);
const controller = new AppController(map, character, renderer);
window.addEventListener("keydown", (event) => controller.handleKey(event));
renderer.render(character);

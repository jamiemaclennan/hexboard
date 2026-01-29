if (!window.HexboardCore) {
  throw new Error("HexboardCore missing. core.js did not load.");
}
const { Hex, HexMap, Character } = window.HexboardCore;
console.log("Hexboard app.js loaded.");

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const map = new HexMap({ width: 10, height: 10 });
const startCol = Math.floor(map.width / 2);
const startRow = Math.floor(map.height / 2);
const startHex = HexMap.offsetToAxial(startCol, startRow);
const character = new Character(new Hex(startHex.q, startHex.r), 0);
map.addArtifact(character);

const SQRT3 = Math.sqrt(3);

function computeSize(width, height) {
  const sizeByWidth = canvas.width / (SQRT3 * (width + 0.5));
  const sizeByHeight = canvas.height / (1.5 * (height - 1) + 2);
  return Math.min(sizeByWidth, sizeByHeight) * 0.92;
}

const size = computeSize(map.width, map.height);

function hexToPixelRaw(hex) {
  const x = size * (SQRT3 * hex.q + (SQRT3 / 2) * hex.r);
  const y = size * (1.5 * hex.r);
  return { x, y };
}

function computeOrigin(hexes) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  hexes.forEach((hex) => {
    const point = hexToPixelRaw(hex);
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    x: canvas.width / 2 - centerX,
    y: canvas.height / 2 - centerY,
  };
}

const origin = computeOrigin(map.hexes);

function hexToPixel(hex) {
  const x = origin.x + size * (SQRT3 * hex.q + (SQRT3 / 2) * hex.r);
  const y = origin.y + size * (1.5 * hex.r);
  return { x, y };
}

function hexCorners(center) {
  const corners = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = ((60 * i - 30) * Math.PI) / 180;
    corners.push({
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    });
  }
  return corners;
}

function drawHex(hex) {
  const center = hexToPixel(hex);
  const corners = hexCorners(center);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i += 1) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = "#a79b8d";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCharacter(characterRef) {
  const center = hexToPixel(characterRef.anchor);
  const angle = (-characterRef.facing * 60 * Math.PI) / 180;
  const tip = {
    x: center.x + size * 0.6 * Math.cos(angle),
    y: center.y + size * 0.6 * Math.sin(angle),
  };
  const leftAngle = angle + (120 * Math.PI) / 180;
  const rightAngle = angle - (120 * Math.PI) / 180;
  const baseLeft = {
    x: center.x + size * 0.35 * Math.cos(leftAngle),
    y: center.y + size * 0.35 * Math.sin(leftAngle),
  };
  const baseRight = {
    x: center.x + size * 0.35 * Math.cos(rightAngle),
    y: center.y + size * 0.35 * Math.sin(rightAngle),
  };

  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(baseLeft.x, baseLeft.y);
  ctx.lineTo(baseRight.x, baseRight.y);
  ctx.closePath();
  ctx.fillStyle = "#e36b3d";
  ctx.strokeStyle = "#202020";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map.hexes.forEach(drawHex);
  drawCharacter(character);
}

function tryMove(action) {
  const before = character.anchor;
  action();
  if (!map.contains(character.anchor)) {
    character.anchor = before;
  }
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      event.preventDefault();
      tryMove(() => character.moveForward());
      break;
    case "ArrowDown":
      event.preventDefault();
      tryMove(() => character.moveBackward());
      break;
    case "ArrowLeft":
      event.preventDefault();
      character.turnLeft();
      break;
    case "ArrowRight":
      event.preventDefault();
      character.turnRight();
      break;
    default:
      return;
  }
  draw();
});

draw();

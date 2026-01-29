if (!window.HexboardCore) {
  class Hex {
    constructor(q, r) {
      this.q = q;
      this.r = r;
    }

    add(other) {
      return new Hex(this.q + other.q, this.r + other.r);
    }

    equals(other) {
      return this.q === other.q && this.r === other.r;
    }
  }

  class HexDirections {
    static left(facing) {
      return (facing + 1) % 6;
    }

    static right(facing) {
      return (facing + 5) % 6;
    }

    static opposite(facing) {
      return (facing + 3) % 6;
    }
  }

  class Artifact {
    constructor(anchor, shapeOffsets = [new Hex(0, 0)]) {
      this.anchor = anchor;
      this.shapeOffsets = shapeOffsets;
    }

    getCells() {
      return this.shapeOffsets.map((offset) => this.anchor.add(offset));
    }

    occupies(hex) {
      return this.getCells().some((cell) => cell.equals(hex));
    }
  }

  class Character extends Artifact {
    constructor(anchor, facing = 0, shapeOffsets) {
      super(anchor, shapeOffsets);
      this.facing = facing;
    }

    turnLeft() {
      this.facing = HexDirections.left(this.facing);
    }

    turnRight() {
      this.facing = HexDirections.right(this.facing);
    }

    moveForward() {
      this.anchor = this.anchor.add(HexDirections.axial[this.facing]);
    }

    moveBackward() {
      const backDir = HexDirections.opposite(this.facing);
      this.anchor = this.anchor.add(HexDirections.axial[backDir]);
    }
  }

  class HexMap {
    constructor(options = 2) {
      this.artifacts = [];

      if (typeof options === "number") {
        this.radius = options;
        this.hexes = this._generateHexes(options);
        this.width = null;
        this.height = null;
        return;
      }

      const { width = 1, height = 1 } = options;
      this.width = width;
      this.height = height;
      this.radius = null;
      this.hexes = this._generateRectangle(width, height);
    }

    static offsetToAxial(col, row) {
      const rowShift = Math.floor((row - (row & 1)) / 2);
      return new Hex(col - rowShift, row);
    }

    static axialToOffset(hex) {
      const row = hex.r;
      const rowShift = Math.floor((row - (row & 1)) / 2);
      const col = hex.q + rowShift;
      return { col, row };
    }

    _generateHexes(radius) {
      const hexes = [];
      for (let q = -radius; q <= radius; q += 1) {
        const rMin = Math.max(-radius, -q - radius);
        const rMax = Math.min(radius, -q + radius);
        for (let r = rMin; r <= rMax; r += 1) {
          hexes.push(new Hex(q, r));
        }
      }
      return hexes;
    }

    _generateRectangle(width, height) {
      const hexes = [];
      for (let row = 0; row < height; row += 1) {
        const rowShift = Math.floor((row - (row & 1)) / 2);
        for (let col = 0; col < width; col += 1) {
          const q = col - rowShift;
          const r = row;
          hexes.push(new Hex(q, r));
        }
      }
      return hexes;
    }

    addArtifact(artifact) {
      this.artifacts.push(artifact);
    }

    contains(hex) {
      if (this.width !== null && this.height !== null) {
        const { col, row } = HexMap.axialToOffset(hex);
        return col >= 0 && col < this.width && row >= 0 && row < this.height;
      }
      return this.hexes.some((cell) => cell.equals(hex));
    }
  }

  HexDirections.axial = [
    new Hex(1, 0),
    new Hex(1, -1),
    new Hex(0, -1),
    new Hex(-1, 0),
    new Hex(-1, 1),
    new Hex(0, 1),
  ];

  window.HexboardCore = {
    Hex,
    HexDirections,
    Artifact,
    Character,
    HexMap,
  };
} else {
  console.warn("HexboardCore already defined; skipping redefinition.");
}

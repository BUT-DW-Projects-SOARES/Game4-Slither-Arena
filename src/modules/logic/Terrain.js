import { getRandomInt } from '../../utils.js';

/**
 * Codes d'etat utilises dans la matrice du terrain.
 * 0: cellule vide, 1: rocher, 2: cellule occupee (bordure ou serpent).
 */
export const TERRAIN_CODES = Object.freeze({
  EMPTY: 0,
  ROCK: 1,
  BLOCKED: 2,
});

/**
 * Modele de terrain base sur une matrice 2D.
 * Conserve une couche statique (bordures + rochers) et une couche dynamique (serpents).
 */
export default class Terrain {
  /**
   * @param {number} size - Nombre de cellules sur un cote.
   * @param {Object} [options]
   * @param {number} [options.rockRatio=0] - Densite cible de rochers dans la zone interne.
   * @param {number} [options.minRocks=0] - Nombre minimum de rochers.
   * @param {number} [options.maxRocks=0] - Nombre maximum de rochers.
   */
  constructor(size, { rockRatio = 0, minRocks = 0, maxRocks = 0 } = {}) {
    this.size = size;
    this.rockRatio = rockRatio;
    this.minRocks = minRocks;
    this.maxRocks = maxRocks;

    /** @type {number[][]} Matrice [j][i] */
    this.cells = [];
    /** @type {Set<string>} Cellules actuellement marquees comme serpents */
    this._snakeCells = new Set();

    this.reset();
  }

  /**
   * Reinitialise completement la matrice du terrain.
   */
  reset() {
    this.cells = Array.from({ length: this.size }, () =>
      Array(this.size).fill(TERRAIN_CODES.EMPTY),
    );
    this._snakeCells.clear();

    this._initBorders();
    this._seedRocks();
  }

  /** @private */
  _initBorders() {
    const last = this.size - 1;

    for (let i = 0; i < this.size; i++) {
      this.cells[0][i] = TERRAIN_CODES.BLOCKED;
      this.cells[last][i] = TERRAIN_CODES.BLOCKED;
    }

    for (let j = 0; j < this.size; j++) {
      this.cells[j][0] = TERRAIN_CODES.BLOCKED;
      this.cells[j][last] = TERRAIN_CODES.BLOCKED;
    }
  }

  /** @private */
  _seedRocks() {
    const interior = Math.max(0, (this.size - 2) * (this.size - 2));
    const target = Math.min(
      this.maxRocks,
      Math.max(this.minRocks, Math.floor(interior * this.rockRatio)),
    );

    let placed = 0;
    let attempts = 0;
    const maxAttempts = Math.max(target * 15, 100);

    while (placed < target && attempts < maxAttempts) {
      const i = getRandomInt(this.size - 2) + 1;
      const j = getRandomInt(this.size - 2) + 1;

      if (this.cells[j][i] === TERRAIN_CODES.EMPTY) {
        this.cells[j][i] = TERRAIN_CODES.ROCK;
        placed++;
      }
      attempts++;
    }
  }

  /**
   * @param {number} i
   * @param {number} j
   * @returns {boolean}
   */
  isInside(i, j) {
    return i >= 0 && i < this.size && j >= 0 && j < this.size;
  }

  /**
   * @param {number} i
   * @param {number} j
   * @returns {number}
   */
  getCell(i, j) {
    if (!this.isInside(i, j)) return TERRAIN_CODES.BLOCKED;
    return this.cells[j][i];
  }

  /**
   * @param {number} i
   * @param {number} j
   * @returns {boolean}
   */
  isObstacleCell(i, j) {
    const cell = this.getCell(i, j);
    return cell === TERRAIN_CODES.ROCK || cell === TERRAIN_CODES.BLOCKED;
  }

  /**
   * @param {number} i
   * @param {number} j
   * @returns {boolean}
   */
  isSpawnableCell(i, j) {
    return this.getCell(i, j) === TERRAIN_CODES.EMPTY;
  }

  /**
   * Libere les cellules dynamiques laissees par les serpents au tick precedent.
   */
  clearSnakeLayer() {
    this._snakeCells.forEach((key) => {
      const [i, j] = key.split(',').map(Number);
      if (this.isInside(i, j) && this.cells[j][i] === TERRAIN_CODES.BLOCKED) {
        this.cells[j][i] = TERRAIN_CODES.EMPTY;
      }
    });
    this._snakeCells.clear();
  }

  /**
   * Synchronise la couche dynamique avec la position actuelle des serpents vivants.
   * @param {Serpent[]} serpents
   */
  syncSnakes(serpents = []) {
    this.clearSnakeLayer();

    serpents.forEach((serpent) => {
      if (serpent.dead) return;
      serpent.anneaux.forEach((anneau) => {
        if (!this.isInside(anneau.i, anneau.j)) return;
        if (this.cells[anneau.j][anneau.i] !== TERRAIN_CODES.EMPTY) return;

        this.cells[anneau.j][anneau.i] = TERRAIN_CODES.BLOCKED;
        this._snakeCells.add(`${anneau.i},${anneau.j}`);
      });
    });
  }
}

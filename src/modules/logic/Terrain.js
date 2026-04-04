/**
 * Codes d'etat utilises dans la matrice du terrain.
 * 0: cellule vide, 1: reserve, 2: cellule occupee (serpent).
 */
export const TERRAIN_CODES = Object.freeze({
  EMPTY: 0,
  ROCK: 1,
  BLOCKED: 2,
});

/**
 * Modele de terrain base sur une matrice 2D.
 * Conserve une couche dynamique d'occupation des serpents.
 */
export default class Terrain {
  /**
   * @param {number} size - Nombre de cellules sur un cote.
   */
  constructor(size) {
    this.size = size;

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

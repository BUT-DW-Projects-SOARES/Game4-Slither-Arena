/**
 * Constantes globales du jeu Slither Arena.
 * @module constants
 */

const styles = getComputedStyle(document.documentElement);

/**
 * Palette de couleurs extraite des propriétés CSS du document.
 * @type {Object}
 * @property {string} snakeHead - Couleur de la tête du serpent.
 * @property {string} snakeBody - Couleur du corps du serpent.
 * @property {string} snakeTail - Couleur de la queue du serpent.
 * @property {string} apple - Couleur des pommes.
 * @property {string} powerup - Couleur des powerups.
 * @property {string} grid - Couleur des points de la grille.
 */
export const COLORS = {
  snakeHead: styles.getPropertyValue("--canvas-snake-head").trim() || "#16a34a",
  snakeBody: styles.getPropertyValue("--canvas-snake-body").trim() || "#4ade80",
  snakeTail: styles.getPropertyValue("--canvas-snake-tail").trim() || "#86efac",
  apple: styles.getPropertyValue("--canvas-apple").trim() || "#f43f5e",
  powerup: styles.getPropertyValue("--canvas-powerup").trim() || "#fbbf24",
  grid:
    styles.getPropertyValue("--canvas-grid").trim() ||
    "rgba(255, 255, 255, 0.04)",
};

/** @type {number} Taille d'une cellule de la grille en pixels */
export const TAILLE_CELLULE = 20;

/** @type {number} Nombre de cellules par côté de la grille */
export const nbCells = 30;

/** @type {number} Taille totale du canvas en pixels CSS */
export const CSS_SIZE = 600;


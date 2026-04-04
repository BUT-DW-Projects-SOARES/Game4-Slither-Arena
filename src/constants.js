/**
 * Constantes globales du jeu Slither Arena.
 * @module constants
 */

const styles = getComputedStyle(document.documentElement);

/**
 * Palette de couleurs extraite des propriétés CSS du document.
 * @type {Object}
 */
export const COLORS = {
  snakeHead: styles.getPropertyValue('--canvas-snake-head').trim() || '#16a34a',
  snakeBody: styles.getPropertyValue('--canvas-snake-body').trim() || '#4ade80',
  snakeTail: styles.getPropertyValue('--canvas-snake-tail').trim() || '#86efac',
  apple: styles.getPropertyValue('--canvas-apple').trim() || '#f43f5e',
  redIA: styles.getPropertyValue('--canvas-ia').trim() || '#ef4444',
  redIABody: styles.getPropertyValue('--canvas-ia-body').trim() || '#991b1b',
  powerup: styles.getPropertyValue('--canvas-powerup').trim() || '#fbbf24',
  canvasGrid: styles.getPropertyValue('--canvas-grid').trim() || '#000000',
  terrainRock: styles.getPropertyValue('--canvas-rock').trim() || '#334155',
  terrainBorder: styles.getPropertyValue('--canvas-border').trim() || '#475569',
  eyeWhite: styles.getPropertyValue('--canvas-eye-white').trim() || '#ffffff',
  eyePupil: styles.getPropertyValue('--canvas-eye-pupil').trim() || '#111827',
};

/**
 * Couleurs d'interface utilisées côté JavaScript (boutons, etc.).
 * @type {Object}
 */
export const UI_COLORS = {
  debugButtonOn: styles.getPropertyValue('--ui-debug-on').trim() || '#10b981',
  debugButtonOff: styles.getPropertyValue('--ui-debug-off').trim() || '#ef4444',
};

/**
 * Couleurs des messages de logs techniques (%c) côté JavaScript.
 * @type {Object}
 */
export const LOG_COLORS = {
  debug: styles.getPropertyValue('--ui-log-debug').trim() || '#3b82f6',
  spawn: COLORS.powerup,
  collision: COLORS.powerup,
  itemApple: COLORS.snakeBody,
  itemPenalty: COLORS.redIA,
  powerup: COLORS.powerup,
};

/**
 * Configuration globale du gameplay pour un équilibrage facile.
 * @type {Object}
 */
export const GAME_CONFIG = {
  DEBUG_MODE: false,
  FPS_INITIAL: 10,
  FPS_MAX: 20,
  SCORE_FOR_SPEED_INCREASE: 12,

  AI_SPAWN_SCORE_INTERVAL: 10,
  AI_MOVE_CHANCE: 0.9,
  AI_RANDOM_MOVE_CHANCE: 0.35,

  POWERUP_SPAWN_CHANCE: 0.05,
  POWERUP_DURATION: 8000,

  SCORE_POWERUP: 5,
  SCORE_APPLE: 1,
  SCORE_AI_PENALTY: -1,
  SCORE_KILL_AI: 5,
};

/** @type {number} Taille d'une cellule de la grille en pixels */
export const TAILLE_CELLULE = 20;

/** @type {number} Nombre de cellules par côté de la grille */
export const NB_CELLS = 30;

/** @type {number} Taille totale du canvas en pixels CSS */
export const CSS_SIZE = 600;

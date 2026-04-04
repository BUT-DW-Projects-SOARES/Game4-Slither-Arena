import { GAME_CONFIG } from '../../constants.js';

/**
 * Gère l'état d'une session de jeu (score, difficulté, statut).
 * Centralise les données volatiles pour alléger le moteur principal.
 */
export default class GameState {
  constructor() {
    /** @type {number} Score actuel */
    this.score = 0;
    /** @type {number} Frames Per Second cibles */
    this.fps = GAME_CONFIG.FPS_INITIAL;
    /** @type {number} Intervalle entre deux mouvements (ms) */
    this.moveInterval = 1000 / this.fps;
    /** @type {number} Dernier timestamp de mouvement */
    this.lastMoveTime = 0;

    /** @type {boolean} Jeu en cours */
    this.gameRunning = false;
    /** @type {boolean} Jeu en pause */
    this.isPaused = false;

    /** @type {number} Score du dernier spawn d'IA pour éviter les doublons */
    this._lastAISpawnScore = -1;
  }

  /**
   * Réinitialise l'état pour une nouvelle partie.
   */
  reset() {
    this.score = 0;
    this.fps = GAME_CONFIG.FPS_INITIAL;
    this.moveInterval = 1000 / this.fps;
    this.lastMoveTime = 0;
    this.gameRunning = true;
    this.isPaused = false;
    this._lastAISpawnScore = -1;
  }

  /**
   * Met à jour le score et recalcule la difficulté.
   * @param {number} newScore - Le nouveau score.
   * @returns {boolean} True si la difficulté (FPS) a changé.
   */
  updateScore(newScore) {
    const oldFps = this.fps;
    this.score = newScore;

    // Calcul de la nouvelle vitesse
    this.fps = Math.min(
      GAME_CONFIG.FPS_MAX,
      GAME_CONFIG.FPS_INITIAL +
        Math.floor(this.score / GAME_CONFIG.SCORE_FOR_SPEED_INCREASE),
    );

    this.moveInterval = 1000 / this.fps;
    return this.fps !== oldFps;
  }

  /**
   * Vérifie si une nouvelle IA doit apparaître selon le score.
   * @returns {boolean}
   */
  shouldSpawnAI() {
    const canSpawn =
      this.score > 0 &&
      this.score % GAME_CONFIG.AI_SPAWN_SCORE_INTERVAL === 0 &&
      this._lastAISpawnScore !== this.score;

    if (canSpawn) {
      this._lastAISpawnScore = this.score;
      return true;
    }
    return false;
  }

  /**
   * Bascule l'état de pause.
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastMoveTime = 0; // Reset pour éviter un saut après pause
    }
  }
}

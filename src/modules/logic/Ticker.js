import { GAME_CONFIG } from "../../constants.js";

/**
 * Gère la boucle de rendu et la cadence de mise à jour (Tick).
 * Encapsule requestAnimationFrame et le calcul du delta-time.
 */
export default class Ticker {
  /**
   * @param {Function} onTick - Callback appelé pour la logique (cadencé).
   * @param {Function} onRender - Callback appelé pour le rendu (à chaque frame).
   */
  constructor(onTick, onRender) {
    this.onTick = onTick;
    this.onRender = onRender;

    /** @type {number|null} */
    this.animationFrameId = null;
    /** @type {number} Timestamp du dernier mouvement */
    this.lastMoveTime = 0;
    /** @type {boolean} */
    this.running = false;
    /** @type {boolean} */
    this.paused = false;
  }

  /**
   * Démarre ou redémarre la boucle.
   */
  start() {
    this.running = true;
    this.paused = false;
    this.lastMoveTime = 0;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame((t) => this._loop(t));
  }

  /**
   * Arrête définitivement la boucle.
   */
  stop() {
    this.running = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  /**
   * Met la boucle en pause (arrête les ticks mais pas forcément le rendu si besoin).
   */
  pause() {
    this.paused = true;
  }

  /**
   * Reprend la boucle.
   */
  resume() {
    this.paused = false;
  }

  /**
   * Définit dynamiquement la méthode pour récupérer l'intervalle cible.
   * @param {Function} method - Fonction retournant l'intervalle en ms.
   */
  setGetIntervalMethod(method) {
    this._getIntervalMethod = method;
  }

  /**
   * Boucle interne de gestion du temps.
   * @private
   */
  _loop(timestamp) {
    if (!this.running) return;

    if (!this.paused) {
      if (!this.lastMoveTime) this.lastMoveTime = timestamp;
      const deltaTime = timestamp - this.lastMoveTime;

      const interval = this._getIntervalMethod
        ? this._getIntervalMethod()
        : 1000 / GAME_CONFIG.FPS_INITIAL;

      // Sécurité anti-lag (saut de temps trop long)
      if (deltaTime > 1000) {
        this.lastMoveTime = timestamp;
      } else if (deltaTime >= interval) {
        this.onTick(timestamp);
        this.lastMoveTime = timestamp;
      }
    }

    // Le rendu se fait à chaque frame pour la fluidité (animations, particules)
    this.onRender(timestamp);

    this.animationFrameId = requestAnimationFrame((t) => this._loop(t));
  }
}

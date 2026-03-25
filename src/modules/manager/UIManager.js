/**
 * Centralise les interactions avec le DOM et la mise à jour de l'interface utilisateur.
 */
export default class UIManager {
  constructor() {
    /** @type {HTMLElement} Élément d'affichage du score */
    this.scoreValElem = document.getElementById("score-val");
    /** @type {HTMLElement} Élément d'affichage de la vitesse */
    this.speedValElem = document.getElementById("speed-val");
    /** @type {HTMLElement} Overlay du menu principal */
    this.menuOverlay = document.getElementById("game-menu-overlay");
    /** @type {HTMLElement} Titre du menu */
    this.menuTitle = document.getElementById("menu-title");
    /** @type {HTMLElement} Sous-titre du menu */
    this.menuSubtitle = document.getElementById("menu-subtitle");
    /** @type {HTMLElement} Section d'affichage du score final */
    this.menuScoreDisplay = document.getElementById("menu-score-display");
    /** @type {HTMLElement} Valeur du score final */
    this.menuScoreVal = document.getElementById("menu-score-val");
    /** @type {HTMLElement} Bouton d'action principal (Démarrer/Continuer) */
    this.menuActionBtn = document.getElementById("menu-action-btn");
    /** @type {HTMLElement} Bouton de redémarrage (quand pause) */
    this.menuRestartBtn = document.getElementById("menu-restart-btn");
    /** @type {HTMLElement} Bouton de debug (quand pause) */
    this.menuDebugBtn = document.getElementById("menu-debug-btn");

    // Modaux additionnels
    this.confirmOverlay = document.getElementById("confirm-modal");
    this.confirmYesBtn = document.getElementById("confirm-yes-btn");
    this.confirmNoBtn = document.getElementById("confirm-no-btn");

    this.infoOverlay = document.getElementById("info-modal");
    this.infoCloseBtn = document.getElementById("info-close");
  }

  /**
   * Met à jour le HUD (Score et Vitesse).
   * @param {number} score
   * @param {number} fps
   */
  updateHUD(score, fps) {
    if (this.scoreValElem) this.scoreValElem.textContent = score;
    if (this.speedValElem) {
      this.speedValElem.textContent = (fps / 10).toFixed(1) + "x";
    }
  }

  /**
   * Affiche le menu ou l'écran de pause.
   * @param {string} title
   * @param {string} subtitle
   * @param {boolean} showScore
   * @param {number} score
   * @param {string} btnText
   * @param {boolean} showRestart
   */
  showMenu(
    title,
    subtitle,
    showScore = false,
    score = 0,
    btnText = "Rejouer",
    showRestart = false,
    showDebug = false,
  ) {
    this.menuTitle.textContent = title;
    this.menuSubtitle.textContent = subtitle;
    this.menuActionBtn.textContent = btnText;

    if (showScore) {
      this.menuScoreDisplay.classList.remove("hidden");
      this.menuScoreVal.textContent = score;
    } else {
      this.menuScoreDisplay.classList.add("hidden");
    }

    if (showDebug) {
      this.menuDebugBtn.classList.remove("hidden");
    } else {
      this.menuDebugBtn.classList.add("hidden");
    }

    if (showRestart) {
      this.menuRestartBtn.classList.remove("hidden");
    } else {
      this.menuRestartBtn.classList.add("hidden");
    }

    this.menuOverlay.classList.remove("hidden");
  }

  /**
   * Cache le menu principal.
   */
  hideMenu() {
    this.menuOverlay.classList.add("hidden");
  }

  /**
   * Vérifie si le menu est actuellement visible.
   * @returns {boolean}
   */
  isMenuVisible() {
    return !this.menuOverlay.classList.contains("hidden");
  }

  /**
   * Affiche le modal de confirmation personnalisé.
   */
  showConfirm() {
    this.confirmOverlay.classList.remove("hidden");
  }

  /**
   * Cache le modal de confirmation.
   */
  hideConfirm() {
    this.confirmOverlay.classList.add("hidden");
  }

  /**
   * Affiche le modal d'information / aide.
   */
  showInfo() {
    this.infoOverlay.classList.remove("hidden");
  }

  /**
   * Cache le modal d'information.
   */
  hideInfo() {
    this.infoOverlay.classList.add("hidden");
  }

  /**
   * Met à jour l'apparence du bouton de debug pour refléter l'état actuel.
   * @param {boolean} active - Si le mode debug est activé.
   */
  updateDebugButton(active) {
    if (active) {
      this.menuDebugBtn.classList.add("active");
      this.menuDebugBtn.textContent = "Debug: ON";
      this.menuDebugBtn.style.backgroundColor = "#10b981"; // Vert
    } else {
      this.menuDebugBtn.classList.remove("active");
      this.menuDebugBtn.textContent = "Debug: OFF";
      this.menuDebugBtn.style.backgroundColor = "#ef4444"; // Rouge
    }
  }
}

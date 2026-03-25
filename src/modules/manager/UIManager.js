/**
 * Centralise les interactions avec le DOM et la mise à jour de l'interface utilisateur.
 */
export default class UIManager {
  constructor() {
    this.scoreValElem = document.getElementById("score-val");
    this.speedValElem = document.getElementById("speed-val");
    this.menuOverlay = document.getElementById("game-menu-overlay");
    this.menuTitle = document.getElementById("menu-title");
    this.menuSubtitle = document.getElementById("menu-subtitle");
    this.menuScoreDisplay = document.getElementById("menu-score-display");
    this.menuScoreVal = document.getElementById("menu-score-val");
    this.menuActionBtn = document.getElementById("menu-action-btn");
    this.menuRestartBtn = document.getElementById("menu-restart-btn");
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

    if (showRestart) {
      this.menuRestartBtn.classList.remove("hidden");
    } else {
      this.menuRestartBtn.classList.add("hidden");
    }

    this.menuOverlay.classList.remove("hidden");
  }

  hideMenu() {
    this.menuOverlay.classList.add("hidden");
  }

  isMenuVisible() {
    return !this.menuOverlay.classList.contains("hidden");
  }
}

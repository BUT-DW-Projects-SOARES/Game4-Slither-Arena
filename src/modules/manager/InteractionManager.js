/**
 * Gère les interactions utilisateur complexes et lie l'UI au moteur.
 * Centralise les écouteurs d'événements DOM, clavier et tactiles.
 */
export default class InteractionManager {
  /**
   * @param {Object} systems - Références vers les systèmes nécessaires (ui, state, input, etc).
   * @param {Object} callbacks - Fonctions de rappel pour les actions majeures.
   */
  constructor(systems, callbacks) {
    this.ui = systems.ui;
    this.state = systems.state;
    this.input = systems.input;
    this.score = systems.score;
    
    this.onStart = callbacks.onStart;
    this.onTogglePause = callbacks.onTogglePause;
    this.onRestartRequest = callbacks.onRestartRequest;
    
    this._initUI();
    this._initKeyboard();
    this._initMobile();
  }

  /**
   * Liaison des boutons de l'interface graphique.
   * @private
   */
  _initUI() {
    // Bouton d'action principal (Menu Accueil / Pause)
    this.ui.menuActionBtn.addEventListener("click", () => {
      if (this.state.isPaused) this.onTogglePause();
      else {
        this.ui.hideMenu();
        this.onStart();
      }
    });

    // Bouton de redémarrage (Game Over / Pause)
    this.ui.menuRestartBtn.addEventListener("click", () => {
      this.ui.hideMenu();
      this.onStart();
    });

    // Menus d'information et statistiques
    document.getElementById("info-btn")?.addEventListener("click", () => this.ui.showInfo());
    document.getElementById("leaderboard-btn")?.addEventListener("click", () => this.score.show());

    // Contrôles du tableau des scores
    document.getElementById("scoreboard-close")?.addEventListener("click", () => this.score.hide());
    document.getElementById("scoreboard-clear")?.addEventListener("click", () => this.score.clearScores());
    document.getElementById("scoreboard-overlay")?.addEventListener("click", (e) => {
        if (e.target.id === "scoreboard-overlay") this.score.hide();
    });

    // Modales de confirmation et information
    this.ui.confirmYesBtn.addEventListener("click", () => {
      this.ui.hideConfirm();
      this.onStart();
    });
    this.ui.confirmNoBtn.addEventListener("click", () => this.ui.hideConfirm());
    this.ui.infoCloseBtn.addEventListener("click", () => this.ui.hideInfo());
    
    // Fermeture par clic sur overlay
    this.ui.confirmOverlay.addEventListener("click", (e) => {
        if (e.target.id === "confirm-modal") this.ui.hideConfirm();
    });
    this.ui.infoOverlay.addEventListener("click", (e) => {
        if (e.target.id === "info-modal") this.ui.hideInfo();
    });
  }

  /**
   * Raccourcis clavier globaux.
   * @private
   */
  _initKeyboard() {
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      
      // Pause (P)
      if (key === "p" && this.state.gameRunning) {
          this.onTogglePause();
      }
      
      // Information (I)
      if (key === "i") {
          this.ui.showInfo();
      }
      
      // Recommencer (R)
      if (key === "r") {
        if (this.state.gameRunning && !this.state.isPaused) {
            this.onRestartRequest();
        } else if (this.ui.isMenuVisible() || !this.state.gameRunning) {
            this.ui.hideMenu();
            this.onStart();
        }
      }
    });
  }

  /**
   * Initialisation des contrôles directionnels (D-Pad).
   * @private
   */
  _initMobile() {
    const setupBtn = (id, dir) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const setClass = (add) => btn.classList[add ? "add" : "remove"]("is-active");

      // Touch
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        setClass(true);
        this.input.addDirection(dir);
      }, { passive: false });
      
      btn.addEventListener("touchend", (e) => {
          e.preventDefault();
          setClass(false);
      }, { passive: false });

      // Mouse fallback (Desktop Dev Tools)
      btn.addEventListener("mousedown", () => setClass(true));
      btn.addEventListener("mouseup", () => setClass(false));
      btn.addEventListener("mouseleave", () => setClass(false));
      
      // Click simple
      btn.addEventListener("click", () => this.input.addDirection(dir));
    };

    setupBtn("btn-up", 0);
    setupBtn("btn-right", 1);
    setupBtn("btn-down", 2);
    setupBtn("btn-left", 3);
  }
}

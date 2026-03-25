import "./style.css";
import GameEngine from "./modules/GameEngine.js";
import { CSS_SIZE, GAME_CONFIG } from "./constants.js";

/**
 * Point d'entrée principal de Slither Arena.
 * Initialise le canvas, configure la mise à l'échelle HiDPI et lance le moteur de jeu.
 */

// --- Initialisation du Canvas ---
const canvas = document.getElementById("terrain");
const gameWrapper = document.getElementById("game-wrapper");

// Gestion de la densité de pixels (HiDPI / Retina)
const dpr = window.devicePixelRatio || 1;
canvas.width = CSS_SIZE * dpr;
canvas.height = CSS_SIZE * dpr;
canvas.style.width = CSS_SIZE + "px";
canvas.style.height = CSS_SIZE + "px";

// Initialisation du Moteur de Jeu
const engine = new GameEngine(canvas);

// Mise à l'échelle du contexte de rendu
engine.ctx.scale(dpr, dpr);

// --- Contrôles Globaux Système ---

// Gestion du Plein Écran (F11)
window.addEventListener("keydown", (event) => {
  if (event.key === "F11") {
    event.preventDefault();
    if (!document.fullscreenElement) {
      gameWrapper.requestFullscreen().catch((err) => {
        console.warn(`Erreur lors du passage en plein écran : ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
});

// Lancement initial (affichage du menu)
engine.ui.showMenu(
  "Slither Arena",
  "Prêt à jouer ?",
  false,
  0,
  "Démarrer",
  false,
  true,
);
engine.ui.updateDebugButton(GAME_CONFIG.DEBUG_MODE);

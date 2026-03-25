import Serpent from "./serpent/Serpent.js";
import SerpentAI from "./serpent/Serpent_ai.js";
import ItemManager from "./manager/ItemManager.js";
import InputManager from "./manager/InputManager.js";
import ScoreManager from "./manager/ScoreManager.js";
import UIManager from "./manager/UIManager.js";
import SpawnSystem from "./logic/SpawnSystem.js";
import CollisionSystem from "./logic/CollisionSystem.js";
import {
  COLORS,
  TAILLE_CELLULE,
  nbCells,
  CSS_SIZE,
  GAME_CONFIG,
} from "../constants.js";

/**
 * Orchestrateur central de Slither Arena.
 * Gère le cycle de vie du jeu et coordonne les systèmes modulaires.
 */
export default class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Systèmes
    this.ui = new UIManager();
    this.itemManager = new ItemManager(nbCells);
    this.inputManager = new InputManager();
    this.scoreManager = new ScoreManager();
    this.spawnSystem = new SpawnSystem(this.itemManager);
    this.collisionSystem = new CollisionSystem(this.itemManager, this.ui);

    // État
    this.serpents = [];
    this.joueur = null;
    this.score = 0;
    this.fps = GAME_CONFIG.FPS_INITIAL;
    this.gameRunning = false;
    this.isPaused = false;
    this.lastMoveTime = 0;
    this.MOVE_INTERVAL = 1000 / this.fps;
    this.animationFrameId = null;

    this._initEvents();
  }

  _initEvents() {
    this.ui.menuActionBtn.addEventListener("click", () => {
      if (this.isPaused) this.togglePause();
      else {
        this.ui.hideMenu();
        this.startGame();
      }
    });

    this.ui.menuRestartBtn.addEventListener("click", () => {
      this.ui.hideMenu();
      this.startGame();
    });

    // Écouteur global pour les raccourcis
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();

      if (key === "p" && this.gameRunning) {
        this.togglePause();
      }

      if (key === "r") {
        if (this.gameRunning && !this.isPaused) {
          // Warning si en pleine partie
          const verify = confirm(
            "Voulez-vous vraiment recommencer la partie ?",
          );
          if (verify) {
            this.ui.hideMenu();
            this.startGame();
          }
        } else if (this.ui.isMenuVisible() || !this.gameRunning) {
          // Direct si menu visible ou game over
          this.ui.hideMenu();
          this.startGame();
        }
      }
    });

    // Boutons scoreboard
    document
      .getElementById("leaderboard-btn")
      .addEventListener("click", () => this.scoreManager.show());
    document
      .getElementById("scoreboard-close")
      .addEventListener("click", () => this.scoreManager.hide());
    document
      .getElementById("scoreboard-clear")
      .addEventListener("click", () => this.scoreManager.clearScores());
    document
      .getElementById("scoreboard-overlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "scoreboard-overlay") this.scoreManager.hide();
      });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.ui.showMenu(
        "PAUSE",
        "Le jeu est en pause",
        true,
        this.score,
        "Continuer",
        true,
      );
    } else {
      this.ui.hideMenu();
      this.lastMoveTime = 0; // Reset pour éviter un saut brutal
    }
  }

  startGame() {
    this.score = 0;
    this.fps = GAME_CONFIG.FPS_INITIAL;
    this.MOVE_INTERVAL = 1000 / this.fps;
    this.ui.updateHUD(this.score, this.fps);
    this.itemManager.reset();
    this.inputManager.reset();

    this.serpents = [new Serpent(2, 15, 15, 1)];
    this.joueur = this.serpents[0];
    this.spawnSystem.spawnInitialItems(this.serpents);

    this.gameRunning = true;
    this.isPaused = false;
    this.lastMoveTime = 0;

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  gameOver(message) {
    this.gameRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.score > 0) this.scoreManager.saveScore(this.score);
    // showRestart is false by default in showMenu
    this.ui.showMenu("Game Over", message, true, this.score, "Rejouer", false);
  }

  updateLogic(timestamp) {
    if (this.isPaused) return;

    // 1. Inputs
    const nextDir = this.inputManager.getNextDirection(this.joueur.direction);
    if (nextDir !== null) this.joueur.direction = nextDir;

    // 2. Mouvements & Collisions fatales
    for (const s of this.serpents) {
      if (s instanceof SerpentAI) s.move(this.itemManager.items, this.serpents);
      else s.move();

      if (
        this.collisionSystem.checkFatalCollisions(s, this.serpents, (msg) =>
          this.gameOver(msg),
        )
      )
        return;
    }

    // 3. Collecte d'items
    const scoreState = { score: this.score };
    this.serpents.forEach((s) => {
      this.collisionSystem.handleItemCollection(
        s,
        this.joueur,
        this.itemManager,
        scoreState,
        timestamp,
      );
    });

    // Sync score et progressive difficulty
    if (scoreState.score !== this.score) {
      this.score = scoreState.score;
      this.fps = Math.min(
        GAME_CONFIG.FPS_MAX,
        GAME_CONFIG.FPS_INITIAL +
          Math.floor(this.score / GAME_CONFIG.SCORE_FOR_SPEED_INCREASE),
      );
      this.MOVE_INTERVAL = 1000 / this.fps;
      this.ui.updateHUD(this.score, this.fps);
    }

    // 4. Spawns (AI)
    if (
      this.score > 0 &&
      this.score % GAME_CONFIG.AI_SPAWN_SCORE_INTERVAL === 0 &&
      !this._lastAISpawnScore
    ) {
      this.spawnSystem.spawnNewAI(this.serpents);
      this._lastAISpawnScore = this.score;
    } else if (this.score % GAME_CONFIG.AI_SPAWN_SCORE_INTERVAL !== 0) {
      this._lastAISpawnScore = null;
    }

    this.spawnSystem.checkSpawns(this.score, this.serpents, timestamp);

    // 5. Cleanup
    this.serpents = this.serpents.filter((s) => !s.dead || s === this.joueur);
  }

  drawAll() {
    this.ctx.clearRect(0, 0, CSS_SIZE, CSS_SIZE);

    // Grille
    this.ctx.fillStyle = COLORS.canvasGrid;
    for (let x = 0; x <= CSS_SIZE; x += TAILLE_CELLULE) {
      for (let y = 0; y <= CSS_SIZE; y += TAILLE_CELLULE) {
        this.ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    this.itemManager.updateAndDraw(this.ctx, Date.now());
    this.serpents.forEach((s) => !s.dead && s.draw(this.ctx, TAILLE_CELLULE));
  }

  gameLoop(timestamp) {
    if (!this.gameRunning) return;
    if (!this.isPaused) {
      if (!this.lastMoveTime) this.lastMoveTime = timestamp;
      const deltaTime = timestamp - this.lastMoveTime;

      if (deltaTime > 1000) {
        this.lastMoveTime = timestamp;
      } else if (deltaTime >= this.MOVE_INTERVAL) {
        this.updateLogic(timestamp);
        this.lastMoveTime = timestamp;
      }
    }

    this.drawAll();
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

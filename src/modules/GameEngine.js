import Serpent from "./serpent/Serpent.js";
import SerpentAI from "./serpent/Serpent_ai.js";
import ItemManager from "./manager/ItemManager.js";
import InputManager from "./manager/InputManager.js";
import ScoreManager from "./manager/ScoreManager.js";
import { COLORS, TAILLE_CELLULE, nbCells, CSS_SIZE } from "../constants.js";
import { getRandomInt } from "../utils.js";

/**
 * Orchestrateur central de l'application Slither Arena.
 * Gère le cycle de vie du jeu, la boucle de rendu et la coordination entre les modules.
 */
export default class GameEngine {
  /**
   * @param {HTMLCanvasElement} canvas - L'élément canvas de rendu.
   */
  constructor(canvas) {
    /** @type {HTMLCanvasElement} L'élément canvas de rendu */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} Le contexte 2D du canvas */
    this.ctx = canvas.getContext("2d");

    // Éléments UI du DOM
    /** @type {HTMLElement|null} Élément affichant le score actuel */
    this.scoreValElem = document.getElementById("score-val");
    /** @type {HTMLElement|null} Overlay du menu de jeu */
    this.menuOverlay = document.getElementById("game-menu-overlay");
    /** @type {HTMLElement|null} Titre du menu */
    this.menuTitle = document.getElementById("menu-title");
    /** @type {HTMLElement|null} Sous-titre du menu */
    this.menuSubtitle = document.getElementById("menu-subtitle");
    /** @type {HTMLElement|null} Zone d'affichage du score final dans le menu */
    this.menuScoreDisplay = document.getElementById("menu-score-display");
    /** @type {HTMLElement|null} Valeur du score final dans le menu */
    this.menuScoreVal = document.getElementById("menu-score-val");
    /** @type {HTMLElement|null} Bouton d'action principal du menu */
    this.menuActionBtn = document.getElementById("menu-action-btn");

    // Instanciation des sous-systèmes
    /** @type {ItemManager} Manager des objets et particules */
    this.itemManager = new ItemManager(nbCells);
    /** @type {InputManager} Manager des entrées utilisateur */
    this.inputManager = new InputManager();
    /** @type {ScoreManager} Manager du leaderboard */
    this.scoreManager = new ScoreManager();

    // État du jeu
    /** @type {Serpent[]} Liste des serpents actifs (joueur + IA) */
    this.serpents = [];
    /** @type {Serpent|null} Référence vers le serpent piloté par le joueur */
    this.joueur = null;
    /** @type {number} Score actuel de la partie */
    this.score = 0;
    /** @type {boolean} Indique si la boucle de jeu est active */
    this.gameRunning = false;
    /** @type {number} Timestamp du dernier mouvement logique effectué */
    this.lastMoveTime = 0;
    /** @type {number} Intervalle en ms entre chaque mouvement logique */
    this.MOVE_INTERVAL = 120;
    /** @type {number|null} ID de l'animation frame en cours */
    this.animationFrameId = null;

    this._initEvents();
  }

  /**
   * Attache les écouteurs d'événements UI.
   * @private
   */
  _initEvents() {
    this.menuActionBtn.addEventListener("click", () => {
      this.hideMenu();
      this.startGame();
    });

    document.getElementById("leaderboard-btn").addEventListener("click", () => {
      this.scoreManager.show();
    });

    document
      .getElementById("scoreboard-close")
      .addEventListener("click", () => {
        this.scoreManager.hide();
      });

    document
      .getElementById("scoreboard-clear")
      .addEventListener("click", () => {
        this.scoreManager.clearScores();
      });

    document
      .getElementById("scoreboard-overlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "scoreboard-overlay") this.scoreManager.hide();
      });
  }

  /**
   * Affiche l'overlay du menu.
   * @param {string} title - Titre du menu.
   * @param {string} subtitle - Sous-titre descriptif.
   * @param {boolean} [isGameOver=false] - Indique si on affiche le score final.
   */
  showMenu(title, subtitle, isGameOver = false) {
    this.menuTitle.textContent = title;
    this.menuSubtitle.textContent = subtitle;

    if (isGameOver) {
      this.menuScoreVal.textContent = this.score;
      this.menuScoreDisplay.classList.remove("hidden");
      this.menuActionBtn.textContent = "Rejouer";
    } else {
      this.menuScoreDisplay.classList.add("hidden");
      this.menuActionBtn.textContent = "Démarrer";
    }

    this.menuOverlay.classList.remove("hidden");
  }

  /**
   * Masque l'overlay du menu.
   */
  hideMenu() {
    this.menuOverlay.classList.add("hidden");
  }

  /**
   * Initialise une nouvelle partie de jeu.
   */
  startGame() {
    this.score = 0;
    this.scoreValElem.textContent = this.score;
    this.itemManager.reset();
    this.inputManager.reset();

    // Reset serpents : joueur au centre
    this.serpents = [new Serpent(2, 15, 15, 1)];
    this.joueur = this.serpents[0];

    // Spawn première pomme
    this.itemManager.spawnItem("apple", this.serpents);

    this.gameRunning = true;
    this.lastMoveTime = 0;

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * Termine la session de jeu actuelle.
   * @param {string} message - Message de cause du Game Over.
   */
  gameOver(message) {
    this.gameRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    if (this.score > 0) {
      this.scoreManager.saveScore(this.score);
    }

    this.showMenu("Game Over", message, true);
  }

  /**
   * Mise à jour de la logique de jeu (calculs des positions et des collisions).
   * @param {number} timestamp - Temps écoulé global.
   */
  updateLogic(timestamp) {
    // Mise à jour de la direction du joueur via l'InputManager
    const nextDir = this.inputManager.getNextDirection(this.joueur.direction);
    if (nextDir !== null) {
      this.joueur.direction = nextDir;
    }

    this.serpents.forEach((s) => {
      if (!this.gameRunning) return;

      s.move();

      // Collision murs
      if (s.checkWallCollision(nbCells)) {
        if (s === this.joueur) this.gameOver("Vous avez percuté un mur !");
        else s.dead = true;
        return;
      }

      // Collision soi-même
      if (s.checkSelfCollision()) {
        if (s === this.joueur) this.gameOver("Vous vous êtes mordu !");
        else s.dead = true;
        return;
      }

      // Collision avec les autres serpents
      this.serpents.forEach((autre) => {
        if (!this.gameRunning) return;
        if (s !== autre && s.checkCollisionWith(autre)) {
          if (s === this.joueur) {
            if (
              this.joueur.isInvincible &&
              this.joueur.isInvincible(timestamp)
            ) {
              autre.dead = true;
              this.itemManager.spawnParticles(
                autre.anneaux[0].i,
                autre.anneaux[0].j,
                COLORS.snakeBody,
              );
              this.score += 5;
              this.scoreValElem.textContent = this.score;
            } else {
              this.gameOver("Vous avez percuté un autre serpent !");
            }
          } else if (autre === this.joueur) {
            if (
              this.joueur.isInvincible &&
              this.joueur.isInvincible(timestamp)
            ) {
              s.dead = true;
              this.itemManager.spawnParticles(
                s.anneaux[0].i,
                s.anneaux[0].j,
                COLORS.snakeBody,
              );
            } else {
              this.gameOver("Un serpent vous a percuté !");
            }
          } else {
            s.dead = true; // IA vs IA
          }
        }
      });

      // Gestion de la collecte d'items
      for (let i = this.itemManager.items.length - 1; i >= 0; i--) {
        const item = this.itemManager.items[i];
        if (s.anneaux[0].i === item.i && s.anneaux[0].j === item.j) {
          if (item.type === "apple") {
            if (s === this.joueur) {
              this.score++;
              this.scoreValElem.textContent = this.score;
            }
            s.extend();
            this.itemManager.spawnParticles(item.i, item.j, COLORS.apple);
            this.itemManager.items.splice(i, 1);
            this.itemManager.spawnItem("apple", this.serpents);

            // Nouveau serpent AI tous les 10 points
            if (s === this.joueur && this.score > 0 && this.score % 10 === 0) {
              this.serpents.push(
                new SerpentAI(
                  3,
                  getRandomInt(nbCells),
                  getRandomInt(nbCells),
                  getRandomInt(4),
                ),
              );
            }

            // PowerUp chance
            if (s === this.joueur && Math.random() < 0.15) {
              const hasAI = this.serpents.some(
                (sn) => sn !== this.joueur && !sn.dead,
              );
              const hasPU = this.itemManager.items.some(
                (it) => it.type === "powerup",
              );
              if (hasAI && !hasPU)
                this.itemManager.spawnItem("powerup", this.serpents);
            }
          } else if (item.type === "powerup") {
            this.itemManager.spawnParticles(item.i, item.j, COLORS.powerup);
            this.itemManager.items.splice(i, 1);
            if (s === this.joueur) {
              this.joueur.invincibleUntil = timestamp + 5000;
            }
          }
        }
      }
    });

    // Filtre des serpents morts
    this.serpents = this.serpents.filter((s) => !s.dead);
  }

  /**
   * Boucle de dessin synchrone avec le rafraîchissement écran.
   */
  drawAll() {
    this.ctx.clearRect(0, 0, CSS_SIZE, CSS_SIZE);

    // Grille de fond
    this.ctx.fillStyle = COLORS.grid;
    for (let x = 0; x <= CSS_SIZE; x += TAILLE_CELLULE) {
      for (let y = 0; y <= CSS_SIZE; y += TAILLE_CELLULE) {
        this.ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    // Objets et particules
    this.itemManager.updateAndDraw(this.ctx, Date.now());

    // Serpents
    this.serpents.forEach((s) => {
      if (!s.dead) s.draw(this.ctx, TAILLE_CELLULE);
    });
  }

  /**
   * Boucle temporelle principale.
   * @param {number} timestamp - Temps DOMHighResTimeStamp injecté par rAF.
   */
  gameLoop(timestamp) {
    if (!this.gameRunning) return;

    if (!this.lastMoveTime) this.lastMoveTime = timestamp;
    const deltaTime = timestamp - this.lastMoveTime;

    // Protection contre les énormes deltas (ex: changement d'onglet)
    if (deltaTime > 1000) {
      this.lastMoveTime = timestamp;
      this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
      return;
    }

    // Exécution de la logique selon le MOVE_INTERVAL
    if (deltaTime >= this.MOVE_INTERVAL) {
      this.updateLogic(timestamp);
      this.lastMoveTime = timestamp;
    }

    // Rendu graphique à 60 FPS
    if (this.gameRunning) {
      this.drawAll();
      this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }
}

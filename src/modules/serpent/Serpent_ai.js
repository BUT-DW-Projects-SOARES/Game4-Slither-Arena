import Serpent from "./Serpent.js";
import {
  nbCells,
  COLORS as GAME_COLORS,
  GAME_CONFIG,
} from "../../constants.js";

/**
 * Sous-classe intelligente paramétrant un serpent piloté par algorithme (IA).
 * Permet l'apparition d'adversaires se dirigeant de façon automne sur la grille.
 * Hérite entièrement du rendu visuel et de la motorisation de la classe parente Serpent.
 */
export default class SerpentAI extends Serpent {
  constructor(longueur, i, j, direction) {
    super(longueur, i, j, direction);
    /** @type {number} Direction actuelle du mouvement */
    this.direction = direction;
    // Les IA sont rouges par convention visuelle
    this.anneaux.forEach((a, idx) => {
      if (idx === 0) a.couleur = GAME_COLORS.redIA;
      else a.couleur = GAME_COLORS.redIABody;
    });

    /** @type {number} Temps de vie en ms (disparaît après 30s) */
    this.spawnTime = performance.now();
    this.lifespan = GAME_CONFIG.AI_LIFESPAN;

    /** @type {boolean} Si l'IA est en mode 'rush' pour une pomme */
    this.isRushing = false;
  }

  /**
   * IA Complexe : Évite le joueur et les murs, et ne 'rush' les pommes qu'occasionnellement.
   * @param {Item[]} items - Liste des objets présents sur le terrain.
   * @param {Serpent[]} allSerpents - Liste de tous les serpents (pour l'esquive).
   */
  planNextMove(items = [], allSerpents = []) {
    const tete = this.anneaux[0];

    // 1. Gestion de l'état (Rush vs Wander)
    if (!this.isRushing && Math.random() < 0.05) {
      this.isRushing = true; // 5% de chance de passer en mode Rush
    } else if (this.isRushing && Math.random() < 0.2) {
      this.isRushing = false; // 20% de chance d'arrêter le Rush après chaque pas
    }

    let idealDir = this.direction;

    if (this.isRushing) {
      // MODE RUSH    // 1. Chercher l'objet le plus proche (priorité au PowerUp)
      const powerUps = items.filter((it) => it.type === "powerup");
      const apples = items.filter((it) => it.type === "apple");

      // Si on rush, on vise le powerup en priorité s'il existe, sinon la pomme
      const targets = powerUps.length > 0 ? powerUps : apples;
      let target = null;
      let minDist = Infinity;

      targets.forEach((item) => {
        const dist = Math.abs(item.i - tete.i) + Math.abs(item.j - tete.j);
        if (dist < minDist) {
          minDist = dist;
          target = item;
        }
      });

      if (target) {
        const di = target.i - tete.i;
        const dj = target.j - tete.j;
        if (Math.abs(di) > Math.abs(dj)) {
          idealDir = di > 0 ? 1 : 3;
        } else if (dj !== 0) {
          idealDir = dj > 0 ? 2 : 0;
        }
      }
    } else {
      // MODE WANDER : On bouge un peu au hasard mais on évite le danger
      if (Math.random() < 0.1) {
        // Change de direction aléatoirement de temps en temps
        idealDir = Math.floor(Math.random() * 4);
      }
    }

    // Interdire le demi-tour immédiat
    if (Math.abs(idealDir - this.direction) === 2) {
      idealDir = this.direction;
    }

    // 2. Validation de la direction (Évitement murs + JOUEUR + POMMES si wander)
    if (this._isDirectionDangerous(idealDir, tete, allSerpents, items)) {
      this.direction = this._getSafeDirection(tete, allSerpents, items);
    } else {
      this.direction = idealDir;
    }
  }

  /**
   * Vérifie si une direction mène à une danger (mur, serpent, ou pomme si on wander).
   */
  _isDirectionDangerous(dir, tete, allSerpents, items) {
    let nextI = tete.i;
    let nextJ = tete.j;
    switch (dir) {
      case 0:
        nextJ--;
        break;
      case 1:
        nextI++;
        break;
      case 2:
        nextJ++;
        break;
      case 3:
        nextI--;
        break;
    }

    // Mur
    if (nextI < 0 || nextI >= nbCells || nextJ < 0 || nextJ >= nbCells)
      return true;

    // Autre serpent (Joueur)
    for (const s of allSerpents) {
      if (s === this) continue;
      if (s.anneaux.some((a) => a.i === nextI && a.j === nextJ)) return true;
    }

    // Éviter les pommes si on ne rush pas
    if (!this.isRushing) {
      if (items.some((it) => it.i === nextI && it.j === nextJ)) return true;
    }

    return false;
  }

  /**
   * Trouve une direction qui ne mène pas à un mur, au joueur ou à une pomme (si wander).
   */
  _getSafeDirection(tete, allSerpents, items) {
    const validDirections = [];
    for (let d = 0; d < 4; d++) {
      if (Math.abs(this.direction - d) === 2) continue; // Pas de demi-tour
      if (!this._isDirectionDangerous(d, tete, allSerpents, items)) {
        validDirections.push(d);
      }
    }

    if (validDirections.length > 0) {
      return validDirections[
        Math.floor(Math.random() * validDirections.length)
      ];
    }
    return this.direction;
  }

  /**
   * Vérifie si l'IA a dépassé son temps de vie.
   */
  isExpired(timestamp) {
    return timestamp - this.spawnTime > this.lifespan;
  }

  move(items, allSerpents) {
    // L'IA est un peu plus lente : elle peut "sauter" un cycle de mouvement
    if (Math.random() > GAME_CONFIG.AI_MOVE_CHANCE) return;

    this.planNextMove(items, allSerpents);
    super.move();
  }

  /**
   * Surcharge de la croissance pour l'IA : devient entièrement rouge vif quand elle mange.
   */
  extend() {
    super.extend();
    this.anneaux.forEach((a) => {
      a.couleur = GAME_COLORS.redIA;
    });
  }
}

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

    /** @type {number} Horodatage de création (utilisé comme identifiant unique dans les logs) */
    this.spawnTime = performance.now();

    /** @type {boolean} Si l'IA est en mode 'rush' pour une pomme */
    this.isRushing = false;
    /** @type {boolean} Si l'IA traque le joueur */
    this.isHunting = false;
    /** @type {number} Compteur de pas de chasse pour s'arrêter */
    this.huntCounter = 0;
  }

  /**
   * Orchestre la prise de décision de l'IA.
   * Analyse l'environnement pour choisir entre le vagabondage (Wander), la récolte (Rush) ou la chasse (Hunt).
   * @param {Item[]} items - Liste des objets présents sur le terrain (Pommes, PowerUps).
   * @param {Serpent[]} allSerpents - Liste des serpents actifs (Joueur + autres IA).
   */
  planNextMove(items = [], allSerpents = []) {
    const tete = this.anneaux[0];
    const joueur = allSerpents[0]; // Par convention, le premier serpent est le joueur humain.

    if (GAME_CONFIG.DEBUG_MODE) {
      console.groupCollapsed(
        `%c[IA DECISION] Serpent #${this.spawnTime.toString().slice(-4)}`,
        "color: #ef4444; font-weight: bold;",
      );
    }

    // 1. GESTION DE L'ÉTAT (Rush vs Wander vs Hunt)
    // L'IA peut changer d'état aléatoirement ou selon la proximité de cibles.
    if (this.isRushing || this.isHunting) {
      if (Math.random() < 0.05) {
        if (GAME_CONFIG.DEBUG_MODE)
          console.log("IA: Fin de l'état spécial (Reset to Wander)");
        this.isRushing = false;
        this.isHunting = false;
        this.huntCounter = 0;
      }
    } else {
      const chance = Math.random();
      if (chance < 0.1) {
        if (GAME_CONFIG.DEBUG_MODE)
          console.log("IA: Passage en mode RUSH (Ciblage Item)");
        this.isRushing = true;
      } else if (joueur && !joueur.dead && chance < 0.25) {
        if (GAME_CONFIG.DEBUG_MODE)
          console.log("IA: Passage en mode HUNT (Ciblage Joueur)");
        this.isHunting = true;
        this.huntCounter = 40; // Traque plus longue (était 20)
      }
    }

    let idealDir = this.direction;

    // 2. CALCUL DE LA DIRECTION IDÉALE SELON L'ÉTAT
    if (this.isHunting && joueur) {
      // MODE CHASSE : Vise directement la tête du joueur.
      this.huntCounter--;
      if (this.huntCounter <= 0) this.isHunting = false;

      const targetI = joueur.anneaux[0].i;
      const targetJ = joueur.anneaux[0].j;
      const di = targetI - tete.i;
      const dj = targetJ - tete.j;

      if (Math.abs(di) > Math.abs(dj)) idealDir = di > 0 ? 1 : 3;
      else if (dj !== 0) idealDir = dj > 0 ? 2 : 0;

      if (GAME_CONFIG.DEBUG_MODE)
        console.log(`IA Chasseur: Vise Joueur à [${targetI}, ${targetJ}]`);
    } else if (this.isRushing) {
      // MODE RUSH : Cherche l'objet le plus proche (Priorité aux PowerUps).
      const powerUps = items.filter((it) => it.type === "powerup");
      const apples = items.filter((it) => it.type === "apple");
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
        if (Math.abs(di) > Math.abs(dj)) idealDir = di > 0 ? 1 : 3;
        else if (dj !== 0) idealDir = dj > 0 ? 2 : 0;
        if (GAME_CONFIG.DEBUG_MODE)
          console.log(
            `IA Harvest: Cible ${target.type} à [${target.i}, ${target.j}]`,
          );
      }
    } else {
      // MODE WANDER : Flânage aléatoire avec changement de direction ponctuel.
      if (Math.random() < 0.1) {
        idealDir = Math.floor(Math.random() * 4);
      }
    }

    // Sécurité: Empêcher le demi-tour immédiat (fatal pour le serpent).
    if (Math.abs(idealDir - this.direction) === 2) {
      idealDir = this.direction;
    }

    // 3. ANALYSE DES DANGERS ET ESQUIVE (Audit de sécurité)
    // Si la direction idéale est dangereuse, on cherche un chemin de repli.
    if (this._isDirectionDangerous(idealDir, tete, allSerpents, items)) {
      if (GAME_CONFIG.DEBUG_MODE)
        console.warn(
          "IA: Danger détecté sur la trajectoire idéale ! Recherche d'esquive...",
        );
      this.direction = this._getSafeDirection(tete, allSerpents, items);
      if (GAME_CONFIG.DEBUG_MODE)
        console.log(`IA: Direction de repli choisie: ${this.direction}`);
    } else {
      this.direction = idealDir;
    }

    if (GAME_CONFIG.DEBUG_MODE) console.groupEnd();
  }

  /**
   * Analyse la dangerosité d'une direction donnée.
   * Un danger est défini par : un mur, un segment de serpent adverse, ou un item (si l'IA n'est pas en mode Rush).
   * @param {number} dir - Direction à tester (0-3).
   * @param {Anneau} tete - Position actuelle de la tête.
   * @param {Serpent[]} allSerpents - Liste des serpents pour la détection de collision.
   * @param {Item[]} items - Liste des items sur la grille.
   * @returns {boolean} True si la direction est fatale ou déconseillée.
   * @private
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

    // Sortie de grille (Murs)
    if (nextI < 0 || nextI >= nbCells || nextJ < 0 || nextJ >= nbCells)
      return true;

    // Collision avec un autre serpent
    for (const s of allSerpents) {
      if (s === this) continue;
      if (s.anneaux.some((a) => a.i === nextI && a.j === nextJ)) return true;
    }

    // Éviter les items pendant le vagabondage pour les "garder" pour plus tard
    if (!this.isRushing) {
      if (items.some((it) => it.i === nextI && it.j === nextJ)) return true;
    }

    return false;
  }

  /**
   * Recherche récursive d'une direction sécurisée parmi les options disponibles.
   * @param {Anneau} tete - Position de la tête.
   * @param {Serpent[]} allSerpents - Contexte des serpents.
   * @param {Item[]} items - Contexte des items.
   * @returns {number} Une direction (0-3) jugée sûre, ou la direction actuelle par défaut.
   * @private
   */
  _getSafeDirection(tete, allSerpents, items) {
    const validDirections = [];
    for (let d = 0; d < 4; d++) {
      if (Math.abs(this.direction - d) === 2) continue; // Interdiction du demi-tour
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
   * Cycle de mouvement de l'IA.
   * Intègre un facteur de chance pour ralentir l'IA par rapport au joueur.
   * @param {Item[]} items - Context items.
   * @param {Serpent[]} allSerpents - Context serpents.
   */
  move(items, allSerpents) {
    if (Math.random() > GAME_CONFIG.AI_MOVE_CHANCE) return;

    this.planNextMove(items, allSerpents);
    super.move();
  }

  /**
   * Augmente la taille de l'IA.
   * Surchargé pour appliquer une couleur rouge uniforme sur tout le corps lors de la croissance.
   */
  extend() {
    super.extend();
    this.anneaux.forEach((a) => {
      a.couleur = GAME_COLORS.redIA;
    });
  }
}

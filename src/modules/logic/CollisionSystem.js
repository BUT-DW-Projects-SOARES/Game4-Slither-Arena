import { nbCells, COLORS, GAME_CONFIG } from "../../constants.js";

/**
 * Gère les calculs de collision entre serpents, murs et objets.
 */
export default class CollisionSystem {
  /**
   * Initialise le système de collision.
   * @param {ItemManager} itemManager - Gestionnaire des objets pour les effets de capture.
   * @param {UIManager} uiManager - Gestionnaire d'interface pour les alertes.
   */
  constructor(itemManager, uiManager) {
    this.itemManager = itemManager;
    this.uiManager = uiManager;
  }

  /**
   * Vérifie les collisions fatales pour un serpent (murs, soi-même, adversaires).
   * @param {Serpent} s - Le serpent à tester.
   * @param {Serpent[]} serpents - Liste de tous les serpents actifs.
   * @param {Function} onGameOver - Callback appelé en cas de défaite du joueur.
   * @returns {boolean} True si une collision fatale a eu lieu.
   */
  checkFatalCollisions(s, serpents, onGameOver) {
    // 1. Collision avec les limites de la grille (Murs)
    if (s.checkWallCollision(nbCells)) {
      if (s === serpents[0]) onGameOver("Vous avez percuté un mur !");
      else s.dead = true;
      return true;
    }

    // 2. Collision avec son propre corps (Auto-morsure)
    if (s.checkSelfCollision()) {
      if (s === serpents[0]) onGameOver("Vous vous êtes mordu !");
      else s.dead = true;
      return true;
    }

    // 3. Collision avec un autre serpent (Adversaire ou IA)
    for (const autre of serpents) {
      if (s !== autre && s.checkCollisionWith(autre)) {
        return this._handleSerpentCollision(s, autre, serpents, onGameOver);
      }
    }

    return false;
  }

  /**
   * Gère la résolution complexe d'une collision entre deux serpents.
   * Prend en compte l'invincibilité (PowerUp).
   * @private
   */
  _handleSerpentCollision(
    s,
    autre,
    serpents,
    onGameOver,
    timestamp = performance.now(),
  ) {
    const joueur = serpents[0];

    if (s === joueur) {
      // Le joueur fonce dans quelqu'un
      if (joueur.invincibleUntil && timestamp < joueur.invincibleUntil) {
        if (GAME_CONFIG.DEBUG_MODE)
          console.info(
            "%c[COLLISION] Joueur (Invincible) a écrasé une IA !",
            "color: #fbbf24;",
          );
        autre.dead = true;
        this.itemManager.spawnParticles(
          autre.anneaux[0].i,
          autre.anneaux[0].j,
          COLORS.snakeBody,
        );
        return false; // Le joueur survit grâce au PowerUp
      } else {
        onGameOver("Vous avez percuté un autre serpent !");
        return true;
      }
    } else if (autre === joueur) {
      // Une IA fonce dans le joueur
      if (joueur.invincibleUntil && timestamp < joueur.invincibleUntil) {
        if (GAME_CONFIG.DEBUG_MODE)
          console.info(
            "%c[COLLISION] Une IA s'est brisée contre le bouclier du joueur !",
            "color: #fbbf24;",
          );
        s.dead = true;
        this.itemManager.spawnParticles(
          s.anneaux[0].i,
          s.anneaux[0].j,
          COLORS.snakeBody,
        );
        return true;
      } else {
        onGameOver("Un serpent vous a percuté !");
        return true;
      }
    } else {
      // IA vs IA : Les deux sont éliminées pour simplifier
      s.dead = true;
      return true;
    }
  }

  /**
   * Gère la collecte d'items par un serpent.
   * Détecte si la tête du serpent chevauche un objet.
   * @param {Serpent} s - Le serpent qui collecte.
   * @param {Serpent} joueur - Le serpent du joueur (pour le score).
   * @param {ItemManager} itemManager - Gestionnaire des items.
   * @param {Object} scoreState - Objet de référence pour mettre à jour le score global.
   * @param {number} timestamp - Temps actuel.
   */
  handleItemCollection(s, joueur, itemManager, scoreState, timestamp) {
    for (let i = itemManager.items.length - 1; i >= 0; i--) {
      const item = itemManager.items[i];
      if (s.anneaux[0].i === item.i && s.anneaux[0].j === item.j) {
        this._processItem(
          s,
          joueur,
          item,
          itemManager,
          scoreState,
          i,
          timestamp,
        );
      }
    }
  }

  /**
   * Traite l'effet spécifique d'un item collecté (Pomme vs PowerUp).
   * @private
   */
  _processItem(s, joueur, item, itemManager, scoreState, index, timestamp) {
    if (item.type === "apple") {
      if (s === joueur) {
        scoreState.score += GAME_CONFIG.SCORE_APPLE;
        if (GAME_CONFIG.DEBUG_MODE)
          console.log("%c[ITEM] Pomme mangée (+1)", "color: #4ade80;");
      } else {
        // L'IA vole la pomme au joueur (Pénalité)
        scoreState.score = Math.max(
          0,
          scoreState.score + GAME_CONFIG.SCORE_AI_PENALTY,
        );
        if (GAME_CONFIG.DEBUG_MODE)
          console.warn(
            "%c[ITEM] L'IA a volé une pomme (-1)",
            "color: #ef4444;",
          );
      }

      s.extend();
      itemManager.spawnParticles(item.i, item.j, COLORS.apple);
      itemManager.items.splice(index, 1);
      itemManager.spawnItem("apple", [joueur]);
    } else if (item.type === "powerup") {
      if (s === joueur) {
        scoreState.score += GAME_CONFIG.SCORE_POWERUP;
        joueur.invincibleUntil = timestamp + GAME_CONFIG.POWERUP_DURATION;
        if (GAME_CONFIG.DEBUG_MODE)
          console.info(
            "%c[ITEM] POWERUP ACTIVÉ ! (Invincibilité 8s)",
            "color: #fbbf24; font-weight: bold;",
          );
      }

      s.extend();
      itemManager.spawnParticles(item.i, item.j, COLORS.powerup);
      itemManager.items.splice(index, 1);
    }
  }
}

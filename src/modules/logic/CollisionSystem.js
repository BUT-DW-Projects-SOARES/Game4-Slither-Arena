import { nbCells, COLORS, GAME_CONFIG } from "../../constants.js";

/**
 * Gère les calculs de collision entre serpents, murs et objets.
 */
export default class CollisionSystem {
  constructor(itemManager, uiManager) {
    this.itemManager = itemManager;
    this.uiManager = uiManager;
  }

  /**
   * Vérifie les collisions fatales pour un serpent.
   */
  checkFatalCollisions(s, serpents, onGameOver) {
    // Collision murs
    if (s.checkWallCollision(nbCells)) {
      if (s === serpents[0]) onGameOver("Vous avez percuté un mur !");
      else s.dead = true;
      return true;
    }

    // Collision soi-même
    if (s.checkSelfCollision()) {
      if (s === serpents[0]) onGameOver("Vous vous êtes mordu !");
      else s.dead = true;
      return true;
    }

    // Collision avec les autres serpents
    for (const autre of serpents) {
      if (s !== autre && s.checkCollisionWith(autre)) {
        return this._handleSerpentCollision(s, autre, serpents, onGameOver);
      }
    }

    return false;
  }

  _handleSerpentCollision(
    s,
    autre,
    serpents,
    onGameOver,
    timestamp = performance.now(),
  ) {
    const joueur = serpents[0];

    if (s === joueur) {
      // StarPower check
      if (joueur.invincibleUntil && timestamp < joueur.invincibleUntil) {
        autre.dead = true;
        this.itemManager.spawnParticles(
          autre.anneaux[0].i,
          autre.anneaux[0].j,
          COLORS.snakeBody,
        );
        return false; // Pas fatal pour le joueur
      } else {
        onGameOver("Vous avez percuté un autre serpent !");
        return true;
      }
    } else if (autre === joueur) {
      if (joueur.invincibleUntil && timestamp < joueur.invincibleUntil) {
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
      s.dead = true; // IA vs IA
      return true;
    }
  }

  /**
   * Gère la collecte d'items.
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

  _processItem(s, joueur, item, itemManager, scoreState, index, timestamp) {
    if (item.type === "apple") {
      if (s === joueur) {
        scoreState.score += GAME_CONFIG.SCORE_APPLE;
      } else {
        // L'IA vole le score
        scoreState.score = Math.max(
          0,
          scoreState.score + GAME_CONFIG.SCORE_AI_PENALTY,
        );
      }

      s.extend();
      itemManager.spawnParticles(item.i, item.j, COLORS.apple);
      itemManager.items.splice(index, 1);

      // Toujours repop une pomme classique
      itemManager.spawnItem("apple", [joueur]);
    } else if (item.type === "powerup") {
      if (s === joueur) {
        scoreState.score += GAME_CONFIG.SCORE_POWERUP;
        joueur.invincibleUntil = timestamp + GAME_CONFIG.POWERUP_DURATION;
      }

      s.extend();
      itemManager.spawnParticles(item.i, item.j, COLORS.powerup);
      itemManager.items.splice(index, 1);
    }
  }
}

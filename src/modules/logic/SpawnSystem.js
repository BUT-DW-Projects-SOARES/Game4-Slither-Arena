import SerpentAI from '../serpent/Serpent_ai.js';
import { getRandomInt } from '../../utils.js';
import { NB_CELLS, GAME_CONFIG, LOG_COLORS } from '../../constants.js';

/**
 * Système de gestion de l'apparition des objets et des adversaires.
 * Coordonne le spawn des PowerUps et des serpents IA selon l'état du jeu.
 */
export default class SpawnSystem {
  /**
   * Initialise le système d'apparition.
   * @param {ItemManager} itemManager - Gestionnaire pour le placement physique des items.
   */
  constructor(itemManager) {
    /** @type {ItemManager} */
    this.itemManager = itemManager;
  }

  /**
   * Indique si une cellule est déjà occupée par un segment de serpent ou un item.
   * @param {number} x
   * @param {number} y
   * @param {Serpent[]} serpents
   * @returns {boolean}
   * @private
   */
  _isCellOccupied(x, y, serpents) {
    const occupiedBySerpent = serpents.some((s) =>
      s.anneaux.some((a) => a.i === x && a.j === y),
    );
    const occupiedByItem = this.itemManager.items.some(
      (item) => item.i === x && item.j === y,
    );
    return occupiedBySerpent || occupiedByItem;
  }

  /**
   * Analyse l'état du jeu pour décider s'il faut faire apparaître des objets spéciaux.
   * Un PowerUp n'apparaît que si au moins une IA est présente sur le terrain.
   * @param {number} score - Score actuel du joueur.
   * @param {Serpent[]} serpents - Liste des serpents actifs.
   */
  checkSpawns(score, serpents) {
    const hasAI = serpents.some((s) => s instanceof SerpentAI && !s.dead);
    const hasPU = this.itemManager.items.some((it) => it.type === 'powerup');

    // Apparition aléatoire et rare du PowerUp d'invincibilité si une menace (IA) existe.
    if (hasAI && !hasPU && Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE) {
      if (GAME_CONFIG.DEBUG_MODE) {
        console.info(
          '%c[SPAWN] Un PowerUp est apparu sur la grille !',
          `color: ${LOG_COLORS.spawn};`,
        );
      }
      this.itemManager.spawnItem('powerup', serpents);
    }
  }

  /**
   * Génère une nouvelle IA ennemie à une position et direction aléatoire.
   * @param {Serpent[]} serpents - Liste des serpents auxquels ajouter l'adversaire.
   */
  spawnNewAI(serpents) {
    const maxAttempts = NB_CELLS * NB_CELLS;
    let attempts = 0;
    let x;
    let y;

    do {
      x = getRandomInt(NB_CELLS);
      y = getRandomInt(NB_CELLS);
      attempts++;
    } while (this._isCellOccupied(x, y, serpents) && attempts < maxAttempts);

    if (this._isCellOccupied(x, y, serpents)) {
      if (GAME_CONFIG.DEBUG_MODE) {
        console.warn('[SPAWN] Impossible de placer une IA: grille saturée.');
      }
      return;
    }

    serpents.push(new SerpentAI(3, x, y, getRandomInt(4)));
  }

  /**
   * Place les objets initiaux au démarrage du jeu (Typiquement la première pomme).
   * @param {Serpent[]} serpents - Liste des serpents pour éviter les collisions au spawn.
   */
  spawnInitialItems(serpents) {
    this.itemManager.spawnItem('apple', serpents);
  }
}

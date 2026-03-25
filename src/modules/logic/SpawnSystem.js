import SerpentAI from "../serpent/Serpent_ai.js";
import { getRandomInt } from "../../utils.js";
import { nbCells, GAME_CONFIG } from "../../constants.js";

/**
 * Gère l'apparition programmée des objets et des adversaires.
 */
export default class SpawnSystem {
  constructor(itemManager) {
    this.itemManager = itemManager;
  }

  /**
   * Vérifie et déclenche les spawns selon le score et l'état actuel.
   */
  checkSpawns(score, serpents) {
    const hasAI = serpents.some((s) => s instanceof SerpentAI && !s.dead);
    const hasPU = this.itemManager.items.some((it) => it.type === "powerup");

    // Spawn rare PowerUp si IA présente
    if (hasAI && !hasPU && Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE) {
      this.itemManager.spawnItem("powerup", serpents);
    }
  }

  spawnNewAI(serpents) {
    serpents.push(
      new SerpentAI(
        3,
        getRandomInt(nbCells),
        getRandomInt(nbCells),
        getRandomInt(4),
      ),
    );
  }

  spawnInitialItems(serpents) {
    this.itemManager.spawnItem("apple", serpents);
  }
}

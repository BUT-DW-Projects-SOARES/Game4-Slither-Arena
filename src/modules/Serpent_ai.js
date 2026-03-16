import { getRandomInt } from "../utils.js";
import Serpent from "./Serpent.js";

/**
 * Représente un serpent contrôlé par l'ordinateur.
 * Hérite de la classe Serpent de base.
 */
export default class SerpentAI extends Serpent {
  /**
   * Modifie la direction du serpent de façon aléatoire (IA).
   * Probabilité de 2/10 de changer à chaque appel.
   */
  planNextMove() {
    if (getRandomInt(10) < 2) {
      let nouvelleDirectionIA = getRandomInt(4);
      // On interdit les demi-tours immédiats
      if (Math.abs(this.direction - nouvelleDirectionIA) !== 2) {
        this.direction = nouvelleDirectionIA;
      }
    }
  }

  /**
   * Combine la planification IA et le mouvement de base.
   */
  move() {
    this.planNextMove();
    super.move();
  }
}

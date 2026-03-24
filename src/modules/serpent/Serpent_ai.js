import { getRandomInt } from "../../utils.js";
import Serpent from "./Serpent.js";
import { nbCells } from "../../constants.js";

/**
 * Sous-classe intelligente paramétrant un serpent piloté par algorithme (IA).
 * Permet l'apparition d'adversaires se dirigeant de façon automne sur la grille.
 * Hérite entièrement du rendu visuel et de la motorisation de la classe parente Serpent.
 */
export default class SerpentAI extends Serpent {
  /**
   * Détermine le prochain mouvement de l'IA de manière rudimentaire.
   * Évalue le danger d'obstacles muraux immédiats et applique un léger taux d'inflexion aléatoire du parcours.
   * Ne possède pas (encore) de `pathfinding` (A*) strict vers la pomme ou d'évitement des autres serpents.
   */
  planNextMove() {
    const tete = this.anneaux[0];
    let nextI = tete.i;
    let nextJ = tete.j;

    // Simulation virtuelle anticipée du prochain emplacement théorique
    switch (this.direction) {
      case 0:
        nextJ -= 1;
        break; // Haut
      case 1:
        nextI += 1;
        break; // Droite
      case 2:
        nextJ += 1;
        break; // Bas
      case 3:
        nextI -= 1;
        break; // Gauche
    }

    // Calcul de l'imminence stricte d'un crash hors limites
    const isHittingWall =
      nextI < 0 || nextI >= nbCells || nextJ < 0 || nextJ >= nbCells;

    // Stratégie réactive :
    // - Changement forcé de trajectoire si crash sur un mur imminent
    // - 20% de chances de changement de trajectoire par pure entropie locale "naturelle"
    if (isHittingWall || getRandomInt(10) < 2) {
      const validDirections = [];

      for (let d = 0; d < 4; d++) {
        // Validation basique conditionnelle interdisant un demi-tour brutal
        if (Math.abs(this.direction - d) === 2) continue;

        let testI = tete.i;
        let testJ = tete.j;

        // Simulation des vecteurs résiduels
        switch (d) {
          case 0:
            testJ -= 1;
            break; // Haut
          case 1:
            testI += 1;
            break; // Droite
          case 2:
            testJ += 1;
            break; // Bas
          case 3:
            testI -= 1;
            break; // Gauche
        }

        // On ne conserve que les vecteurs n'amendant pas à l'anéantissement hors grille
        if (testI >= 0 && testI < nbCells && testJ >= 0 && testJ < nbCells) {
          validDirections.push(d);
        }
      }

      // Pivote formellement la direction algorithmique actuelle du bot
      if (validDirections.length > 0) {
        this.direction =
          validDirections[Math.floor(Math.random() * validDirections.length)];
      }
    }
  }

  /**
   * Surcharge synchrone du moteur temporel de déplacement initial.
   * Fait appel en cascade à l'algorithme de pivot du bot avant application motrice super().
   */
  move() {
    this.planNextMove();
    super.move(); // L'amorce parente lance l'onde de cascade de déplacement du corps
  }
}

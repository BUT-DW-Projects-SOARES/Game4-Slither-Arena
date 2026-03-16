import Anneau from "./Anneau.js";

// Couleurs par défaut du serpent
const GREEN = "#6AA84F";
const DARK_GREEN = "#38761D";
const DARK_YELLOW = "#B7A800";

/**
 * Représente un serpent.
 */
export default class Serpent {
  /**
   * @param {number} longueur - Nombre d'anneaux du serpent.
   * @param {number} i - Coordonnée de colonne initiale.
   * @param {number} j - Coordonnée de ligne initiale.
   * @param {number} direction - Direction initiale (0: haut, 1: droite, 2: bas, 3: gauche).
   */
  constructor(longueur, i, j, direction) {
    this.anneaux = [];
    this.direction = direction;

    for (let index = 0; index < longueur; index++) {
      let couleur = GREEN;
      if (index === 0) couleur = DARK_GREEN;
      else if (index === longueur - 1) couleur = DARK_YELLOW;
      this.anneaux.push(new Anneau(i, j, couleur));
    }
  }

  /**
   * Affiche tous les anneaux du serpent.
   * @param {CanvasRenderingContext2D} ctx - Le contexte d'affichage.
   * @param {number} taille - La taille d'une cellule.
   */
  draw(ctx, taille) {
    this.anneaux.forEach((anneau) => anneau.draw(ctx, taille));
  }

  /**
   * Fait avancer le serpent.
   * Chaque anneau (sauf la tête) prend la position de celui qui le précède.
   */
  move() {
    // On part de la queue vers la tête
    for (let k = this.anneaux.length - 1; k > 0; k--) {
      this.anneaux[k].copy(this.anneaux[k - 1]);
    }
    // La tête avance selon la direction actuelle
    this.anneaux[0].move(this.direction);
  }

  /**
   * Allonge le serpent en ajoutant un anneau à la fin (queue).
   */
  extend() {
    const nbAnneaux = this.anneaux.length;
    const ancienneQueue = this.anneaux[nbAnneaux - 1];
    ancienneQueue.couleur = GREEN;
    const nouvelleQueue = new Anneau(ancienneQueue.i, ancienneQueue.j, GREEN);
    this.anneaux.push(nouvelleQueue);
  }
}

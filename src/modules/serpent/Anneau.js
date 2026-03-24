/** @module Anneau */

/**
 * Représente un segment abstrait du jeu (anneau physique d'un serpent ou autre entité de la grille).
 * Utilisé principalement pour gérer les coordonnées spatiales et temporelles.
 */
export default class Anneau {
  /**
   * Initialise les propriétés de l'anneau.
   * @param {number} i - L'indice de colonne sur la grille du jeu.
   * @param {number} j - L'indice de ligne sur la grille du jeu.
   * @param {string} couleur - Le code couleur CSS associé à cet anneau.
   */
  constructor(i, j, couleur) {
    /** @type {number} Position horizontale sur la grille */
    this.i = i;
    /** @type {number} Position verticale sur la grille */
    this.j = j;
    /** @type {string} Couleur CSS du segment */
    this.couleur = couleur;
  }

  /**
   * Applique un déplacement direct sur la grille dans la direction donnée.
   * Ne vérifie pas les collisions (délégué à la classe Serpent/Main).
   * @param {number} d - L'identifiant de la direction (0:Haut, 1:Droite, 2:Bas, 3:Gauche).
   */
  move(d) {
    switch (d) {
      case 0:
        this.j -= 1; // Haut
        break;
      case 1:
        this.i += 1; // Droite
        break;
      case 2:
        this.j += 1; // Bas
        break;
      case 3:
        this.i -= 1; // Gauche
        break;
    }
  }

  /**
   * Hérite de l'emplacement spatial d'un autre anneau.
   * Essentiel pour la cascade de mouvements du corps du serpent.
   * @param {Anneau} a - L'anneau cible dont on copie la position (souvent l'anneau précédent).
   */
  copy(a) {
    this.i = a.i;
    this.j = a.j;
  }
}

/**
 * Représente un anneau du serpent.
 */
export default class Anneau {
  /**
   * @param {number} i - Coordonnée de colonne (axe horizontal).
   * @param {number} j - Coordonnée de ligne (axe vertical).
   * @param {string} couleur - Couleur de l'anneau.
   */
  constructor(i, j, couleur) {
    this.i = i;
    this.j = j;
    this.couleur = couleur;
  }

  /**
   * Trace un rectangle plein représentant l'anneau.
   * @param {CanvasRenderingContext2D} ctx - Le contexte d'affichage.
   * @param {number} taille - La taille d'une cellule (ex: 20).
   */
  draw(ctx, taille) {
    ctx.fillStyle = this.couleur;
    ctx.fillRect(this.i * taille, this.j * taille, taille, taille);
  }

  /**
   * Déplace l'anneau selon une direction (0: haut, 1: droite, 2: bas, 3: gauche).
   * @param {number} d - Code de direction.
   */
  move(d) {
    switch (d) {
      case 0:
        this.j -= 1;
        break; // Haut
      case 1:
        this.i += 1;
        break; // Droite
      case 2:
        this.j += 1;
        break; // Bas
      case 3:
        this.i -= 1;
        break; // Gauche
    }
  }

  /**
   * Copie la position d'un autre anneau.
   * @param {Anneau} a - L'anneau à copier.
   */
  copy(a) {
    this.i = a.i;
    this.j = a.j;
  }
}

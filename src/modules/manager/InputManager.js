/**
 * Gère les flux d'entrées clavier du joueur.
 */
export default class InputManager {
  constructor() {
    /** @type {number[]} File d'attente des directions demandées par l'utilisateur (0:Haut, 1:Droite, 2:Bas, 3:Gauche) */
    this.directionQueue = [];
    this._setupListeners();
  }

  /**
   * Initialise les écouteurs d'événements clavier.
   * @private
   */
  _setupListeners() {
    window.addEventListener("keydown", (event) => {
      let nouvelleDirection = -1;
      switch (event.key.toLowerCase()) {
        case "z":
        case "arrowup":
          nouvelleDirection = 0; // Haut
          break;
        case "d":
        case "arrowright":
          nouvelleDirection = 1; // Droite
          break;
        case "s":
        case "arrowdown":
          nouvelleDirection = 2; // Bas
          break;
        case "q":
        case "arrowleft":
          nouvelleDirection = 3; // Gauche
          break;
      }

      if (nouvelleDirection !== -1) {
        this.directionQueue.push(nouvelleDirection);
      }
    });
  }

  /**
   * Récupère la prochaine direction valide de la file d'attente.
   * Empêche les demi-tours directs à 180 degrés.
   * @param {number} currentDirection - La direction actuelle du serpent joueur.
   * @returns {number|null} La nouvelle direction ou null si aucune direction valide n'est en attente.
   */
  getNextDirection(currentDirection) {
    while (this.directionQueue.length > 0) {
      const d = this.directionQueue.shift();
      // Interdiction du demi-tour (0/2 ou 1/3)
      if (Math.abs(currentDirection - d) !== 2) {
        return d;
      }
    }
    return null;
  }

  /**
   * Purge la file d'attente des commandes.
   */
  reset() {
    this.directionQueue = [];
  }
}

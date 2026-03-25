/**
 * Gère la collection et le cycle de vie des entités (Serpents).
 * Centralise l'accès au joueur et les opérations de groupe sur les IA.
 */
export default class EntityManager {
  constructor() {
    /** @type {Serpent[]} Liste complète des serpents */
    this.serpents = [];
    /** @type {Serpent|null} Référence directe au joueur */
    this.joueur = null;
  }

  /**
   * Réinitialise la collection avec le joueur.
   * @param {Serpent} joueur
   */
  init(joueur) {
    this.joueur = joueur;
    this.serpents = [joueur];
  }

  /**
   * Ajoute une nouvelle entité à la simulation.
   * @param {Serpent} s
   */
  add(s) {
    this.serpents.push(s);
  }

  /**
   * Supprime les entités mortes, en préservant le joueur si nécessaire (pour l'affichage Game Over).
   */
  cleanup() {
    this.serpents = this.serpents.filter((s) => !s.dead || s === this.joueur);
  }

  /**
   * Retourne uniquement les serpents vivants.
   * @returns {Serpent[]}
   */
  getAlive() {
    return this.serpents.filter((s) => !s.dead);
  }

  /**
   * Retourne la liste des IA uniquement.
   * @returns {SerpentAI[]}
   */
  getAIs() {
    return this.serpents.filter((s) => s !== this.joueur);
  }

  /**
   * Réinitialise tout.
   */
  reset() {
    this.serpents = [];
    this.joueur = null;
  }
}

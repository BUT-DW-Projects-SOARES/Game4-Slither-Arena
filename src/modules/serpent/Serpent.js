import Anneau from "./Anneau.js";
import { COLORS, nbCells } from "../../constants.js";

/**
 * Entité représentant un serpent sur la grille.
 * Gère sa propre structure corporelle (liste d'anneaux), ses déplacements et son rendu stylisé.
 */
export default class Serpent {
  /**
   * Crée un nouveau serpent à une position donnée avec une longueur initiale.
   * @param {number} longueur - Nombre de segments initiaux (tête + corps).
   * @param {number} i - L'indice de colonne (axe X) initial de la tête sur la grille.
   * @param {number} j - L'indice de ligne (axe Y) initial de la tête sur la grille.
   * @param {number} direction - Direction initiale (0:Haut, 1:Droite, 2:Bas, 3:Gauche).
   */
  constructor(longueur, i, j, direction) {
    /**
     * Liste chronologique des segments, de la tête [0] à la queue [n].
     * @type {Anneau[]}
     */
    this.anneaux = [];

    /**
     * Direction actuelle du mouvement (0:Haut, 1:Droite, 2:Bas, 3:Gauche).
     * @type {number}
     */
    this.direction = direction;

    /**
     * État de survie du serpent (utilisé pour le cycle de vie des IA et le Game Over).
     * @type {boolean}
     */
    this.dead = false;

    /**
     * Timestamp (performance.now()) indiquant la fin de l'effet d'invincibilité.
     * @type {number|null}
     */
    this.invincibleUntil = null;

    /**
     * File d'attente des animations de pulsation de croissance (Domino Effect).
     * Chaque objet contient un startTime.
     * @type {Array<{startTime: number}>}
     */
    this.pulses = [];

    // Construction du serpent initial
    for (let index = 0; index < longueur; index++) {
      let couleur = COLORS.snakeBody;
      if (index === 0) couleur = COLORS.snakeHead;
      else if (index === longueur - 1) couleur = COLORS.snakeTail;
      this.anneaux.push(new Anneau(i, j, couleur));
    }
  }

  /**
   * Vérifie si le serpent est actuellement sous l'effet du PowerUp d'invincibilité.
   * @returns {boolean} True si le pouvoir est actif.
   */
  isInvincible(timestamp = performance.now()) {
    return this.invincibleUntil ? timestamp < this.invincibleUntil : false;
  }

  /**
   * Affiche le serpent sur le canvas avec l'effet Domino Growth.
   * @param {CanvasRenderingContext2D} ctx - Le contexte 2D.
   * @param {number} taille - Taille de la grille (px).
   */
  draw(ctx, taille) {
    if (this.anneaux.length === 0) return;

    const now = performance.now();
    const isInv = this.isInvincible(now);

    // Nettoyage des vieux pulses
    this.pulses = this.pulses.filter(
      (p) => now - p.startTime < this.anneaux.length * 100 + 500,
    );

    // Dessin du corps segment par segment pour permettre le scaling individuel
    for (let k = this.anneaux.length - 1; k >= 0; k--) {
      const a = this.anneaux[k];
      const cx = a.i * taille + taille / 2;
      const cy = a.j * taille + taille / 2;

      // Calcul du scale "Domino"
      let scale = 1.0;
      this.pulses.forEach((p) => {
        const delay = k * 80; // Délai par segment pour l'effet domino
        const elapsed = now - (p.startTime + delay);
        if (elapsed > 0 && elapsed < 400) {
          // Courbe de croissance fluide
          scale += Math.sin((elapsed / 400) * Math.PI) * 0.6;
        }
      });

      if (k === 0) {
        // Tête
        if (isInv) {
          ctx.fillStyle = COLORS.powerup;
          ctx.shadowColor = COLORS.powerup;
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = a.couleur || COLORS.snakeHead;
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, taille * 0.45 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Yeux
        this._drawEyes(ctx, cx, cy, taille * scale);
      } else {
        // Corps
        if (isInv) {
          ctx.fillStyle = COLORS.powerup;
          ctx.shadowColor = COLORS.powerup;
          ctx.shadowBlur = 10 + Math.sin(now / 60) * 10;
        } else {
          ctx.fillStyle = a.couleur || COLORS.snakeBody;
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, taille * 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  /**
   * Dessine les yeux sur la tête.
   */
  _drawEyes(ctx, hx, hy, taille) {
    const eyeRadius = taille * 0.12;
    const eyeOffset = taille * 0.22;
    const eyeDist = taille * 0.15;

    let e1x, e1y, e2x, e2y;
    if (this.direction === 0) {
      e1x = hx - eyeOffset;
      e1y = hy - eyeDist;
      e2x = hx + eyeOffset;
      e2y = hy - eyeDist;
    } else if (this.direction === 1) {
      e1x = hx + eyeDist;
      e1y = hy - eyeOffset;
      e2x = hx + eyeDist;
      e2y = hy + eyeOffset;
    } else if (this.direction === 2) {
      e1x = hx - eyeOffset;
      e1y = hy + eyeDist;
      e2x = hx + eyeOffset;
      e2y = hy + eyeDist;
    } else {
      e1x = hx - eyeDist;
      e1y = hy - eyeOffset;
      e2x = hx - eyeDist;
      e2y = hy + eyeOffset;
    }

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2x, e2y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2x, e2y, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Fait avancer le serpent d'une case.
   * Si le serpent est invincible, il peut traverser les murs (Wrapping).
   */
  move() {
    for (let k = this.anneaux.length - 1; k > 0; k--) {
      this.anneaux[k].copy(this.anneaux[k - 1]);
    }

    // Deplacement de la tête
    this.anneaux[0].move(this.direction);

    // Effet "Fantôme" (Wrapping) si invincible
    if (this.isInvincible()) {
      if (this.anneaux[0].i < 0) this.anneaux[0].i = nbCells - 1;
      else if (this.anneaux[0].i >= nbCells) this.anneaux[0].i = 0;

      if (this.anneaux[0].j < 0) this.anneaux[0].j = nbCells - 1;
      else if (this.anneaux[0].j >= nbCells) this.anneaux[0].j = 0;
    }
  }

  /**
   * Permet au serpent de grandir après avoir mangé.
   * L'ancienne queue mute en élément central de corps, et une nouvelle queue calquée est rattachée.
   */
  extend() {
    const nbAnneaux = this.anneaux.length;
    const ancienneQueue = this.anneaux[nbAnneaux - 1];

    ancienneQueue.couleur = COLORS.snakeBody;
    const nouvelleQueue = new Anneau(
      ancienneQueue.i,
      ancienneQueue.j,
      COLORS.snakeTail,
    );
    this.anneaux.push(nouvelleQueue);

    // Déclencher une pulsation de croissance
    this.pulses.push({ startTime: performance.now() });
  }

  /**
   * Analyse récursive si la tête s'est encastrée dans le corps du serpent.
   * @returns {boolean} True en cas d'acte cannibalistique.
   */
  checkSelfCollision() {
    const tete = this.anneaux[0];
    for (let k = 1; k < this.anneaux.length; k++) {
      if (tete.i === this.anneaux[k].i && tete.j === this.anneaux[k].j) {
        return true;
      }
    }
    return false;
  }

  /**
   * Teste l'effraction des limites de l'arène.
   * @param {number} nbCells - Le nombre total de cellules par axe orthogonal.
   * @returns {boolean} True si le serpent sort du périmètre de jeu.
   */
  checkWallCollision(nbCells) {
    if (this.isInvincible()) return false;
    const tete = this.anneaux[0];
    return tete.i < 0 || tete.i >= nbCells || tete.j < 0 || tete.j >= nbCells;
  }

  /**
   * Confronte la position de la tête avec l'intégralité d'un serpent adverse.
   * @param {Serpent} autre - L'instance du compétiteur à évaluer.
   * @returns {boolean} True si le serpent écrase l'autre.
   */
  checkCollisionWith(autre) {
    const tete = this.anneaux[0];
    for (let k = 0; k < autre.anneaux.length; k++) {
      if (tete.i === autre.anneaux[k].i && tete.j === autre.anneaux[k].j) {
        return true;
      }
    }
    return false;
  }
}

import Anneau from "./Anneau.js";
import { COLORS } from "../../constants.js";

/**
 * Entité représentant un serpent sur la grille.
 * Gère sa propre structure corporelle (liste d'anneaux), ses déplacements et son rendu stylisé.
 */
export default class Serpent {
  /**
   * Crée un nouveau serpent à une position donnée avec une longueur initiale.
   * @param {number} longueur - Nombre de segments initiaux (tête + corps).
   * @param {number} i - L'indice de colonne (axe X) initial de la tête.
   * @param {number} j - L'indice de ligne (axe Y) initial de la tête.
   * @param {number} direction - Direction initiale (0:Haut, 1:Droite, 2:Bas, 3:Gauche).
   */
  constructor(longueur, i, j, direction) {
    /** @type {Anneau[]} Liste chronologique des segments, de la tête [0] à la queue [n] */
    this.anneaux = [];
    /** @type {number} Direction actuelle du mouvement (0:Haut, 1:Droite, 2:Bas, 3:Gauche) */
    this.direction = direction;
    /** @type {boolean} État de survie du serpent (utilisé pour le nettoyage des IA) */
    this.dead = false;
    /** @type {number|null} Timestamp milliseconde jusqu'auquel le serpent est invincible */
    this.invincibleUntil = null;

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
   * Affiche le serpent sur le canvas.
   * @param {CanvasRenderingContext2D} ctx - Le contexte 2D.
   * @param {number} taille - Taille de la grille (px).
   */
  draw(ctx, taille) {
    if (this.anneaux.length === 0) return;

    ctx.lineWidth = taille * 0.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const isInv = this.isInvincible();

    // Dessin du corps
    if (this.anneaux.length > 1) {
      if (isInv) {
        ctx.strokeStyle = COLORS.powerup;
        ctx.shadowColor = COLORS.powerup;
        ctx.shadowBlur = 10 + Math.sin(Date.now() / 60) * 10;
      } else {
        ctx.strokeStyle = this.anneaux[1].couleur || COLORS.snakeBody;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();

      const queue = this.anneaux[this.anneaux.length - 1];
      ctx.moveTo(queue.i * taille + taille / 2, queue.j * taille + taille / 2);

      for (let k = this.anneaux.length - 2; k >= 0; k--) {
        const a = this.anneaux[k];
        ctx.lineTo(a.i * taille + taille / 2, a.j * taille + taille / 2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // Dessin de la tête
    const tete = this.anneaux[0];
    const hx = tete.i * taille + taille / 2;
    const hy = tete.j * taille + taille / 2;

    if (isInv) {
      ctx.fillStyle = COLORS.powerup;
      ctx.shadowColor = COLORS.powerup;
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = tete.couleur || COLORS.snakeHead;
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.arc(hx, hy, taille * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ajout des yeux asymétriques selon la direction
    const eyeRadius = taille * 0.12;
    const eyeOffset = taille * 0.22; // Écartement latéral depuis le centre
    const eyeDist = taille * 0.15; // Avancée sur le museau

    let e1x, e1y, e2x, e2y;
    // Traduction de la direction : 0: haut, 1: droite, 2: bas, 3: gauche
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

    // Globules blancs
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2x, e2y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pupilles
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2x, e2y, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Fait avancer le serpent d'une case de façon incrémentale.
   * La queue suit le corps chronologiquement depuis l'arrière.
   */
  move() {
    for (let k = this.anneaux.length - 1; k > 0; k--) {
      this.anneaux[k].copy(this.anneaux[k - 1]);
    }
    // Application de la direction finale sur l'anneau d'amorce
    this.anneaux[0].move(this.direction);
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

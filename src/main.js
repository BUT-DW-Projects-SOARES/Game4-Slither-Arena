import "./style.css";
import { getRandomInt } from "./utils";
import Anneau from "./modules/Anneau.js";
import Serpent from "./modules/Serpent.js";
import SerpentAI from "./modules/Serpent_ai.js";

const canvas = document.getElementById("terrain");
const ctx = canvas.getContext("2d");
const scoreValElem = document.getElementById("score-val");
const TAILLE_CELLULE = 20;
const nbCells = 20;
const black = "#000000";
const red = "#FF0000";

// --- Configuration du jeu ---

let serpents = [];
let joueur;
let pomme;
let score = 0;
let gameInterval;

// --- Contrôles (AZERTY / ZQSD + Flèches) ---

window.addEventListener("keydown", (event) => {
  if (!joueur) return;
  let nouvelleDirection = -1;
  switch (event.key.toLowerCase()) {
    case "z":
    case "arrowup":
      nouvelleDirection = 0;
      break;
    case "d":
    case "arrowright":
      nouvelleDirection = 1;
      break;
    case "s":
    case "arrowdown":
      nouvelleDirection = 2;
      break;
    case "q":
    case "arrowleft":
      nouvelleDirection = 3;
      break;
  }

  if (
    nouvelleDirection !== -1 &&
    Math.abs(joueur.direction - nouvelleDirection) !== 2
  ) {
    joueur.direction = nouvelleDirection;
  }
});

// --- Gestion du plein écran (F11) ---

window.addEventListener("keydown", (event) => {
  if (event.key === "F11") {
    event.preventDefault(); // Empêcher le plein écran natif du navigateur
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch((err) => {
        console.log(`Erreur plein écran: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
});

/**
 * Génère une pomme à une position aléatoire qui n'est pas occupée par le serpent.
 */
function spawnFood() {
  let x, y;
  let collision;
  do {
    collision = false;
    x = getRandomInt(nbCells);
    y = getRandomInt(nbCells);

    // Vérifier si la position est occupée par un serpent
    serpents.forEach((s) => {
      s.anneaux.forEach((a) => {
        if (a.i === x && a.j === y) collision = true;
      });
    });
  } while (collision);

  pomme = new Anneau(x, y, red); // Rouge pour la pomme
}

/**
 * Ajoute un bouton start/restart au-dessous du terrain.
 */
function addButton(callback) {
  let btn = document.getElementById("game-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "game-btn";
    btn.textContent = "Start Game";
    document.getElementById("terrain-container").appendChild(btn);
  }
  btn.style.display = "block";
  btn.onclick = () => {
    btn.style.display = "none";
    callback();
  };
}

/**
 * Arrête le jeu et affiche un message.
 */
function gameOver(message) {
  clearInterval(gameInterval);
  ctx.fillStyle = black;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "16px Arial";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText(
    `Score final: ${score}`,
    canvas.width / 2,
    canvas.height / 2 + 55,
  );

  addButton(startGame);
}

function update() {
  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Afficher la pomme
  if (pomme) pomme.draw(ctx, TAILLE_CELLULE);

  serpents.forEach((s) => {
    // Mouvement (IA gérée en interne par SerpentAI)
    s.move();

    // --- Détection des collisions ---

    // 1. Collision avec les murs
    if (s.checkWallCollision(nbCells)) {
      if (s === joueur) {
        gameOver("Vous avez percuté un mur !");
      } else {
        s.dead = true; // L'IA disparaît
      }
      return;
    }

    // 2. Collision avec soi-même
    if (s.checkSelfCollision()) {
      if (s === joueur) {
        gameOver("Vous vous êtes mordu !");
      } else {
        s.dead = true; // L'IA disparaît
      }
      return;
    }

    // 3. Collision avec les autres serpents
    serpents.forEach((autre) => {
      if (s !== autre && s.checkCollisionWith(autre)) {
        if (s === joueur) {
          gameOver("Vous avez percuté un autre serpent !");
        } else if (autre === joueur) {
          gameOver("Un serpent vous a percuté !");
        } else {
          s.dead = true; // Une IA en percute une autre
        }
      }
    });

    // 4. Manger la pomme
    if (s.anneaux[0].i === pomme.i && s.anneaux[0].j === pomme.j) {
      score++;
      scoreValElem.textContent = score;
      s.extend();
      spawnFood();

      // Apparition d'un serpent AI tous les 10 points
      if (score > 0 && score % 10 === 0) {
        serpents.push(
          new SerpentAI(
            3,
            getRandomInt(nbCells),
            getRandomInt(nbCells),
            getRandomInt(4),
          ),
        );
      }
    }

    // Affichage
    if (!s.dead) s.draw(ctx, TAILLE_CELLULE);
  });

  // Nettoyage des serpents morts (IA uniquement)
  serpents = serpents.filter((s) => !s.dead);
}

/**
 * Initialise le jeu et lance la boucle.
 */
function startGame() {
  score = 0;
  scoreValElem.textContent = score;

  // Serpent à 2 anneaux au centre
  serpents = [new Serpent(2, 10, 10, 1)];
  joueur = serpents[0];

  spawnFood();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(update, 150);
}

// Initialisation
addButton(startGame);

console.log("Jeu prêt avec IA corrigée.");

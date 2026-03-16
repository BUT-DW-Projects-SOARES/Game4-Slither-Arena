import "./style.css";
import { getRandomInt } from "./utils";
import Anneau from "./modules/Anneau.js";
import Serpent from "./modules/Serpent.js";

const canvas = document.getElementById("terrain");
const ctx = canvas.getContext("2d");
const TAILLE_CELLULE = 20;

// --- Animation ---

const serpents = [
  new Serpent(5, 5, 5, 1),
  new Serpent(10, 15, 15, 0),
  new Serpent(3, 10, 10, 2),
];

function update() {
  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  serpents.forEach((s) => {
    // Changement de direction aléatoire (probabilité de 2/10)
    if (getRandomInt(10) < 2) {
      let nouvelleDirection = getRandomInt(4);
      // On interdit les demi-tours immédiats (ex: 0 -> 2 ou 1 -> 3)
      if (Math.abs(s.direction - nouvelleDirection) !== 2) {
        s.direction = nouvelleDirection;
      }
    }

    s.move();
    s.draw(ctx, TAILLE_CELLULE);
  });
}

// Lancer l'animation (toutes les 150ms pour que ce soit jouable visuellement)
setInterval(update, 150);

console.log("Animation lancée avec modules.");

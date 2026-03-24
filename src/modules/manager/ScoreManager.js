/**
 * Gère la persistance des scores (localStorage) et la mise à jour de l'interface du Scoreboard.
 */
export default class ScoreManager {
  /**
   * @param {string} storageKey - La clé de stockage localStorage.
   */
  constructor(storageKey = "slither_arena_scores") {
    /** @type {string} Clé unique pour le localStorage */
    this.STORAGE_KEY = storageKey;
    /** @type {HTMLElement|null} Élément de liste HTML du scoreboard */
    this.scoreboardList = document.getElementById("scoreboard-list");
    /** @type {HTMLElement|null} Overlay HTML du scoreboard */
    this.scoreboardOverlay = document.getElementById("scoreboard-overlay");
  }

  /**
   * Récupère la liste des meilleurs scores.
   * @returns {Array} Liste des objets scores.
   */
  getScores() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Sauvegarde un nouveau score dans le top 10.
   * @param {number} value - Le montant du score.
   */
  saveScore(value) {
    if (value <= 0) return;

    const scores = this.getScores();
    scores.push({
      score: value,
      date: new Date().toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    // Tri et limitation au top 10
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
      console.warn("Could not save score to localStorage", e);
    }
  }

  /**
   * Supprime l'intégralité des scores enregistrés.
   */
  clearScores() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.renderScoreboard();
  }

  /**
   * Met à jour dynamiquement le contenu du Scoreboard dans le DOM.
   */
  renderScoreboard() {
    if (!this.scoreboardList) return;

    const scores = this.getScores();
    this.scoreboardList.innerHTML = "";

    if (scores.length === 0) {
      this.scoreboardList.innerHTML =
        '<li class="scoreboard-empty">Aucun score enregistré</li>';
      return;
    }

    scores.forEach((entry, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="rank">#${index + 1}</span>
        <span class="score-date">${entry.date}</span>
        <span class="score-value">${entry.score}</span>
      `;
      this.scoreboardList.appendChild(li);
    });
  }

  /**
   * Affiche l'overlay du scoreboard.
   */
  show() {
    this.renderScoreboard();
    this.scoreboardOverlay.classList.remove("hidden");
  }

  /**
   * Cache l'overlay du scoreboard.
   */
  hide() {
    this.scoreboardOverlay.classList.add("hidden");
  }
}

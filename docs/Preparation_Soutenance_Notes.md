# Préparation à la Soutenance - Slither Arena

Ce document regroupe les points clés de la préparation effectuée avec l'équipe BMAD (John, Winston, Quinn et Caravaggio) pour la présentation du projet.

## 📊 Critères de Notation (Rappel)

- **Compréhension du code (8 pts)** : Savoir expliquer chaque partie du code.
- **Fonctionnalités techniques (5 pts)** : Présence et fonctionnement des mécaniques demandées.
- **Structure du code / Qualité (3 pts)** : Modularité, héritage, nommage, absence de redondance.
- **Créativité / Initiative (2 pts)** : Ajouts personnels et variantes.
- **Robustesse (1 pt)** : Absence de bugs et erreurs d'exécution.
- **Documentation / Clarté (1 pt)** : Commentaires JSDoc et organisation.

---

## 🏗️ Fiche de Révision Technique

### 1. La Boucle de Jeu (Ticker)

- **Mécanisme** : Utilisation de `requestAnimationFrame` plutôt que `setInterval`.
- **Pourquoi ?** : Meilleure fluidité, synchronisation avec le rafraîchissement écran (Hz), et économie de batterie (se met en pause si l'onglet est inactif).
- **Frame Independence** : Utilisation du `deltaTime` pour garantir que le jeu tourne à la même vitesse (FPS cible) quel que soit l'écran (ex: protection contre les écrans 144Hz qui pourraient accélérer le jeu indûment).
- **Vitesse** : Accélération progressive à partir de 12 points (de 10 FPS à 20 FPS).

### 2. Mouvement en "Cascade" (Serpent)

- **Algorithme** : Dans `move()`, on parcourt les anneaux de la fin vers le début.
- **Logique** : Chaque segment `k` prend la position du segment `k-1` (`copy()`). La tête (`anneaux[0]`) bouge en dernier.
- **Avantage** : Assure que le corps suit la tête de manière organique sans calculs de trajectoire lourds.

### 3. Architecture et Héritage (OOP)

- **Structure** : Découpage en 3 grands dossiers :
  - `logic` : Moteur, collisions, spawn, état du jeu.
  - `manager` : Inputs (clavier/tactile), Score (Local Storage), UI, Items.
  - `serpent` : Entités physiques.
- **Héritage** : `Serpent_ai` hérite de `Serpent`.
  - `super()` : Appelle le constructeur parent pour initialiser les anneaux de base.
  - **Surcharge (Override)** : On réécrit seulement la logique de direction et la couleur pour l'IA, tout en gardant le reste (dessin, mouvement de base) de la classe parente.

### 4. Collisions et Optimisation

- **Méthode `.some()`** : Utilisée dans `checkCollisionWith`.
- **Technique** : Elle "court-circuite" (s'arrête) dès qu'elle trouve une collision, ce qui est plus performant qu'une boucle `forEach` qui parcourrait tout le corps inutilement.

### 5. Système de Debugging et Monitoring

- **Console Avancée** : Utilisation de `console.group()` avec style CSS (`%c`) et `console.table()` pour la lisibilité des données techniques.
- **Visibilité IA** : Permet de voir en temps réel l'état interne de chaque IA (HUNT, RUSH, Wander) et ses coordonnées exactes.
- **Équilibrage** : Outil indispensable pour ajuster la difficulté (FPS, probabilités de mouvement) sans "jouer à l'aveugle".
- **Toggle UI** : Intégré à l'interface de pause, ce qui montre un souci de l'expérience développeur (DX).

---

## 🚀 Méthodologie Agile & IA

- **Approche Pilotée** : Utilisation de BMAD (Agentic AI) pour structurer le développement via des workflow (Step-by-step).
- **Multi-LLM Strategy** :
  - **Claude** : Utilisé pour la réflexion complexe, la structure modulaire et la revue de code adversaire.
  - **Gemini** : Utilisé pour la vision d'ensemble et la génération de structure initiale.
- **Rôle de l'Étudiant** : "Chef d'orchestre" et "Revueur de code". L'IA propose, l'étudiant vérifie, comprend et valide chaque choix technique.

---

## 💡 Conseils pour le Jour J

- **Show, then Tell** : Lance la démo, montre l'effet de pulsation (Math.sin) et la fluidité.
- **Justification** : Si on te pose une question sur une ligne complexe, explique le **but** de la fonction et pourquoi tu as choisi cette structure modulaire (maintenabilité).
- **Bonus** : Mentionne le choix du `Local Storage` pour la persistance des scores comme une initiative personnelle pour améliorer l'expérience utilisateur.

---

**Bonne chance pour demain ! Tu maîtrises ton sujet.** 🍀

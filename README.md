# 🐍 Slither Arena — TP n°3 (GAME4)

Slither Arena est un jeu web de type Snake développé en **JavaScript ES2022+** avec l'API **HTML5 Canvas** et **Vite**. Le projet met en œuvre une architecture modulaire orientée objet avec système d'IA, gestion de collisions avancée, et une interface responsive compatible mobile.

# ⚡ Live Demo

https://soares.etu.mmi-unistra.fr/Game4-Slither-Arena/

## 🎮 Fonctionnalités

- **Architecture Modulaire** : Moteur (`GameEngine`) orchestrant des systèmes spécialisés indépendants.
- **Grille 2D Dynamique** : Classe `Terrain` utilisée pour suivre l'occupation des cellules par les serpents.
- **Intelligence Artificielle** : Serpents IA avec comportements multiples (Wander, Rush, Hunt) et esquive locale (look-ahead 1 case).
- **Système de Collisions** : Détection murs, auto-morsure, inter-serpents, et collecte d'items.
- **PowerUps** : Bonus d'invincibilité permettant de traverser les murs et détruire les IA.
- **Effets Visuels** : Particules d'explosion, pulsations de croissance, yeux directionnels.
- **Responsive & Tactile** : D-Pad optimisé pour mobile (iPhone SE inclus).
- **Persistance** : Tableau des 10 meilleurs scores via `localStorage`.
- **HiDPI** : Rendu net sur écrans Retina grâce au `devicePixelRatio`.
- **Plein Écran** : Tentative via touche `F11` (selon navigateur, OS et permissions).

## 🏛️ Architecture

```
src/
├── main.js              # Bootstrap et configuration HiDPI
├── style.css            # Design premium (Dark Mode, Glassmorphism)
├── constants.js         # Configuration globale (FPS, couleurs, équilibrage)
├── utils.js             # Helpers mathématiques
└── modules/
    ├── GameEngine.js    # Orchestrateur central
    ├── logic/
    │   ├── Ticker.js         # Boucle temporelle (requestAnimationFrame)
    │   ├── GameState.js      # État de session (score, difficulté)
    │   ├── EntityManager.js  # Registre des entités vivantes
    │   ├── Terrain.js        # Grille 2D d'occupation des cellules
    │   ├── SpawnSystem.js    # Génération IA et bonus
    │   ├── CollisionSystem.js# Résolution des impacts
    │   └── Renderer.js       # Pipeline de rendu Canvas
    ├── manager/
    │   ├── InputManager.js      # Centralisation clavier (Action Mapping)
    │   ├── InteractionManager.js# Pont DOM/Tactile/Moteur
    │   ├── UIManager.js         # HUD et overlays
    │   ├── ScoreManager.js      # Persistance localStorage
    │   └── ItemManager.js       # Pommes, PowerUps, particules
    └── serpent/
        ├── Serpent.js        # Entité joueur
        ├── Serpent_ai.js     # Entité IA (héritage)
        └── Anneau.js         # Segment unitaire
```

## 🛠️ Installation

```bash
pnpm install
pnpm run dev
```

Alternative npm :

```bash
npm install
npm run dev
```

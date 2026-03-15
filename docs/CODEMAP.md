# CODEMAP

Stand: 2026-03-12
Scope: Struktur-Übersicht (Dateinamen/Pfade), max depth 4, ohne Inhaltsanalyse.

## Legend
- `[ENTRY]` = Entry Points (Startdateien / Main / Game Loop)
- `[CORE]` = Core Systems / Manager / Controller
- `[CONFIG]` = Config / Build / Runtime-Konfiguration
- `[ASSET]` = Assets (Bilder, statische Ressourcen)

## Project Tree (max depth 4)

```text
.
├── api/
│   └── [...path].js [ENTRY]
├── docs/
│   ├── AGENTS.md
│   ├── ARCHITECTURE.md
│   ├── CODEMAP.md
│   ├── DECISIONS_LOG.md
│   ├── PDF_NOTES.md
│   ├── PDF_TO_TASKS.md
│   ├── PROJECT_CONTEXT.md
│   ├── README.md
│   ├── RUNBOOK.md
│   └── TASKS_NEXT.md
├── index.html [ENTRY]
├── package.json [CONFIG]
├── package-lock.json [CONFIG]
├── vite.config.js [CONFIG]
├── public/
│   ├── dialogs.json [CONFIG]
│   └── backgrounds/ [ASSET]
│       ├── Media Lab.png [ASSET]
│       ├── Willkommen.png [ASSET]
│       ├── avatar-klara.png [ASSET]
│       ├── avatar-uwe.png [ASSET]
│       ├── avatar_boy.png [ASSET]
│       ├── avatar_dog.png [ASSET]
│       ├── avatar_girl.png [ASSET]
│       ├── default-scene.png [ASSET]
│       ├── keller-klara.png [ASSET]
│       ├── keller-monitor.png [ASSET]
│       ├── keller-scene.png [ASSET]
│       ├── keller-uwe.png [ASSET]
│       ├── media-lab.png [ASSET]
│       ├── open-office-scene.svg [ASSET]
│       ├── private-office-scene.svg [ASSET]
│       └── regelreich-panorama.svg [ASSET]
├── server/
│   ├── app.js [CORE]
│   ├── index.js [ENTRY]
│   ├── data/
│   │   └── dialogs.json [CONFIG]
│   └── lib/
│       ├── dialogSeed.js [CORE]
│       ├── dialogStore.js [CORE]
│       └── dialogValidation.js [CORE]
├── src/
│   ├── App.jsx [ENTRY]
│   ├── main.jsx [ENTRY]
│   ├── index.css
│   ├── api/
│   │   └── dialogApi.js [CORE]
│   ├── hooks/
│   │   └── useScene.js [CORE]
│   ├── data/
│   │   ├── constants.js [CONFIG]
│   │   ├── scenes.js [CONFIG]
│   │   └── conversations/
│   │       └── part1.js [CONFIG]
│   ├── pages/
│   │   ├── AdminDialogScreen.jsx [CORE]
│   │   └── GameScreen.jsx [ENTRY]
│   └── components/
│       ├── chat/
│       │   └── ChatPanel.jsx [CORE]
│       ├── layout/
│       │   ├── HostAvatar.jsx [CORE]
│       │   └── PlayerAvatars.jsx
│       └── scene/
│           ├── MonitorActivityScene.jsx [CORE]
│           ├── Scene.jsx [CORE]
│           └── SceneBackground.jsx [CORE]
├── avatar_boy.png [ASSET]
├── avatar_dog.png [ASSET]
├── avatar_girl.png [ASSET]
├── default-scene.png [ASSET]
└── keller-scene.png [ASSET]
```

## Entry Points
- `api/[...path].js`
- `index.html`
- `src/main.jsx`
- `src/App.jsx`
- `src/pages/GameScreen.jsx`
- `server/index.js`

## Core Systems / Manager / Controller
- Frontend flow & orchestration:
  - `src/pages/GameScreen.jsx`
  - `src/pages/AdminDialogScreen.jsx`
  - `src/hooks/useScene.js`
- Frontend runtime components:
  - `src/components/scene/Scene.jsx`
  - `src/components/scene/SceneBackground.jsx`
  - `src/components/scene/MonitorActivityScene.jsx`
  - `src/components/chat/ChatPanel.jsx`
    - gemeinsame Absatzdarstellung für Laufzeit-Nachrichten
  - `src/components/layout/HostAvatar.jsx`
- Frontend/backend boundary:
  - `src/api/dialogApi.js`
- Backend core:
  - `server/app.js`
  - `server/lib/dialogStore.js`
  - `server/lib/dialogValidation.js`
  - `server/lib/dialogSeed.js`

## Config / Assets
- Config/build/runtime:
  - `package.json`
  - `package-lock.json`
  - `vite.config.js`
  - `public/dialogs.json`
  - `src/data/constants.js`
  - `src/data/scenes.js`
  - `src/data/conversations/part1.js`
  - `server/data/dialogs.json`
- Assets:
  - `public/backgrounds/*`
  - root PNG assets (`avatar_*.png`, `default-scene.png`, `keller-scene.png`)

## Top 15 files to read for architecture understanding
1. `src/main.jsx`
2. `src/App.jsx`
3. `src/pages/GameScreen.jsx`
4. `src/pages/AdminDialogScreen.jsx`
5. `src/components/scene/Scene.jsx`
6. `src/components/chat/ChatPanel.jsx`
7. `src/hooks/useScene.js`
8. `src/api/dialogApi.js`
9. `src/data/scenes.js`
10. `src/data/constants.js`
11. `server/index.js`
12. `server/app.js`
13. `server/lib/dialogStore.js`

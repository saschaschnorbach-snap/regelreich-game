# Project Context

Stand: 2026-03-08

## Ziel und Produkt
Regelreich ist ein dialogbasiertes Lernspiel (Deutsch) zur Erkennung manipulativer Kommunikationsmuster. Das Projekt kombiniert Spielmodus und Admin-Dialogverwaltung in einer React/Vite-Webapp mit lokalem Express-Backend.

## Aktueller IST-Stand
- Ein Frontend mit zwei Modi: `Spiel` und `Admin` (Umschaltung in `src/App.jsx`).
- Spielverlauf über Teile `0..5`.
- Teil 0: Avatarwahl; Teil 1: Host-Auswahl (Clara/Uwe); Teile 2-4: fallaktenbasierte Aktivitäten; Teil 5: Abschluss.
- Dialoge werden primär über Backend geladen; bei Ausfall greifen Frontend-Fallbacks.
- Subkapitel-Navigation wird aus Step-Typen (`intro/example/activity/summary/transition`) abgeleitet.
- Host-Auswahl wird in `localStorage` persistiert.

## Hauptnutzerflüsse
1. Einstieg über `index.html` -> `src/main.jsx` -> `src/App.jsx`.
2. Im Spiel navigiert der Nutzer zwischen Teilen und Unterkapiteln.
3. `GameScreen` rendert Szenen, Chatverlauf und interaktive Aufgaben; Antworten steuern `nextStep` oder `nextPart`.
4. Im Admin-Modus werden Szenen geladen, Steps erstellt/editiert/gelöscht, inklusive Branch-Flow und optionalem `activityConfig`-JSON.

## Laufzeit-Datenmodell (relevant)
- `sceneId` 0..5 mit `steps[]`.
- Step: `stepIndex`, `type`, `speechBubbles[]`, `options[]`, optional `activityConfig`.
- `speechBubbles[]`: `hostId`, `text`, optional `showOnOptionId`.
- `options[]`: `id`, `label`, optional `nextStep`, optional `nextPart`.

## Technischer Betrieb
- Frontend: Vite/React.
- Backend: Express + JSON-Datei `server/data/dialogs.json`.
- API-Basis im Frontend: `VITE_API_BASE_URL` (Default `http://127.0.0.1:3001`).
- Für vollständige Funktion von Spiel + Admin müssen Frontend und Backend gleichzeitig laufen.

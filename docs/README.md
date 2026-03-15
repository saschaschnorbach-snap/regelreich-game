# Regelreich – Media Lab Praktikum

React-basierte Spieloberfläche (4–5 Szenen, Sprechblasen, Interaktionsbox).

## Spiel starten

**Wichtig:** Dev-Server immer aus **diesem Ordner** starten (nicht aus einem Unterordner `frontend` o. Ä.).

```bash
cd /Users/saschaschnorbach/Local\ Sites/defaulted/app/public
npm install   # nur beim ersten Mal
npm run dev
```

Dann im Browser **http://localhost:5173** öffnen. Es erscheint die Regelreich-Oberfläche mit Teil-Buttons (1–5) und der aktuellen Szene.

Falls stattdessen eine andere App (z. B. LYNX HR) oder Proxy-Fehler zu `/api/reports/` angezeigt werden, läuft der Server im falschen Projektordner – zuerst in diesen Ordner wechseln, dann `npm run dev` ausführen.

## Build

```bash
npm run build
```

Ausgabe in `dist/`.

## Lokale Quality Checks

```bash
npm run lint
npm run format:check
```

Für automatische Korrekturen:

```bash
npm run lint:fix
npm run format
```

## Dialog-Backend (lokal)

Das Projekt enthält jetzt ein lokales Backend zum Erstellen, Verwalten und Entfernen von Dialogen inkl. Logikprüfung (`nextStep`, `nextPart`).

### Starten

```bash
npm install
npm run server
```

Backend läuft dann auf `http://localhost:3001`.

Für paralleles Frontend + Backend:

```bash
npm run dev:full
```

Im Frontend oben auf **Admin** wechseln, um die Dialogverwaltung zu öffnen.

### Datenhaltung

- Persistenzdatei: `server/data/dialogs.json`
- Änderungen über API werden direkt in diese Datei geschrieben.

### API-Endpunkte

- `GET /api/health` - Healthcheck
- `GET /api/scenes` - Szenenübersicht (mit Anzahl Dialogschritte)
- `GET /api/scenes/:sceneId/dialogs` - alle Dialogschritte einer Szene
- `GET /api/scenes/:sceneId/dialogs/:stepIndex` - einzelner Dialogschritt
- `POST /api/scenes/:sceneId/dialogs` - Dialogschritt anlegen
- `PUT /api/scenes/:sceneId/dialogs/:stepIndex` - Dialogschritt aktualisieren
- `DELETE /api/scenes/:sceneId/dialogs/:stepIndex` - Dialogschritt löschen

### Request-Format für `POST`/`PUT`

```json
{
  "stepIndex": 4,
  "speechBubbles": [
    {
      "characterId": "clara",
      "speakerName": "Clara",
      "text": "Beispieltext",
      "anchor": "left"
    }
  ],
  "options": [
    { "id": "a", "label": "Weiter", "nextStep": 5 },
    { "id": "b", "label": "Nächste Szene", "nextPart": 2 }
  ]
}
```

Hinweise:

- `stepIndex` kann bei `POST` weggelassen werden (wird dann automatisch vergeben).
- `nextStep` muss auf einen existierenden Schritt derselben Szene zeigen.
- `nextPart` muss auf eine existierende Szene (0-5) zeigen.

# Regelreich – Media Lab Praktikum (Game Anna)

React-based game interface with Vite frontend and Express API. Responsive layout for desktop and mobile.

## Quick start

```bash
npm install
npm run dev:full
```

Then open **http://127.0.0.1:5173** in your browser. The command starts both the API server (port 3001) and the Vite dev server (port 5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:full` | Start API + frontend (recommended) |
| `npm run dev` | Frontend only (Vite) |
| `npm run server` | API only (Express on port 3001) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Tech stack

- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express (ESM)
- **Data:** JSON files under `server/data/`

## Mobile

The UI is responsive: on viewports ≤640px the layout switches to top half (background image) and bottom half (dialog on light blue). Mobile detection sets `data-mobile="true"` on `<html>` for optional custom behaviour.

## License

Private project.

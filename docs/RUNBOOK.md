# Runbook

## Setup
- Requirements: Node 20+, npm.
- Install: `npm install`

## Run
- Full stack: `npm run dev:full`
- Frontend only: `npm run dev`
- Backend only: `npm run server`

## Build
- `npm run build`

## Health Checks
- Backend health: `GET http://127.0.0.1:3001/api/health`
- Scene list: `GET http://127.0.0.1:3001/api/scenes`
- Scene flow: `GET http://127.0.0.1:3001/api/scenes/2/flow`

## Common Failure
- Admin empty lists:
  - Cause: backend unavailable.
  - Fix: start backend (`npm run server` or `npm run dev:full`) and hard reload frontend.

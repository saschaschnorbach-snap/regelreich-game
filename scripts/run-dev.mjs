#!/usr/bin/env node
/**
 * Run API server and Vite dev server together (no concurrently/rxjs dependency).
 * Usage: node scripts/run-dev.mjs
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const api = spawn('node', ['server/index.js'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, FORCE_COLOR: '1' },
})
api.stdout.setEncoding('utf8')
api.stderr.setEncoding('utf8')
api.stdout.on('data', (chunk) => process.stdout.write(`[api] ${chunk}`))
api.stderr.on('data', (chunk) => process.stderr.write(`[api] ${chunk}`))
api.on('error', (err) => {
  console.error('[api] failed to start:', err.message)
  process.exit(1)
})
api.on('exit', (code) => {
  if (code != null && code !== 0) process.exit(code)
})

const web = spawn('npm', ['run', 'dev'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, FORCE_COLOR: '1' },
  shell: true,
})
web.stdout.setEncoding('utf8')
web.stderr.setEncoding('utf8')
web.stdout.on('data', (chunk) => process.stdout.write(`[web] ${chunk}`))
web.stderr.on('data', (chunk) => process.stderr.write(`[web] ${chunk}`))
web.on('error', (err) => {
  console.error('[web] failed to start:', err.message)
  api.kill()
  process.exit(1)
})
web.on('exit', (code) => {
  api.kill()
  if (code != null && code !== 0) process.exit(code)
})

function killAll() {
  api.kill()
  web.kill()
  process.exit(0)
}
process.on('SIGINT', killAll)
process.on('SIGTERM', killAll)

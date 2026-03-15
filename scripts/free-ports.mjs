import { execSync } from 'node:child_process'

const ports = process.argv
  .slice(2)
  .map((value) => Number(value))
  .filter((value) => Number.isInteger(value) && value > 0 && value < 65536)

if (!ports.length) {
  process.exit(0)
}

function getPidsForPort(port) {
  if (process.platform === 'win32') {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' })
    const lines = output.split(/\r?\n/)
    const pids = new Set()

    for (const line of lines) {
      if (!line.includes(`:${port}`)) continue
      const tokens = line.trim().split(/\s+/)
      const pidToken = tokens[tokens.length - 1]
      const pid = Number(pidToken)
      if (Number.isInteger(pid) && pid > 0) {
        pids.add(pid)
      }
    }

    return [...pids]
  }

  const output = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  return output
    .split(/\r?\n/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)
}

function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`, {
        stdio: 'ignore',
      })
    } else {
      process.kill(pid, 'SIGTERM')
    }
    return true
  } catch {
    return false
  }
}

for (const port of ports) {
  try {
    const pids = getPidsForPort(port)
    if (!pids.length) continue

    for (const pid of pids) {
      if (killPid(pid)) {
        console.log(`[free-ports] Killed PID ${pid} on port ${port}`)
      }
    }
  } catch {
    // Ignore probing errors to keep dev startup resilient.
  }
}

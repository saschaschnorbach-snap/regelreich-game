import { app } from './app.js'

const PORT = Number(process.env.PORT ?? 3001)
const HOST = process.env.HOST ?? '127.0.0.1'

app.listen(PORT, HOST, () => {
  console.log(`Dialog backend listening on http://${HOST}:${PORT}`)
})

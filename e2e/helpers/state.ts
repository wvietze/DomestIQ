import fs from 'fs'
import path from 'path'

export interface TestClient {
  email: string
  password: string
  id: string
}

const STATE_FILE = path.resolve(process.cwd(), 'e2e/.state/client.json')

export function writeTestClient(client: TestClient): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
  fs.writeFileSync(STATE_FILE, JSON.stringify(client, null, 2))
}

export function readTestClient(): TestClient {
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
}

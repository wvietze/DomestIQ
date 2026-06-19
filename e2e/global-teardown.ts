import { loadEnvLocal } from './helpers/env'
import { deleteUser, deleteUserByEmail } from './helpers/supabase'
import { readTestClient } from './helpers/state'

export default async function globalTeardown(): Promise<void> {
  loadEnvLocal()
  try {
    const client = readTestClient()
    await deleteUser(client.id)
  } catch {
    // fall through to email-based cleanup
  }
  await deleteUserByEmail('e2e-client@example.com')
}

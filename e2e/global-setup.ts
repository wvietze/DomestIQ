import { loadEnvLocal } from './helpers/env'
import { createConfirmedClient, deleteUserByEmail } from './helpers/supabase'
import { writeTestClient } from './helpers/state'

const TEST_EMAIL = 'e2e-client@example.com'
const TEST_PASSWORD = 'E2eTest123!'

export default async function globalSetup(): Promise<void> {
  loadEnvLocal()
  // Start clean in case a previous run left the account behind.
  await deleteUserByEmail(TEST_EMAIL)
  const id = await createConfirmedClient(TEST_EMAIL, TEST_PASSWORD)
  writeTestClient({ email: TEST_EMAIL, password: TEST_PASSWORD, id })
}

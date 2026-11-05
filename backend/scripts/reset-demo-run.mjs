/**
 * Undoes whatever a demo recording left behind, so the next take starts from
 * the same state as the last one.
 *
 *   node backend/scripts/reset-demo-run.mjs
 *
 * Removes the enquiry the recording creates (and, by cascade, its quotes and
 * messages), plus any saved-contact bookmarks and messages on the seeded
 * enquiries. Seeded users, enquiries, quotes and subscriptions are left alone.
 */
import './_env.mjs'
import pg from 'pg'

const RECORDING_ENQUIRY = 'Switchgear Package for Thane Metro Depot'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
})

try {
  const enquiries = await pool.query('DELETE FROM enquiries WHERE title = $1 RETURNING id', [
    RECORDING_ENQUIRY,
  ])
  const messages = await pool.query('DELETE FROM messages RETURNING id')
  const saved = await pool.query('DELETE FROM saved_contacts RETURNING id')

  // Seeded enquiries must go back to 'open' - a recording that awarded one
  // would otherwise leave it closed for the next take.
  const reopened = await pool.query(
    `UPDATE enquiries SET status = 'open' WHERE status <> 'open' RETURNING title`
  )
  await pool.query(`UPDATE quotations SET status = 'submitted' WHERE status <> 'submitted'`)

  console.log(`enquiries removed : ${enquiries.rowCount}`)
  console.log(`messages cleared  : ${messages.rowCount}`)
  console.log(`bookmarks cleared : ${saved.rowCount}`)
  console.log(`enquiries reopened: ${reopened.rowCount}`)
  console.log('\nDemo data is back to its seeded state.')
} catch (error) {
  console.error('Reset failed:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}

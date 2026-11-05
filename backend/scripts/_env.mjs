/**
 * Loads backend/.env regardless of where the process was started from.
 *
 * `import 'dotenv/config'` resolves .env against process.cwd(), so a script
 * invoked from the repo root (as the npm run demo:* scripts are) would silently
 * miss DATABASE_URL and fall back to localhost:5432. Resolving relative to this
 * file instead makes the scripts work from anywhere.
 *
 * Import this before anything that reads process.env.
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

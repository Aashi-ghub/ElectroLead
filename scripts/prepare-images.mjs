/**
 * Crops, resizes and compresses supplied photography into the slots the UI
 * expects.
 *
 *   node scripts/prepare-images.mjs
 *
 * Source photos go in public/_originals/ at whatever size they came from -
 * a 6 MB 8000px Unsplash download is fine. This writes 800x600 category tiles
 * and 1920x1080 scene images into public/img/, which is what the app loads.
 * Shipping the originals would mean sending megabytes to render a thumbnail.
 *
 * Add a line to SLOTS when a new photo arrives; re-running is harmless.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..')
const SRC = path.join(ROOT, 'public', '_originals')
const OUT = path.join(ROOT, 'public', 'img')

// [source filename, destination, width, height]
const SLOTS = [
  // Category tiles - 4:3, shown small and often.
  ['cables.avif', 'categories/cables.jpg', 800, 600],
  ['mark-kats-uKcocyabF8s-unsplash.jpg', 'categories/switchgear.jpg', 800, 600],
  ['jeswin-thomas-dfRrpfYD8Iw-unsplash.jpg', 'categories/testing.jpg', 800, 600],

  // Wide scenes - 16:9, used as hero and section bands.
  ['emmanuel-ikwuegbu--0-kl1BjvFc-unsplash.jpg', 'scenes/hero.jpg', 1920, 1080],
  ['han-hsing-tu-PeGyRpDKQy4-unsplash.jpg', 'scenes/warehouse.jpg', 1920, 1080],
  ['community-archives-of-belleville-and-hastings-county-Aw33UesQ7ok-unsplash.jpg', 'scenes/site.jpg', 1920, 1080],
]

function findFfmpeg() {
  try {
    const { createRequire } = require('node:module')
    void createRequire
  } catch {
    /* ignore */
  }
  const onPath = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' })
  return onPath.error ? null : 'ffmpeg'
}

const kb = (file) => Math.round(statSync(file).size / 1024)

const ffmpegPath = await (async () => {
  try {
    const installer = await import('@ffmpeg-installer/ffmpeg')
    const binary = installer.default?.path ?? installer.path
    if (binary && existsSync(binary)) return binary
  } catch {
    /* fall through */
  }
  return findFfmpeg()
})()

if (!ffmpegPath) {
  console.error('ffmpeg not found. Run: npm i -D @ffmpeg-installer/ffmpeg --legacy-peer-deps')
  process.exit(1)
}

mkdirSync(path.join(OUT, 'categories'), { recursive: true })
mkdirSync(path.join(OUT, 'scenes'), { recursive: true })

let done = 0
const missing = []

for (const [source, destination, width, height] of SLOTS) {
  const input = path.join(SRC, source)
  if (!existsSync(input)) {
    missing.push(source)
    continue
  }

  const output = path.join(OUT, destination)
  // Scale so the shorter edge covers the target, then centre-crop: never
  // letterbox or squash a product photo.
  const res = spawnSync(
    ffmpegPath,
    [
      '-y', '-i', input,
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`,
      '-q:v', '4',
      output,
    ],
    { stdio: 'ignore' }
  )

  if (res.status !== 0 || !existsSync(output)) {
    console.error(`FAILED ${source} -> ${destination}`)
    continue
  }

  console.log(`${destination.padEnd(32)} ${width}x${height}  ${String(kb(output)).padStart(4)} KB   (from ${source.slice(0, 34)})`)
  done++
}

console.log(`\n${done} image(s) prepared into public/img/`)
if (missing.length) {
  console.log(`\nSource photo not found for:`)
  for (const m of missing) console.log(`  - ${m}`)
}

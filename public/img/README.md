# Imagery

## How it works

1. Drop full-size source photos into `public/_originals/` — any size, any
   filename. A 6 MB 8000px Unsplash download is fine.
2. Add a line to `SLOTS` in `scripts/prepare-images.mjs` mapping that file to
   the slot it fills.
3. Run `npm run images`.

That crops (centre, never squashed), resizes and compresses into `public/img/`,
which is what the app actually loads. `public/_originals/` is gitignored —
16 MB of source photos has no business in the repo, and the browser only ever
needs the 60 KB version.

Anything missing falls back to a generated tile, so partial sets are fine.

## Slots

### `categories/` — 800 × 600, shown small and often

| File | Status | Notes |
|---|---|---|
| `cables.jpg` | ⚠️ **wrong product** | Currently RJ45 network patch leads. This platform sells LT/HT armoured power cable — anyone in the trade will spot it. Needs cable drums or coiled power cable. |
| `switchgear.jpg` | ✅ | MCBs / surge protection on DIN rail |
| `testing.jpg` | ✅ | Electronics bench with meter probes |
| `transformers.jpg` | ❌ missing | Oil-cooled distribution transformer or substation bay |
| `lighting.jpg` | ❌ missing | Industrial LED high-bay, or street/high-mast at dusk |
| `motors.jpg` | ❌ missing | Industrial three-phase motor, close up |
| `solar.jpg` | ❌ missing | Rooftop solar array |
| `conduits.jpg` | ❌ missing | Overhead cable tray runs or conduit installation |

### `scenes/` — 1920 × 1080, hero and section bands

| File | Status | Notes |
|---|---|---|
| `hero.jpg` | ✅ | Electrician working at a panel |
| `warehouse.jpg` | ✅ | Wall of energy meters — strong texture |
| `site.jpg` | ✅ | Electronics assembly. Usable, but reads dated; a modern site or plant shot would be better |

## Supplier logos

Not shipped as assets. Suppliers upload their own logo when they register —
anything else does not survive the next supplier signing up. Suppliers without
a logo render a neutral tile.

## Licensing

These go in front of a client. Unsplash, Pexels and Pixabay are free for
commercial use with no attribution required. Not Google Images.

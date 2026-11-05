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
| `switchgear.jpg` | ✅ | Distribution board with MCBs and wiring |
| `conduits.jpg` | ✅ | Technician working at terminals in an enclosure |
| `testing.jpg` | ✅ | Technician servicing a meter / supply box |
| `cables.jpg` | ❌ **needed** | Cable drums, coiled power cable, or armoured cable ends. The supplied `cables.avif` is RJ45 network patch leads — wrong product for a platform selling LT/HT power cable, so it is not mapped. |
| `transformers.jpg` | ❌ **needed** | Oil-cooled distribution transformer or substation bay |
| `lighting.jpg` | ❌ **needed** | Industrial LED high-bay, or street/high-mast at dusk |
| `motors.jpg` | ❌ **needed** | Industrial three-phase motor, close up |
| `solar.jpg` | ❌ **needed** | Rooftop solar panel array |

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

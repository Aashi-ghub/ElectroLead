/**
 * Category imagery, in one place.
 *
 * Populated by `node scripts/fetch-images.mjs`, which searches Unsplash and
 * writes verified URLs back into this file. Values stay null until that runs;
 * the UI falls back to a generated tile for any category without a photo, so a
 * missing image degrades to something deliberate rather than a broken <img>.
 */
export const CATEGORY_IMAGES = {
  cables: null,
  switchgear: null,
  transformers: null,
  lighting: null,
  motors: null,
  solar: null,
  conduits: null,
  testing: null,
}

/** Wide shots used behind the landing hero and section headers. */
export const SCENE_IMAGES = {
  hero: null,
  warehouse: null,
  site: null,
}

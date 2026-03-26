/**
 * Wish House - Cafe Shift Data (Loader)
 *
 * Loads recipes, ingredients, shifts, and theme data from the canonical
 * JSON files in Assets/Data/CafeData/.
 *
 * Recipes are loaded dynamically from subcategory files via manifest.json.
 * To add new recipes: edit the subcategory file (e.g. desserts/pies-tarts.json).
 * To add a new subcategory: create the file and add it to manifest.json.
 *
 * Exposes the same globals used by cafe.js, recipe-book.js, cafe-room.js:
 *   INGREDIENTS  – keyed by ingredient id
 *   RECIPES      – keyed by recipe id
 *   SHIFTS       – keyed by shift id (number)
 *
 * Also exposes:
 *   cafeDataReady – a Promise that resolves once all data is loaded.
 *   loadThemeRecipes(themePath) – load additional themed recipes at runtime.
 */

const DATA_ROOT = "data/CafeData";

// Globals consumed by the rest of the app
const INGREDIENTS = {};
const RECIPES     = {};
const SHIFTS      = {};

/**
 * Fetch JSON helper with error handling.
 */
async function _fetchJSON(path) {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to load ${path} (${resp.status})`);
  return resp.json();
}

/**
 * Convert an array of recipe objects into the RECIPES dict (keyed by id).
 */
function _indexRecipes(arr) {
  arr.forEach(r => { RECIPES[r.id] = r; });
}

/**
 * Load all subcategory recipe files listed in manifest.json in parallel.
 */
async function _loadRecipesFromManifest() {
  const manifest = await _fetchJSON(`${DATA_ROOT}/recipes/manifest.json`);

  // Collect all subcategory file paths from every category
  const allFiles = [];
  for (const [category, files] of Object.entries(manifest)) {
    if (category.startsWith("_")) continue; // skip _comment
    for (const file of files) {
      allFiles.push(`${DATA_ROOT}/recipes/${file}`);
    }
  }

  // Fetch all subcategory files in parallel
  const results = await Promise.all(
    allFiles.map(path =>
      _fetchJSON(path).catch(err => {
        console.warn(`[cafe-data] Could not load ${path}:`, err);
        return [];
      })
    )
  );

  // Index all recipes
  for (const arr of results) {
    _indexRecipes(arr);
  }
}

/**
 * Load all core cafe data from JSON files.
 */
async function _loadCafeData() {
  // Load ingredients, shifts, and all recipes in parallel
  const [ingredients, shifts] = await Promise.all([
    _fetchJSON(`${DATA_ROOT}/ingredients.json`),
    _fetchJSON(`${DATA_ROOT}/shifts.json`),
    _loadRecipesFromManifest(),
  ]);

  // Populate INGREDIENTS (skip the _doc metadata key)
  Object.entries(ingredients).forEach(([key, val]) => {
    if (key.startsWith("_")) return;
    INGREDIENTS[key] = val;
  });

  // Populate SHIFTS (number-keyed dict)
  shifts.forEach(s => { SHIFTS[s.id] = s; });

  console.log(
    `[cafe-data] Loaded ${Object.keys(INGREDIENTS).length} ingredients, ` +
    `${Object.keys(RECIPES).length} recipes, ` +
    `${Object.keys(SHIFTS).length} shifts`
  );
}

/**
 * Load additional themed recipes at runtime.
 * @param {string} themePath – path to a theme JSON file (relative to DATA_ROOT/themes/)
 * @returns {object} the parsed theme object
 */
async function loadThemeRecipes(themePath) {
  const theme = await _fetchJSON(`${DATA_ROOT}/themes/${themePath}`);
  if (theme.recipes) {
    _indexRecipes(theme.recipes);
    console.log(`[cafe-data] Loaded theme "${theme.name}" with ${theme.recipes.length} recipes`);
  }
  return theme;
}

// Kick off loading immediately; other modules can await this if needed
const cafeDataReady = _loadCafeData();

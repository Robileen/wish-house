/**
 * Wish House - Cafe Shift Data (Loader)
 *
 * Loads recipes, ingredients, shifts, and theme data from the canonical
 * JSON files in Assets/Data/CafeData/.
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

const DATA_ROOT = "../Assets/Data/CafeData";

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
 * Load all core cafe data from JSON files.
 */
async function _loadCafeData() {
  const [ingredients, drinks, food, desserts, specials, shifts] = await Promise.all([
    _fetchJSON(`${DATA_ROOT}/ingredients.json`),
    _fetchJSON(`${DATA_ROOT}/recipes/drinks.json`),
    _fetchJSON(`${DATA_ROOT}/recipes/food.json`),
    _fetchJSON(`${DATA_ROOT}/recipes/desserts.json`),
    _fetchJSON(`${DATA_ROOT}/recipes/specials.json`),
    _fetchJSON(`${DATA_ROOT}/shifts.json`),
  ]);

  // Populate INGREDIENTS (skip the _doc metadata key)
  Object.entries(ingredients).forEach(([key, val]) => {
    if (key.startsWith("_")) return;
    INGREDIENTS[key] = val;
  });

  // Populate RECIPES (id-keyed dict)
  _indexRecipes(drinks);
  _indexRecipes(food);
  _indexRecipes(desserts);
  _indexRecipes(specials);

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

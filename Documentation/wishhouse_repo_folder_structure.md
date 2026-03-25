# Wish House - Repository Folder Structure

## Root Directory

| File | Description |
|------|-------------|
| `README.md` | Project readme — Visual Novel + Cafe Shift Game |

---

## `Assets/`

### `Assets/Art/` — Art Assets & Generation Prompts

| File | Description |
|------|-------------|
| `ART_PROMPTS.md` | AI art generation prompts for characters, backgrounds, and UI elements in 2000s Barbie My Scene style, plus free asset alternatives |

### `Assets/Art/Outfits/` — Character Outfit Definitions

```
Outfits/
├── barista/
│   └── edward/                   (placeholder for Edward's outfit assets)
└── wizard/
    ├── chapter1.json              10 magician outfit variants for Chapter 1
    └── kit/                       (placeholder for Kit's outfit assets)
```

### `Assets/Characters/` — Character Profiles

| File | Description |
|------|-------------|
| `CHARACTERS.md` | Character concepts (wish house owner, barista, rival, customers) with Barbie My Scene design guidelines |
| `EDWARD_BARISTA.md` | Edward the Barista — appearance, personality, expressions, dialogue style |
| `KIT_WIZARD.md` | Kit the Wizard — owner/chef of Wish House, personality, magical abilities, dialogue style |

### `Assets/Data/CafeData/` — Cafe Recipes, Ingredients & Shifts

Canonical data source for the cafe game. The web-demo's `cafe-data.js` loads these JSON files at startup. The recipe book auto-populates from these files.

```
CafeData/
├── ingredients.json               39 ingredients across 11 groups (base, fruit, vegetable,
│                                  dairy, protein, grain, topping, sweetener, spice, temp, special)
├── shifts.json                    3 shifts, 20 customers each, 12 required to pass
├── themes/
│   └── README.md                  Schema for adding themed/seasonal recipe sets
└── recipes/
    ├── drinks.json                18 drink recipes (flat, compound categories like drink-coffee)
    ├── food.json                  15 food recipes (food-bread, food-soups, etc.)
    ├── desserts.json              12 dessert recipes (dessert-cakes, dessert-crepes, etc.)
    ├── specials.json              5 magical special recipes (specials-magical-drinks, etc.)
    ├── drinks/                    Subcategory JSONs
    │   ├── coffee.json            5 coffee recipes
    │   ├── tea.json               3 tea recipes
    │   ├── chocolate.json         2 chocolate recipes
    │   ├── matcha.json            2 matcha recipes
    │   └── fruity.json            6 fruity drink recipes
    ├── food/
    │   ├── bread.json             8 bread/sandwich recipes
    │   ├── soups.json             2 soup recipes
    │   ├── rice.json              2 rice recipes
    │   └── porridge.json          3 porridge/oatmeal recipes
    ├── desserts/
    │   ├── cakes.json             3 cake recipes
    │   ├── pies-tarts.json        2 pie/tart recipes
    │   ├── muffins-cookies.json   2 muffin/cookie recipes
    │   ├── puddings.json          3 pudding/sorbet recipes
    │   └── crepes.json            2 crepe recipes
    └── specials/
        ├── magical-drinks.json    3 magical drink recipes
        └── magical-food.json      2 magical food recipes
```

**Recipe format:**
```json
{
  "id": "honey_latte",
  "name": "Honey Latte",
  "category": "drink-coffee",
  "icon": "🍯",
  "ingredients": ["coffee", "milk", "honey", "hot"],
  "illustration": "A creamy latte drizzled with golden honey swirls."
}
```

**Ingredient format:**
```json
{
  "coffee": { "id": "coffee", "name": "Coffee", "icon": "☕", "group": "base", "color": "#8B4513" },
  "wild":   { "id": "wild", "name": "Wild Card", "icon": "🃏", "group": "special", "isSpecial": true }
}
```

**Shift format:**
```json
{
  "id": 1,
  "name": "First Shift — Trial, Error, and Too Much Sugar",
  "ordersRequired": 12,
  "availableRecipes": ["house_blend", "honey_latte", ...],
  "customerOrders": [
    { "customer": "Office Worker", "recipeId": "house_blend", "dialogue": "Just a simple coffee, please." }
  ]
}
```

### `Assets/Resources/DialogueFiles/` — Episode Dialogue JSONs

8 chapters, 8 episodes each (64 dialogue files).

```
DialogueFiles/
├── Chapter1/
│   ├── chapter1_episodelist_spec.json    Episode list with titles, types, POVs
│   ├── Episode1/episode1_dialogue.json
│   ├── Episode2/episode2_dialogue.json
│   ├── Episode2/episode2_dialoguesample.json   (sample with Kit & Edward dialogue)
│   ├── Episode3/ ... Episode8/
│   └── (each with episodeN_dialogue.json)
├── Chapter2/ through Chapter8/
│   └── (same Episode1-8 structure)
└── Ideation/
    └── idea_episode_names.json   44 episode name ideas with scene notes
```

### `Assets/Scripts/` — Unity C# Scripts

```
Scripts/
├── Core/
│   ├── GameManager.cs                Main game state controller
│   └── SceneTransitionManager.cs     Scene transitions
├── DialogueSystem/
│   ├── DialogueManager.cs            Dialogue display & flow
│   ├── DialogueData.cs               ScriptableObject data structures
│   ├── DialogueLoader.cs             JSON dialogue file loader
│   └── ChoiceHandler.cs              Player choice processing
├── Journal/
│   ├── JournalManager.cs             Chapter/episode navigation
│   ├── JournalData.cs                Chapter & episode data
│   └── JournalUI.cs                  Journal book UI rendering
└── UI/
    └── DialogueUI.cs                 Dialogue box UI components
```

---

## `Documentation/` — Project Docs & Design Specs

| File | Description |
|------|-------------|
| `PROJECT_CONTEXT.md` | High-level project overview — hybrid visual novel + cafe serving game |
| `UNITY_STRUCTURE.md` | Project structure, web demo architecture, data flow, Unity scripts |
| `wishhouse_repo_folder_structure.md` | This file — index of all files and folders |

### `Documentation/Game Design/` — Gameplay & UI Design Docs

| File | Description |
|------|-------------|
| `RECIPE_BOOK.md` | Recipe book modal spec — book layout, index tabs, recipe cards with ingredient names, pagination, data source |
| `WISH_HOUSE_GAMEPLAY_UI.md` | Full gameplay UI spec — game flow, HUD, table zone (6 tables, states, speech bubbles, sponge cleanup), craft view (order banner, ingredient deck with 7 tabs, card slots, revert button, FUSE), recipe book reference |
| `GAMEPLAY_SPECS.md` | Core gameplay specs — shift mechanics, card matching, special cards, mistake system |
| `GAMEPLAY_FLOWCHART.md` | Shift flow diagram — customer orders → gameplay → story progression |

### `Documentation/Game Design/EpisodeDesign/`

| File | Description |
|------|-------------|
| `episode_ui_spec.md` | VN episode UI layout and player design spec |

### `Documentation/Game Design/JournalBook/`

| File | Description |
|------|-------------|
| `journal_ui_spec.md` | Journal/hub UI spec — episode list, chapter navigation, shift access |

### `Documentation/Table Zone/` — Cafe Room Specs

| File | Description |
|------|-------------|
| `table_formation.md` | Cafe room table layout — 6-table 2×3 grid, table states (ordering → crafting → served → eating → messy), speech bubbles, sponge cleanup, delivery animation sequence, barista zone, CSS classes reference |
| `cafe_designs/sample.md` | Cafe art scene mood boards — 6 themed cafe designs (morning, rainy, flea market, fruit, study, evening) |

---

## `web-demo/` — Playable Browser Prototype

The fully playable web demo served from the project root. Run `python3 -m http.server` and open `http://localhost:8000/web-demo/index.html`.

| File | Description |
|------|-------------|
| `index.html` | Main HTML — journal screen, VN player, cafe screen (shift intro, HUD, quit modal, recipe book modal, table zone with 6 tables + barista zone, craft view with order banner + card slots + revert button + ingredient deck + FUSE button, serve result, shift complete) |

### `web-demo/css/`

| File | Description |
|------|-------------|
| `style.css` | Global styles — CSS variables (palette: cream, peach, blush, milk-tea, cocoa, dusty rose, gold, pale mint), fonts (Playfair Display, Quicksand), reset, custom scrollbar (thin 6px blush-to-milk-tea gradient) |
| `journal.css` | Journal book UI — left/right pages, book spine, episode tape cards, chapter navigation, scrapbook decorations |
| `cafe.css` | All cafe game styles — shift intro overlay, HUD bar, quit confirmation modal, recipe book modal (leather cover, spine, two-page spread, index tabs, faded page arrows), table zone (6 tables, seats, food slots, overlays, speech bubbles, sponge cleanup, barista zone), craft view container (order banner, ? button, back-to-tables button, card slots row with revert button, ingredient deck with 7 category tabs, ingredient cards with drag-and-drop, FUSE button), serve result overlay, shift complete overlay, fuse animation overlay, responsive breakpoint at 640px |

### `web-demo/js/`

| File | Description |
|------|-------------|
| `cafe-data.js` | Async data loader — fetches `ingredients.json`, 4 recipe JSONs, and `shifts.json` from `Assets/Data/CafeData/` into `INGREDIENTS`, `RECIPES`, `SHIFTS` globals. Also exposes `cafeDataReady` promise and `loadThemeRecipes()` for themed recipe packs |
| `cafe.js` | `CafeEngine` class — shift lifecycle (openShift → beginShift → table zone ↔ craft view → completeShift), table zone (6-table rendering, customer seating, speech bubbles, delivery animation, sponge cleanup), craft view (auto-recipe selection, ingredient slots with drag-and-drop, revert all, ingredient deck with 7 tabs sorted alphabetically, multi-click on food cards), recipe book modal (all recipes from RECIPES global, two-page spread, index tabs, pagination), FUSE (order-independent ingredient matching, brew/conjure animation), quit shift with confirmation |
| `journal.js` | Journal book navigation — chapter/episode rendering, progress tracking, VN/cafe launch routing, episode completion |
| `game.js` | VN player engine — dialogue display, typewriter effect, character sprites, player choices, scene transitions, episode complete screen |

---

*Last updated: 2026-03-21*

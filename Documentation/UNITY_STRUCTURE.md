# Project Structure

## Overview

Wish House is a visual novel + cafe shift mini-game. The project has two parallel implementations:
- **Unity (C#)** — Scripts for the dialogue system, journal, and core game management (in progress)
- **Web Demo (HTML/CSS/JS)** — Fully playable browser prototype with VN player, journal, table zone, and craft view

## Folder Organization

```
wish-house/
├── Assets/
│   ├── Art/
│   │   ├── ART_PROMPTS.md                    ← Art direction & prompt references
│   │   └── Outfits/wizard/chapter1.json      ← Character outfit data
│   │
│   ├── Characters/
│   │   ├── CHARACTERS.md                     ← Character profiles & relationships
│   │   ├── EDWARD_BARISTA.md                 ← Edward character spec
│   │   └── KIT_WIZARD.md                     ← Kit character spec
│   │
│   ├── Data/
│   │   ├── CafeData/
│   │   │   ├── ingredients.json              ← 39 ingredients (31 regular + 8 special)
│   │   │   ├── shifts.json                   ← 3 shifts, 20 customers each
│   │   │   ├── themes/README.md              ← Theme recipe extension point
│   │   │   └── recipes/
│   │   │       ├── drinks.json               ← 18 drink recipes (flat)
│   │   │       ├── food.json                 ← 15 food recipes (flat)
│   │   │       ├── desserts.json             ← 12 dessert recipes (flat)
│   │   │       ├── specials.json             ← 5 special recipes (flat)
│   │   │       ├── drinks/                   ← Subcategory: coffee, tea, chocolate, matcha, fruity
│   │   │       ├── food/                     ← Subcategory: bread, soups, rice, porridge
│   │   │       ├── desserts/                 ← Subcategory: cakes, pies-tarts, muffins-cookies, puddings, crepes
│   │   │       └── specials/                 ← Subcategory: magical-drinks, magical-food
│   │   │
│   │   └── DialogueFiles/
│   │       ├── Chapter1/ through Chapter8/   ← 8 chapters, 8 episodes each
│   │       │   ├── Episode1/episode1_dialogue.json
│   │       │   └── ...
│   │       └── Ideation/idea_episode_names.json
│   │
│   └── Scripts/                              ← Unity C# scripts
│       ├── Core/
│       │   ├── GameManager.cs                ← Main game state controller
│       │   └── SceneTransitionManager.cs     ← Scene transitions
│       ├── DialogueSystem/
│       │   ├── DialogueManager.cs            ← Dialogue display & flow
│       │   ├── DialogueData.cs               ← ScriptableObject data structures
│       │   ├── DialogueLoader.cs             ← JSON dialogue file loader
│       │   └── ChoiceHandler.cs              ← Player choice processing
│       ├── Journal/
│       │   ├── JournalManager.cs             ← Journal/chapter navigation
│       │   ├── JournalData.cs                ← Chapter & episode data
│       │   └── JournalUI.cs                  ← Journal book UI rendering
│       └── UI/
│           └── DialogueUI.cs                 ← Dialogue box UI components
│
├── Documentation/
│   ├── UNITY_STRUCTURE.md                    ← This file
│   ├── PROJECT_CONTEXT.md                    ← Project overview & goals
│   ├── wishhouse_repo_folder_structure.md    ← Folder tree reference
│   ├── Game Design/
│   │   ├── RECIPE_BOOK.md                    ← Recipe book modal spec
│   │   ├── WISH_HOUSE_GAMEPLAY_UI.md         ← Full gameplay UI spec
│   │   ├── GAMEPLAY_SPECS.md                 ← Core gameplay mechanics
│   │   ├── GAMEPLAY_FLOWCHART.md             ← Game flow diagram
│   │   ├── EpisodeDesign/episode_ui_spec.md  ← VN episode UI spec
│   │   └── JournalBook/journal_ui_spec.md    ← Journal book UI spec
│   └── Table Zone/
│       ├── table_formation.md                ← Cafe room table layout & states
│       └── cafe_designs/sample.md            ← Cafe art scene mood boards
│
├── web-demo/                                 ← Playable browser prototype
│   ├── index.html                            ← Main HTML (journal + VN + cafe screens)
│   ├── css/
│   │   ├── style.css                         ← Global styles, palette, custom scrollbar
│   │   ├── journal.css                       ← Journal book UI styles
│   │   └── cafe.css                          ← Cafe game styles (table zone, craft view, recipe book)
│   └── js/
│       ├── cafe-data.js                      ← Async JSON loader → INGREDIENTS, RECIPES, SHIFTS globals
│       ├── cafe.js                           ← CafeEngine class (table zone + craft view + recipe book)
│       ├── journal.js                        ← Journal navigation & chapter/episode management
│       └── game.js                           ← VN player (dialogue, choices, scenes)
│
└── README.md
```

## Web Demo Architecture

### Data Flow

```
Assets/Data/CafeData/*.json
        │
        ▼
  cafe-data.js (async fetch at startup)
        │
        ▼
  Globals: INGREDIENTS, RECIPES, SHIFTS
        │
        ▼
  cafe.js (CafeEngine class)
    ├── Table Zone (6 tables, customer seating, speech bubbles)
    ├── Craft View (order banner, ingredient slots, deck, FUSE)
    └── Recipe Book Modal (all recipes, paginated two-page spread)
```

### Key Classes & Files

| File | Purpose |
|------|---------|
| `cafe-data.js` | Loads all JSON data into `INGREDIENTS`, `RECIPES`, `SHIFTS` globals. Exposes `cafeDataReady` promise and `loadThemeRecipes()` |
| `cafe.js` | `CafeEngine` class — manages shift lifecycle, table zone, craft view, recipe book, FUSE logic |
| `journal.js` | Journal book navigation, chapter/episode rendering, VN/cafe launch |
| `game.js` | VN player — dialogue display, character sprites, choices, scene transitions |
| `style.css` | CSS variables (palette), fonts, reset, custom scrollbar |
| `journal.css` | Journal book layout, episode tape cards, page decorations |
| `cafe.css` | All cafe game styles — HUD, table zone, craft view, recipe book modal, overlays |

### Cafe Game Flow

```
openShift() → Shift Intro → beginShift() → Table Zone
                                              │
                          ┌───────────────────┘
                          ▼
                    seatNextCustomers() (up to 3)
                          │
                          ▼
                    onTableClick() → Craft View
                          │
                          ▼
                    fuse() → playFuseAnimation()
                          │
                          ▼
                    showServeResult() → afterServeResult()
                          │
                          ▼
                    deliverFood() → (served → eating → messy)
                          │
                          ▼
                    cleanTable() → seatNextCustomers()
                          │
                          ▼
                    (repeat until ordersRequired met)
                          │
                          ▼
                    completeShift() → exitShift()
```

### Recipe Matching

Ingredient order does **not** matter. `checkRecipeCorrect()` verifies all required ingredients are present across the slots in any position. Wild cards substitute for any single ingredient.

## Unity Scripts Architecture

### Dialogue System
- **DialogueManager** — Handle dialogue display and flow
- **DialogueData** — ScriptableObjects for dialogue content
- **DialogueLoader** — Load dialogue JSON files from `Assets/Data/DialogueFiles/`
- **ChoiceHandler** — Process player choices and branching

### Journal System
- **JournalManager** — Chapter/episode navigation and progress tracking
- **JournalData** — Chapter and episode data structures
- **JournalUI** — Journal book rendering and interaction

### Core
- **GameManager** — Main game state controller
- **SceneTransitionManager** — Handle transitions between journal, VN, and cafe scenes

### UI
- **DialogueUI** — Dialogue box, speaker name, choice panels

## Data Format

### Ingredients (`ingredients.json`)
```json
{
  "coffee": { "id": "coffee", "name": "Coffee", "icon": "☕", "group": "base", "color": "#8B4513" },
  "wild":   { "id": "wild", "name": "Wild Card", "icon": "🃏", "group": "special", "isSpecial": true }
}
```

Groups: `base`, `fruit`, `vegetable`, `dairy`, `protein`, `grain`, `topping`, `sweetener`, `spice`, `temp`, `special`

### Recipes (`recipes/*.json`)
```json
[
  { "id": "house_blend", "name": "House Blend", "icon": "☕", "category": "drink-coffee", "ingredients": ["coffee", "hot"] }
]
```

Categories use compound values: `drink-coffee`, `food-bread`, `dessert-cakes`, `specials-magical-drinks`

### Shifts (`shifts.json`)
```json
[
  {
    "id": 1,
    "name": "First Shift",
    "ordersRequired": 12,
    "availableRecipes": ["house_blend", ...],
    "customerOrders": [
      { "customer": "Office Worker", "recipeId": "house_blend", "dialogue": "Just a simple coffee." }
    ]
  }
]
```

## Development Notes

- **Canvas Scaling**: Responsive CSS with mobile breakpoint at 640px
- **Input**: Mouse + drag-and-drop (touch via click fallback)
- **Performance**: Vanilla JS, no framework, async data loading
- **Hosting**: Static files served from project root (e.g. `python3 -m http.server`)
- **WebGL**: Future Unity WebGL build would replace the web-demo

---
*Structure designed for scalability — add new recipes, ingredients, shifts, or chapters by editing JSON files*

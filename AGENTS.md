# Wish House - Development Notes

## Critical: Runtime is the Web App

The game runs from `web-demo/index.html` (vanilla HTML/CSS/JS).
The C# scripts in `Assets/Scripts/` are reference designs, NOT runtime code.

**When fixing game bugs, edit `web-demo/js/` files.**

## Key Files

- `web-demo/js/game.js` -- VN engine (WishHouseEngine class)
- `web-demo/js/journal.js` -- Main menu / episode selector (JournalBook class)
- `web-demo/js/cafe.js` -- Cafe shift game (CafeEngine class)
- `web-demo/js/cafe-data.js` -- Data loader (loads recipes from manifest.json)
- `web-demo/data/` -- Episode dialogue JSON (fetched at runtime)
- `web-demo/data/expressions.json` -- Expression catalog (loaded at runtime)
- `web-demo/data/CafeData/recipes/manifest.json` -- Recipe file registry
- `Assets/Data/CafeData/` -- Cafe ingredients, recipes, shifts JSON (source of truth)
- `Assets/Data/expressions.json` -- Expression catalog (Unity sync copy)

## Full project context: `Documentation/PROJECT_CONTEXT.md`

## Dialogue JSON Convention

- Split files: `episode{N}_main_dialogue.json` + `episode{N}_{branch}_dialogue.json`
- Block keys: main = `"2"`, branches = `"2.1"`, `"2.2"`, `"2.3"`
- Keep `web-demo/data/` and `Assets/Resources/DialogueFiles/` in sync

## Expression System

Expression data is **data-driven** -- loaded from `web-demo/data/expressions.json` at runtime, not hardcoded.

### expressions.json (the master catalog)
- Location: `web-demo/data/expressions.json` (+ sync copy at `Assets/Data/expressions.json`)
- To add a new character or expression: edit this file. No code changes needed.
- Structure: `characters.{charId}.expressions.{label}` -> `{ emoji, image }`

### Dialogue lines
Each character dialogue line can include up to three expression fields:
- `expression` -- label like `"warm"`, `"determined"`, `"shy"` (required)
- `expressionEmoji` -- override emoji (optional, falls back to expressions.json)
- `expressionImage` -- override sprite path (optional, falls back to expressions.json)

Minimal usage -- only `expression` is needed, emoji/image resolved from catalog:
```json
{ "id": 5, "speaker": "Claire", "text": "Hello!", "expression": "shy" }
```

Narrator and Stage lines do NOT get expression fields.

### Rendering priority
sprite image (if file exists) > emoji > default character icon.

### Adding new expressions
1. Add the expression entry in `web-demo/data/expressions.json`
2. Copy to `Assets/Data/expressions.json`
3. Use the label in dialogue JSON `"expression"` fields
4. Optionally drop the sprite PNG into `web-demo/sprites/{characterid}/`

## Adding New Episodes

1. Create JSON in `Assets/Resources/DialogueFiles/Chapter{N}/Episode{N}/`
2. Copy to `web-demo/data/Chapter{N}/Episode{N}/`
3. Update `CHAPTERS` in `journal.js`

## Git Workflow

- Always push commits to `origin/main` after making changes.
- Always update `gh-pages` branch too: `git subtree split --prefix web-demo -b gh-pages-temp && git push origin gh-pages-temp:gh-pages --force && git branch -D gh-pages-temp`

## Adding New Recipes

Recipes are **data-driven** via `manifest.json`. No flat combined files to maintain.

### To add recipes to an existing subcategory:
1. Edit the subcategory file (e.g., `Assets/Data/CafeData/recipes/desserts/pies-tarts.json`)
2. Copy the file to `web-demo/data/CafeData/recipes/desserts/pies-tarts.json`
3. That's it -- `cafe-data.js` loads it automatically via manifest

### To add a new subcategory:
1. Create the JSON file in `Assets/Data/CafeData/recipes/{category}/{name}.json`
2. Copy to `web-demo/data/CafeData/recipes/{category}/{name}.json`
3. Add the path to `recipes/manifest.json` under the appropriate category
4. Copy the updated manifest to `web-demo/data/CafeData/recipes/manifest.json`

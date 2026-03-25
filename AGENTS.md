# Wish House - Development Notes

## Critical: Runtime is the Web App

The game runs from `web-demo/index.html` (vanilla HTML/CSS/JS).
The C# scripts in `Assets/Scripts/` are reference designs, NOT runtime code.

**When fixing game bugs, edit `web-demo/js/` files.**

## Key Files

- `web-demo/js/game.js` -- VN engine (WishHouseEngine class)
- `web-demo/js/journal.js` -- Main menu / episode selector (JournalBook class)
- `web-demo/js/cafe.js` -- Cafe shift game (CafeEngine class)
- `web-demo/js/cafe-data.js` -- JSON data loader for cafe game
- `web-demo/data/` -- Episode dialogue JSON (fetched at runtime)
- `Assets/Data/CafeData/` -- Cafe ingredients, recipes, shifts JSON

## Full project context: `Documentation/PROJECT_CONTEXT.md`

## Dialogue JSON Convention

- Split files: `episode{N}_main_dialogue.json` + `episode{N}_{branch}_dialogue.json`
- Block keys: main = `"2"`, branches = `"2.1"`, `"2.2"`, `"2.3"`
- Keep `web-demo/data/` and `Assets/Resources/DialogueFiles/` in sync

## Adding New Episodes

1. Create JSON in `Assets/Resources/DialogueFiles/Chapter{N}/Episode{N}/`
2. Copy to `web-demo/data/Chapter{N}/Episode{N}/`
3. Update `CHAPTERS` in `journal.js`

# Wish House - Project Context

## Game Concept

A hybrid visual novel and cafe serving game. Players experience a heartwarming story through branching dialogue, then serve customers in a cafe shift minigame.

## Synopsis

In a quiet corner of the city stands the Wish House, a small cafe whispered about in rumors -- said to grant the wishes of anyone who walks through its doors. Most dismiss it as a silly urban legend. But those who visit discover that the rumors are true... just not in the way they expect.

Inside the cafe works a peculiar wizard, whose magic subtly weaves itself into every cup he brews. When a financially struggling student stumbles upon a "Help Wanted" poster, he unknowingly applies for a job that will turn his ordinary life upside down. As the cafe's newest barista, he learns that the drinks they serve don't just taste good -- they uncover worries, heal hearts, reflect desires, and sometimes even change fates.

Together, the wizard and the barista build the first menu of the Wish House, learning how to balance creativity, magic, and practicality. Through chaotic experiments and encounters with all walks of life carrying emotional burdens, the cafe gradually reveals its purpose: to listen to the wishes people cannot say out loud, to comfort those who are hurting, and to nudge each visitor a little closer to the happiness they long for.

## Project Location
```
/home/edge/CascadeProjects/wish-house/
```

---

## Architecture

### Runtime: Web App (primary)

The game runs as a **vanilla HTML/CSS/JS web application** from `web-demo/index.html`. This is the actual playable build.

- **Entry point**: `web-demo/index.html`
- **JavaScript**: `web-demo/js/` (game.js, journal.js, cafe.js, cafe-data.js)
- **CSS**: `web-demo/css/` (style.css, journal.css, cafe.css)
- **Dialogue data**: `web-demo/data/` (JSON files fetched at runtime)
- **Cafe data**: `Assets/Data/CafeData/` (ingredients, recipes, shifts)

### Reference: Unity/C# (future-proofing)

The `Assets/Scripts/` folder has C# scripts that mirror the web app architecture. These are **NOT runtime code** -- they exist as reference designs for a potential future Unity WebGL/console port.

**Important**: When fixing game behavior, edit the files in `web-demo/js/`, not the C# scripts.

---

## Web Demo Structure

### Screens (single-page app)

| Screen | DOM ID | Purpose |
|--------|--------|---------|
| Journal | `#journal-screen` | Main menu hub, scrapbook-style chapter/episode selector |
| VN Player | `#vn-player` | Visual novel dialogue player |
| Cafe Game | `#cafe-screen` | Cafe shift gameplay (table zone + craft view) |

### JavaScript Modules

| File | Class | Purpose |
|------|-------|---------|
| `game.js` | `WishHouseEngine` | VN engine: loads episode JSON, typewriter text, choices, transitions |
| `journal.js` | `JournalBook` | Journal UI, episode unlock/progress, screen transitions |
| `cafe.js` | `CafeEngine` | Cafe shift game: tables, orders, recipe crafting, tips |
| `cafe-data.js` | (loader) | Async loader for ingredients, recipes, shifts JSON |

### Global References
- `window.game` -- WishHouseEngine instance
- `window.journal` -- JournalBook instance
- `window.cafe` -- CafeEngine instance

---

## Game Flow

```
Journal Screen
    |
    v
Click Episode Tape
    |
    +--[VN Episode (shiftId == null)]
    |      |
    |      v
    |   Title Card --> "Begin" --> Dialogue Loop --> Choices --> Episode Complete
    |      |                                                         |
    |      +---------------------------------------------------------+
    |      |
    |      v
    |   "Back to Journal" (marks episode completed, unlocks next)
    |
    +--[Cafe Shift Episode (shiftId != null)]
           |
           v
        Shift Intro --> Table Zone <--> Craft View --> Shift Complete
           |                                               |
           +-----------------------------------------------+
           |
           v
        Return to Journal (saves tips as buttons, marks completed)
```

---

## Dialogue System

### File Layout

Dialogue JSON lives in two places (keep in sync):
- `web-demo/data/` -- fetched by the web app at runtime
- `Assets/Resources/DialogueFiles/` -- Unity reference copy

### Split File Convention

Each episode uses a **main file + branch files**:

```
Chapter1/Episode2/
  episode2_main_dialogue.json   <-- main route (block "2")
  episode2_1_dialogue.json      <-- branch 2.1
  episode2_2_dialogue.json      <-- branch 2.2
  episode2_3_dialogue.json      <-- branch 2.3
```

**Fallback**: If no `_main_dialogue` file exists, the loader tries `episode{N}_dialogue.json` (monolithic).

### Block Key System

- Main block key = episode number as string: `"1"`, `"2"`, `"3"`
- Branch block key = `"episode.branch"`: `"2.1"`, `"2.2"`, `"2.3"`
- `game.js` merges all branch files into the main data on load

### Dialogue Block Structure

```json
{
  "chapter": 1,
  "episodes": {
    "2": {
      "episode": 2,
      "dialogueLines": [
        { "id": 1, "speaker": "Narrator", "text": "..." },
        { "id": 2, "speaker": "Edward (Barista)", "text": "...", "expression": "neutral" }
      ],
      "choices": [
        {
          "id": "EP2-CHOICE-1",
          "prompt": "What pushes Edward?",
          "options": [
            { "text": "Option A", "next": { "chapter": 1, "episode": 2.1 } },
            { "text": "Option B", "next": { "chapter": 1, "episode": 2.2 } }
          ]
        }
      ],
      "cafeOrders": [],
      "sceneTransition": {
        "next": { "chapter": 1, "episode": 3 },
        "effect": "fade",
        "music": "evening_walk",
        "delayMs": 1200
      }
    }
  }
}
```

### Speaker Types

| Speaker | Side | Color | Description |
|---------|------|-------|-------------|
| Kit (Wizard) | left | #D4A843 (gold) | Wizard, cafe owner |
| Edward (Barista) | right | #8B4513 (cocoa) | Barista, student |
| Claire | right | #C48B9F (dusty rose) | Maid, first customer |
| Narrator | -- | #7A6455 | Story narration |
| Stage | -- | #999999 | Action/scene directions in [brackets] |

---

## Episode Structure

### Chapter 1 Episodes

| Ep | Title | Type | POV | ShiftId |
|----|-------|------|-----|---------|
| 1 | That'll Be 1 Button. | VN | wizard | -- |
| 2 | Help Wanted, No Experience Required? | VN | barista | -- |
| 3 | Operation MDI | VN | wizard + barista | -- |
| 4 | Trial, Error, and Too Much Sugar | VN + Game | wizard + barista | 1 |
| 5 | 3:07PM | VN + Game | gameplay | 2 |
| 6 | A Scared and Hungry Boy | VN + Game | gameplay | 3 |

### Episode Types
- **VN Only** (shiftId: null): Pure dialogue + choices
- **VN + Game** (shiftId: number): Dialogue followed by cafe shift gameplay

### Unlock Logic
- Episode 1 is always unlocked
- Each subsequent episode unlocks when the previous one is completed
- Progress saved in `localStorage` key `wishhouse_journal`

---

## Cafe Game Mechanics

### Shift Overview
- 20 customer orders per shift, 12 required to pass
- 6 tables in 2x3 grid, 1-2 customers per table
- 5 mistakes = force end shift

### Table States
```
Empty --> Ordering --> Crafting --> Served (0.8s) --> Eating (5s) --> Messy --> Clean --> Empty
```

### Recipe Crafting
1. Player fills ingredient card slots from a deck
2. Order of ingredients doesn't matter
3. Wild card can substitute for any ingredient
4. "FUSE" button checks recipe and shows result

### Currency: Buttons
- +1 per correct dish served
- +1 per best response in customer chat (60% chance to trigger)
- Tips only saved on shift completion (lost if quit)

---

## Adding New Content

### New Episode
1. Create JSON files in `Assets/Resources/DialogueFiles/Chapter{N}/Episode{N}/`
2. Copy them to `web-demo/data/Chapter{N}/Episode{N}/`
3. Update `chapter{N}_episodelist_spec.json`
4. Update `CHAPTERS` object in `journal.js`

### New Recipes
1. Add to the subcategory file in `Assets/Data/CafeData/recipes/{category}/` (e.g., `desserts/pies-tarts.json`)
2. Copy the file to `web-demo/data/CafeData/recipes/{category}/`
3. Reference existing ingredients from `ingredients.json`
4. Automatically available in recipe book and craft deck
5. For a new subcategory file: also add its path to `recipes/manifest.json`

### New Shifts
1. Add shift entry in `Assets/Data/CafeData/shifts.json`
2. Define `customerOrders` array with 20 orders
3. Link to episode via `shiftId` in episode spec

---

## Technical Notes

- **No frameworks**: Vanilla JS, CSS Grid/Flexbox, Fetch API
- **Persistence**: localStorage (`wishhouse_journal`)
- **Fonts**: Quicksand (sans-serif), Playfair Display (serif)
- **Game container**: 900px x 600px, responsive (max 95vw x 90vh)
- **ES6+**: async/await, arrow functions, template literals, classes

## Art Style
- 2D watercolour, soft pencil tones
- Cozy pastel-colored cafe interiors
- Character sprites inspired by 2000s Mattel Barbie My Scene
- Scrapbook/journal aesthetic for menus

---
*Last Updated: 2026-03-26*

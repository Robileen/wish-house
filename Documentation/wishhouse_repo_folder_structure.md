# Wish House - Repository Folder Structure

## Root Directory

| File | Description |
|------|-------------|
| `README.md` | Project readme -- Visual Novel for Wish House |

---

## `Assets/`

### `Assets/Art/` -- Art Assets & Generation Prompts

| File | Description |
|------|-------------|
| `ART_PROMPTS.md` | AI art generation prompts for characters, backgrounds, and UI elements in 2000s Barbie My Scene style, plus free asset alternatives |

### `Assets/Art/Outfits/` -- Character Outfit Definitions

```
Outfits/
├── barista/
│   └── edward/               -- (empty, placeholder for Edward's outfit assets)
└── wizard/
    ├── chapter1.json          -- 10 magician outfit variants for Chapter 1 (Peranakan & Western-inspired, Barbie/My Scene watercolor 2D style)
    └── kit/                   -- (empty, placeholder for Kit's outfit assets)
```

### `Assets/Characters/` -- Character Profiles

| File | Description |
|------|-------------|
| `CHARACTERS.md` | Character concepts (wish house owner, barista, rival, customers) with Barbie My Scene design guidelines, archetypes, and relationship dynamics |
| `EDWARD_BARISTA.md` | Character profile for Edward the Barista -- appearance, personality (objective, serious, grounded), expressions, dialogue style, and dynamic with Kit |
| `KIT_WIZARD.md` | Character profile for Kit the Wizard -- owner/chef of Wish House, personality (whimsical, talkative, dramatic), magical abilities, expressions, and dialogue style |

### `Assets/Data/` -- Game Data Files

### `Assets/Data/DialogueFiles/` -- Episode Dialogue JSONs

Organized by chapter and episode. 8 chapters, 8 episodes each (64 dialogue files total).

```
DialogueFiles/
├── Chapter1/
│   ├── chapter1_episodelist_spec.json    -- Episode list with titles, types, POVs, and scene descriptions for Chapter 1 (6 episodes defined)
│   ├── Episode1/episode1_dialogue.json
│   ├── Episode2/episode2_dialogue.json           -- blank template
│   ├── Episode2/episode2_dialoguesample.json     -- sample with Kit & Edward carrot cake dialogue
│   ├── Episode3/episode3_dialogue.json
│   ├── ...
│   └── Episode8/episode8_dialogue.json
├── Chapter2/ ... Chapter8/
│   └── (same Episode1-8 structure, each with episodeN_dialogue.json)
└── Ideation/
    └── idea_episode_names.json   -- 44 episode name ideas formatted as JSON with scene notes from brainstorming
```

Each dialogue JSON follows this structure:
```json
{
  "chapter": 1,
  "episode": 1,
  "dialogueLines": [],
  "choices": [],
  "cafeOrders": [],
  "sceneTransition": null
}
```

---

## `Documentation/` -- Project Docs & Design Specs

| File | Description |
|------|-------------|
| `PROJECT_CONTEXT.md` | High-level project overview -- hybrid visual novel + wish house serving game (Diner Dash-style) built in Unity/C# with WebGL deployment, targeting a 2000s Barbie My Scene aesthetic |
| `UNITY_STRUCTURE.md` | Unity project folder organization spec, key scripts architecture, setup considerations, and development phases |
| `wishhouse_repo_folder_structure.md` | This file -- index of all files and folders in the repository |

### `Documentation/Game Design/` -- Gameplay Design Docs

| File | Description |
|------|-------------|
| `GAMEPLAY_SPECS.md` | Full gameplay specs -- shift overview, mini card game mechanics (recipe book, ingredient deck, card slots, fuse button), special cards, mistake system, gameplay flow, shift strategy, and visual/UI notes |
| `GAMEPLAY_FLOWCHART.md` | Shift flow diagram -- text-based flowchart showing the full progression from customer orders to gameplay mechanics to story progression to shift end, with notes on player choice, mistake system, special cards, and visual feedback |
| `WISH_HOUSE_GAMEPLAY_UI.md` | UI wireframe layout -- text-based wireframe for the mini card game during a shift (recipe book, ingredient slots, ingredient deck, fuse button) with annotated notes |

---

*Last updated: 2026-03-20*

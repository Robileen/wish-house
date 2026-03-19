# Wish House - Repository Folder Structure

## Root Directory (`cafe-visual-novel/`)

| File | Description |
|------|-------------|
| `PROJECT_CONTEXT.md` | High-level project overview -- hybrid visual novel + cafe serving game (Diner Dash-style) built in Unity/C# with WebGL deployment, targeting a 2000s Barbie My Scene aesthetic |
| `CHARACTERS.md` | Placeholder character concepts (cafe owner, barista, rival, customers) with Barbie My Scene design guidelines, archetypes, and relationship dynamics |
| `DIALOGUE_SYSTEM.md` | C# dialogue system architecture -- DialogueData, DialogueManager, CharacterManager, ChoiceHandler code specs and integration points |
| `CAFE_MECHANICS.md` | Cafe serving gameplay loop (order-taking, preparation mini-games, service, payment) with C# code snippets for OrderManager, ServingMiniGame, CustomerAI |
| `ART_PROMPTS.md` | AI art generation prompts for characters, backgrounds, and UI elements in 2000s Barbie My Scene style, plus free asset alternatives |
| `UNITY_STRUCTURE.md` | Unity project folder organization spec, key scripts architecture, setup considerations, and development phases |

---

## `Assets/`

### `Assets/Art/` -- Art Assets & Generation Prompts
| File | Description |
|------|-------------|
| `AI_CHARACTER_PROMPTS.md` | Ready-to-use AI image generation prompts for each character (Alex, Sarah, Jessica, Mike, Emma) in multiple expressions, with generation tips and file naming conventions |
| `AI_FOOD_PROMPTS.md` | AI art generation prompts for magical food items (enchanted cheesecake, lemongrass tea) in multiple variations and styles (pixel art, sticker, flat design) |
| `ASCII_FOOD_ART.md` | ASCII/emoji art representations of magical cheesecake, lemongrass tea, teapot, and combined scenes, including color-coded versions and animation frames |
| `VISUAL_ASSETS_COMPLETE.md` | Summary/index cataloging all created visual assets (ASCII art, AI prompts, CSS graphics, web demo), Barbie My Scene color palette, and animation timeline |

### `Assets/Characters/` -- Character Profiles
| File | Description |
|------|-------------|
| `LUNA_MAGICAL_BARISTA.md` | Character profile for Luna Starwhisper, the magical barista (125-year-old part-star-sprite) -- appearance, personality, magical abilities, AI art prompts, and story role |

### `Assets/Data/` -- Game Data Files
| File | Description |
|------|-------------|
| `SAMPLE_DIALOGUES.md` | Sample dialogue scripts for four scenes (intro, first customer, rival encounter, romance option) with branching choices, relationship effects, and test data |

### `Assets/Data/DialogueFiles/` -- Episode Dialogue JSONs
Organized by chapter and episode. 8 chapters, 8 episodes each (64 files total).

```
DialogueFiles/
├── Chapter1/
│   ├── Episode1/episode1_dialogue.json
│   ├── Episode2/episode2_dialogue.json    -- blank template
│   ├── Episode2/episode2_dialoguesample.json  -- sample with Kit & Edward carrot cake dialogue
│   ├── Episode3/episode3_dialogue.json
│   ├── ...
│   └── Episode8/episode8_dialogue.json
├── Chapter2/ ... Chapter8/
│   └── (same Episode1-8 structure, each with episodeN_dialogue.json)
```

Each JSON follows this structure:
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

### `Assets/DialogueSystem/` -- Dialogue Design Docs
| File | Description |
|------|-------------|
| `BRANCHING_STORY_DESIGN.md` | JavaScript branching story system design -- three-tier choice structure (seating, cheesecake, tea), three endings (Secret Menu, Serenity, Wonder), replay mechanics, and state management |

### `Assets/Gameplay/` -- Gameplay System Docs
| File | Description |
|------|-------------|
| `BUTTON_CURRENCY_SYSTEM.md` | "Heart Buttons" currency system -- tiered button types (common/rare/legendary), earning mechanics, upgrade paths, shop pricing, payment animations, and story integration lore |

### `Assets/Scenes/` -- Scene Setup Docs
| File | Description |
|------|-------------|
| `DIALOGUE_SCENE_SETUP.md` | Step-by-step Unity scene hierarchy and component setup instructions for the dialogue system -- Canvas/UI configuration, audio setup, camera settings, required prefabs |

### `Assets/Scripts/DialogueSystem/` -- Unity C# Scripts
| File | Description |
|------|-------------|
| `DialogueManager.cs` | Core dialogue UI controller -- text display with typewriter effect, character sprites/names, choice presentation, audio playback, skip/advance functionality, post-dialogue navigation |
| `DialogueData.cs` | ScriptableObject defining dialogue data model -- DialogueLine (character, text, audio, effects) and Choice (navigation, requirements, relationship effects) classes |
| `DialogueLoader.cs` | Builds and manages a dictionary cache of DialogueData assets (inspector refs + Resources folder), with methods to load by ID, filter by chapter, and check availability |
| `CharacterManager.cs` | Character relationship management -- friendship/romance/business levels, preferences, scene/dialogue tracking, save/load serialization, relationship change events |
| `ChoiceHandler.cs` | Processes player dialogue choices -- records choices, applies relationship changes, unlocks content (dialogues/scenes/characters), checks milestones, handles navigation |
| `CafeManager.cs` | Placeholder script with `StartCafeShift()` stub for transitioning to cafe gameplay (note: contains duplicate class definition / compile error) |
| `GameProgress.cs` | Overall game progression tracking -- story chapters with unlock requirements, player choices, game stats (money/customers/score/playtime), save/load via PlayerPrefs JSON |

### `Assets/Stories/` -- Narrative Content
| File | Description |
|------|-------------|
| `MAGICAL_CHEESECAKE_STORY.md` | Complete dialogue script for "Luna's Enchanted Treats" -- Emma visits the magical cafe, orders cheesecake and tea, experiences magical flavors tied to memories, pays with button currency |

### `Assets/Updates/` -- Change Logs & Bug Fixes
| File | Description |
|------|-------------|
| `LUNA_DIALOGUE_FIX.md` | Bug fix: Luna wasn't speaking in the story due to incorrect dialogue flow causing Emma to repeat lines; resolved by adding proper Luna response and creation scenes |
| `STORY_COMPLETION_UPDATE.md` | Fix: Added missing tasting/reaction scenes (Emma tasting cheesecake and tea with emotional responses) before the payment sequence |
| `STORY_FLOW_FIX.md` | Fix: Story loop where clicking Emma's order choice repeated the same line; resolved by jumping directly to Luna's response scene |

---

## `web-demo/` -- Web Demo (HTML/CSS/JS)

Playable browser demos for prototyping the visual novel and cafe mechanics.

| File | Description |
|------|-------------|
| `index.html` | Redirect page that navigates to `selection.html` |
| `selection.html` | Demo selection landing page with card-based grid linking to the three demos: Magical Story, Visual Novel System, and Character Showcase |
| `visual-novel-demo.html` | Self-contained VN demo with typing effects, character switching, branching choices, relationship tracking UI, auto-play/skip/reset controls |
| `magical-cafe-story.html` | Main web demo for Luna's magical cafe story -- CSS food graphics, branching story, particle effects, character portraits, button currency payment UI |
| `magical-cafe-fixed.html` | Alternate/fixed version with top-down cafe layout, clickable seats, visual menu, movable character sprites, and branching story system |
| `branching-story.js` | JavaScript `BranchingStory` class -- three-tier choice system (seating, cheesecake, tea), state management, three conditional endings, replay/retry, achievements |
| `magical-food.css` | Pure CSS graphics and animations for magical cheesecake (sparkles), teacup (heart steam), teapot -- glow/float/sparkle keyframes, responsive design |
| `character-showcase.html` | Redirect to `selection.html` (character showcase not yet implemented) |
| `test.html` | Minimal test page displaying "Hello!" and a timestamp to verify web server is running |

---

*Last updated: 2026-03-18*

# Conveyor Belt, High Tea Tower & Wedge Plates

## Core Concept (Bake a Wish)

This is not a food game.
This is a game about:
**Turning small, disconnected choices into something emotionally meaningful.**

---

## The System (Under the Surface)

### 1. Conveyor Belt = Discovery

- Food passes by continuously
- Player picks instinctively
- Low pressure, almost playful

**This represents:** curiosity, intuition, "this feels right"

### 2. Plates = Fragments (The KEY Idea)

- Each plate is 1/4 of a whole
- Now upgraded to wedge plates

So visually:
- They look incomplete
- They want to be combined

**This represents:** pieces of a feeling, not the feeling itself

### 3. Tower = Meaning-Making

- 4 slots (Base -> Body -> Body -> Accent)
- Plus optional drink

Player takes fragments and:
**chooses what they mean when combined**

### 4. The Hidden Layer = Emotion Logic

Guests don't ask for items.
They express things like:
- "I feel overwhelmed"
- "I want comfort"
- "I miss something"

Player must:
- Interpret
- Select fragments
- Assemble a response

> The player is not serving food -- the player is **understanding someone**.

---

## The Gameplay Loop

1. Guest arrives with a subtle emotional need
2. Conveyor belt offers fragmented options (wedge plates)
3. Player collects pieces instinctively
4. Player commits by placing into tower
5. Tower forms a complete "expression"
6. Game evaluates:
   - Emotional alignment
   - Composition logic
7. Guest reacts:
   - Relief / joy / nostalgia / disappointment

---

## What Makes This Game Special

Most games:
*"Combine items to score points"*

This game:
*"Combine pieces to express care correctly"*

That's a completely different motivation loop.

---

## The Psychological Hook

The system creates a flow where players feel:
- **Curious** at the belt
- **Thoughtful** at the tower
- **Validated** at completion

And most importantly:
**They feel like they understood someone correctly.** That's powerful.

---

## The One Thing to Protect

If this becomes:
- Too mechanical -> loses emotion
- Too vague -> loses clarity

It breaks. The balance is:

| System Clarity        | Emotional Depth            |
|-----------------------|----------------------------|
| Clear slots, roles    | Soft hints, not explicit   |
| Visual feedback       | Subtle storytelling        |

---

## The Essence

> A gentle puzzle about empathy, disguised as a dessert-building system.

---

## Current Status

Already nailed:
- The loop
- The metaphor (fragments -> whole)
- The UI direction (plates -> tower)

**Now at: refinement stage, not idea stage.**

---

## Straight Truth

This is not a random cute idea anymore. This is a:
- Cohesive system
- With emotional identity
- And strong UX intuition (the wedge insight proves that)

---

## Next Steps

- Stress test the system (find where it breaks)
- Design full playable customer scenarios (with dialogue + correct towers)

That's where this becomes real gameplay, not just a concept.

---
---

# Implementation Art & Design Specs

Everything below documents the **actual visual design** as implemented in `cafe.js`, `cafe.css`, and related source files.

---

## Art Style Guidelines

- **2D only**, never 3D
- Watercolour textures on tables, walls, props
- Barbie My Scene-inspired character design
- Pastel colour palette (soft pinks, yellows, oranges, mint, light blues)
- Overlay effects rendered on a separate layer (glow, hearts, sparkles, food)
- All visual elements are modular (tables, props, characters)

---

## Colour Palette (CSS Variables)

Defined in `style.css`, used throughout the cafe UI:

| Variable         | Hex / Value                      | Usage                    |
|------------------|----------------------------------|--------------------------|
| `--cream`        | `#FFF8F0`                        | Primary background       |
| `--soft-peach`   | `#FDDCBA`                        | Background gradient mid  |
| `--blush`        | `#F4B8C1`                        | Accent, borders          |
| `--milk-tea`     | `#C8A882`                        | Warm neutral             |
| `--cocoa`        | `#8B4513`                        | Primary text             |
| `--dusty-rose`   | `#C48B9F`                        | Secondary accent         |
| `--gold`         | `#D4A843`                        | Buttons, highlights      |
| `--soft-yellow`  | `#F5E6A3`                        | Button gradient          |
| `--pale-mint`    | `#C8E6D0`                        | Success, correct states  |
| `--warm-white`   | `#FFF5EB`                        | Light surfaces, btn text |
| `--text-dark`    | `#4A3728`                        | Dark body text           |
| `--text-light`   | `#7A6455`                        | Muted labels             |
| `--shadow`       | `rgba(74, 55, 40, 0.15)`        | Drop shadows             |

---

## Typography

| Role                  | Font Family                   | Size      | Weight |
|-----------------------|-------------------------------|-----------|--------|
| Headings / titles     | `'Playfair Display', serif`   | 1.3-2rem  | 700    |
| Shift intro title     | Playfair Display              | 1.8rem    | 700    |
| UI / buttons / labels | `'Quicksand', sans-serif`     | 0.55-1rem | 600    |
| Customer dialogue     | Quicksand                     | 0.78rem   | italic |
| Recipe card name      | Playfair Display              | 0.82rem   | 700    |
| Ingredient card name  | Quicksand                     | 0.55rem   | 600    |

---

## Screen Backgrounds

**Cafe Screen** (`#cafe-screen`):
- `linear-gradient(180deg, var(--cream) 0%, var(--soft-peach) 60%, var(--warm-white) 100%)`
- Transition: `opacity 0.6s ease` | Z-index: 85

**Shift Intro** (`#shift-intro`):
- `linear-gradient(180deg, var(--cream) 0%, var(--soft-peach) 60%, var(--blush) 100%)`
- Z-index: 200 | Padding: 32px

**Cafe Room Floor** (`#cafe-room`):
- Wood plank pattern (vertical): `repeating-linear-gradient(90deg, ..., 80px)`
- Wood plank pattern (horizontal): `repeating-linear-gradient(0deg, ..., 40px)`
- Base: `linear-gradient(180deg, rgba(245,230,210,0.4), rgba(230,210,185,0.3))`

**Cafe Room Windows** (`#cafe-room::before`, `::after`):
- 64x80px rounded rectangles at top-left and top-right
- Sky gradient background with window pane dividers and curtain tops
- 3px wooden frame border, inset white highlight

---

## Table Zone Layout

6 tables in a **2x3 grid** with barista zone at the bottom.

```
─────────────────────── Cafe Room ────────────────────────
|                                                          |
|     [Table 1]      [Table 2]      [Table 3]             |
|                                                          |
|     [Table 4]      [Table 5]      [Table 6]             |
|                                                          |
|              ☕ Barista / Magician Zone                   |
────────────────────────────────────────────────────────────
```

| Property        | Desktop         | Mobile (<=640px) |
|-----------------|-----------------|------------------|
| Grid            | 2 rows x 3 cols | Same             |
| Row gap         | 52px            | 40px             |
| Column gap      | 20px            | 12px             |
| Room padding    | 12px 16px 4px   | 30px 10px 6px   |

---

## Table Design

### Dimensions

| Shape       | Table Size    | Surface Size  | CSS Class                  |
|-------------|---------------|---------------|----------------------------|
| Circle      | 140x140px     | 120x120px     | (default)                  |
| Square      | 140x140px     | 120x120px     | `.table-shape-square`      |
| Rectangle   | 170x120px     | 150x100px     | `.table-shape-rectangle`   |
| Heart       | 150x150px     | 130x120px     | `.table-shape-heart`       |

Mobile: tables shrink to 120px, surfaces to 120x85px.

### Table Legs

- Width: 8px, Height: 20px
- Gradient: `linear-gradient(180deg, #B8945E, #8A6838)`
- Slight outward rotation: left `-4deg`, right `4deg`
- Heart shape hides legs entirely

### Table Themes

7 selectable themes applied via CSS class on `.table-surface`:

**Wood (default)**
- Base: `linear-gradient(170deg, #DEC49C 0%, #C8A87A 30%, #B8945E 55%, #C8A87A 80%, #D4B48A 100%)`
- Texture: Wood grain via repeating-linear-gradients (93deg, 96deg) + knot accents via radial-gradients
- Border: `3px solid rgba(160, 112, 64, 0.5)`, bottom `5px solid rgba(130, 90, 50, 0.6)`
- Shadow: Stacked 3D effect (6 layers) + inset top highlight + inset bottom shadow

**Rose Marble** (`.table-theme-rose`)
- Base: `linear-gradient(160deg, #EDCDD4, #E0B5BF, #D4A0AD, #E0B5BF, #EDCDD4)`
- Texture: Marble veins at 125deg, 130deg, 118deg, 135deg
- Border: `rgba(196, 139, 159, 0.45)`
- Legs: `linear-gradient(180deg, #C48B9F, #A87088)`

**Sage Linen** (`.table-theme-sage`)
- Base: `linear-gradient(175deg, #C8DCC8, #B4CCB8, #A0BCA4, #B4CCB8, #C4D8C4)`
- Texture: Linen weave via repeating-gradients (0deg & 90deg)
- Border: `rgba(140, 175, 148, 0.5)` + cloth overhang `0 0 0 6px rgba(180, 204, 184, 0.75)`
- Legs: `linear-gradient(180deg, #7FA388, #668A70)`

**Lavender Terrazzo** (`.table-theme-lavender`)
- Base: `linear-gradient(170deg, #D0C4E0, #BEB0D4, #ACA0C4, #BEB0D4, #CCC0DC)`
- Texture: Terrazzo chips via multiple radial-gradients
- Border: `rgba(149, 132, 173, 0.45)`
- Legs: `linear-gradient(180deg, #9584AD, #7A6C94)`

**Ocean Gingham** (`.table-theme-ocean`)
- Base: `linear-gradient(175deg, #E0EEF4, #D0E4EE, #C4DAE8, #D0E4EE, #E0EEF4)`
- Texture: Gingham pattern via repeating-gradients (0deg & 90deg) using `rgba(100, 160, 195, 0.25)`
- Border: `rgba(140, 185, 210, 0.5)` + cloth overhang `0 0 0 6px rgba(192, 218, 232, 0.75)`
- Legs: `linear-gradient(180deg, #7AA0B2, #628898)`

**Honey Stone** (`.table-theme-honey`)
- Base: `linear-gradient(170deg, #F2E0BE, #E8D0A0, #DCC088, #E8D0A0, #F0DDB8)`
- Texture: Translucent layers via multiple radial-gradients
- Border: `rgba(212, 184, 126, 0.5)`
- Legs: `linear-gradient(180deg, #D4B87E, #B8A068)`

**Peach Clay** (`.table-theme-peach`)
- Base: `linear-gradient(170deg, #E8C8B4, #D8B09C, #CC9C88, #D8B09C, #E4C0AC)`
- Texture: Earthy radial-gradient circles and ellipses
- Border: `rgba(196, 144, 128, 0.5)`
- Legs: `linear-gradient(180deg, #C49080, #A87868)`

### Heart Shape Edge Layers

The heart shape builds a 3D edge via stacked JavaScript-generated layers:

| Layer | Transform                          | Effect                              |
|-------|------------------------------------|-------------------------------------|
| 1     | `scale(1.05)`                      | Base edge                           |
| 2     | `scale(1.05) translateY(2px)`      | `filter: brightness(0.85)`          |
| 3     | `scale(1.05) translateY(4px)`      | `opacity: 0.7`                      |
| 4     | `scale(1.05) translateY(6px)`      | `opacity: 0.5`                      |
| 5     | `scale(1.05) translateY(8px)`      | `opacity: 0.3`                      |
| 6     | `scale(1.05) translateY(10px)`     | `opacity: 0.25`, `filter: blur(10px)` |

---

## Customer & Seat Design

### Avatar Emojis

Cycle through 7 emoji avatars per customer arrival:

```
👤  🧑  👩  👨  👦  👧  🧓
```

### Seat Styling

| Property       | Empty Seat              | Occupied Seat                                               |
|----------------|-------------------------|-------------------------------------------------------------|
| Size           | 52x52px                 | 52x52px                                                     |
| Shape          | Circle (`border-radius: 50%`) | Circle                                                |
| Border         | Dashed, transparent     | `1.5px solid rgba(244, 184, 193, 0.5)`                     |
| Background     | None                    | `linear-gradient(180deg, rgba(244,184,193,0.3), rgba(253,220,186,0.35))` |
| Shadow         | None                    | `0 2px 6px rgba(74, 55, 40, 0.1)`                          |
| Font-size      | 1.5rem                  | 1.5rem                                                      |
| Mobile         | 30x40px, 1rem           | Same                                                        |

### Seat Positioning Algorithm

- Radius: `rx = (surfaceW / 2) + (seatSize * 0.15)`
- Minimum angle separation: 60 degrees (`Math.PI / 3`)
- Avoids top zone: 230-310 degrees (prevents overlap with order bubble)
- Random angle generation with collision detection

---

## Speech Bubbles (Order Bubbles)

- Position: Above table, centered with V-shaped tail pointing down
- Background: `rgba(255, 245, 235, 0.95)`
- Border: `1.5px solid var(--gold)`
- Border-radius: 14px
- Font: Quicksand, 0.7rem, weight 600
- Tail: Gold border triangle (`::before`) + white fill triangle (`::after`)
- Animation: `bubble-pop 0.35s ease` (scale 0 -> 1)

---

## Food Slot

- Position: Top-center of table surface, 44x44px circle
- **With food**: White bg `rgba(255,248,240,0.9)`, mint border, `food-appear` scale-in animation
- **Sponge (messy)**: Wobbling `sponge-wobble` animation (rotate +/-8deg), scales on hover, pink drop-shadow

---

## Craft View Design

### Card Slots

| State       | Border                                | Background                                        | Effect                     |
|-------------|---------------------------------------|---------------------------------------------------|----------------------------|
| Empty       | `2px dashed rgba(200,168,130,0.35)`   | Tan gradient                                      | Hover: scale 1.03          |
| Filled      | `1.5px solid var(--blush)`            | `#FFF8F0` -> `#FFFAF5`                            | —                          |
| Correct     | `var(--pale-mint)`                    | —                                                 | `slot-glow 0.6s`           |
| Drag-over   | `var(--gold)`                         | Gold-tinted gradient                              | scale 1.06                 |

Dimensions: 64x80px (desktop), 52x66px (mobile)

### Ingredient Cards

- Size: 72x86px (desktop), 58x72px (mobile)
- Background: `linear-gradient(180deg, #FFF8F0, #FFFAF5)`
- Border: `1.5px solid rgba(200, 168, 130, 0.3)`
- Border-radius: 10px
- Cursor: `grab` (normal), `grabbing` (active)
- Hover: lift 4px, blush border, shadow
- **Special cards**: Gold border, sparkle float animation on icon
- **Disabled**: 40% opacity, grayscale 50%
- **Use count badge**: 18px circle, dusty-rose bg, top-right corner

### Ingredient Deck Tabs

- 7 category tabs (filters)
- Inactive: Tan bg `rgba(200, 168, 130, 0.12)`, 0.68rem
- Active: Gold bg, white text, weight 700
- Border-radius: 10px

### FUSE Button

| State    | Background                                               | Effect                           |
|----------|----------------------------------------------------------|----------------------------------|
| Disabled | `rgba(200, 168, 130, 0.15)` -> `0.25`                   | Muted text, no cursor            |
| Enabled  | `linear-gradient(135deg, var(--gold), #E6C04E)`          | Pulsing gold glow, lift on hover |

- Position: Centered bottom, border-radius 30px
- Font: 1rem, weight 700, uppercase, 2px letter-spacing
- Glow animation: `fuse-ready 1.5s ease-in-out infinite`

---

## Customer Chat

- **Chat bubble**: Peach/cream gradient bg, blush border, 12px radius
- **Customer line**: Quicksand, 0.75rem, italic
- **Choice buttons**: 2 options, 0.7rem, weight 600
  - Hover: gold border, pale yellow bg, lift 1px
  - Correct: mint border + mint bg
  - Wrong: dusty-rose border, 50% opacity
- **Response**: Mint gradient bg, `chatResponseIn 0.3s ease` fade-up

---

## Recipe Book Modal

- **Outer**: Leather-brown gradient (`#D4A060` -> `#C8946A` -> `#B8845A`), 92% width, max 600px
- **Spine**: 8px wide, dark leather gradient (`#A07040` -> `#8B5E3C`)
- **Pages**: Cream `#FFF8F0`, radial-gradient watercolour texture
- **Recipe cards**: Cream/peach gradient, 12px radius, hover lift
  - Icon: 2.6rem emoji, drop-shadow
  - Name: Playfair Display 0.82rem
  - Subcategory: Quicksand 0.58rem uppercase, dusty-rose
  - Ingredient badges: 26px circles with emoji + tiny name label
- **Index tabs** (right edge): 4 tabs (Drinks, Food, Desserts, Specials)
  - Inactive: `#F0E6D6`, rounded right side
  - Active: `#FFF8F0`, slides 6px right, shadow
  - Tab emojis: ☕ 🍲 🎂 ✨

---

## Barista / Magician Zone

- Bottom bar with gradient: `rgba(253, 220, 186, 0.4)` -> `rgba(255, 248, 240, 0.6)`
- **Sprite**: 48px circle, peach/blush gradient, ☕ emoji, 2px shadow
- **Slide animation**: Bounce up 20px + scale 1.05, 0.6s ease
- **Label**: "M & B" in Playfair Display, 0.75rem, weight 700

---

## Serve Result Overlay

- Fullscreen overlay: `rgba(255, 248, 240, 0.95)`, z-index 180
- **Result icon**: 4rem, bounce animation (scale 0.3 -> 1.15 -> 1)
- **Result text**: Playfair Display, 1.3rem, max-width 360px
- **Buttons**:
  - Next: Dusty-rose/blush gradient, white text, 24px radius
  - Retry: Gold/yellow gradient, white text, 24px radius
  - Return: Transparent tan bg, cocoa text, subtle border

---

## Decoration Screen

- Same gradient bg as shift intro
- **Theme swatches**: 40x40px circles with theme fill colour, 14px rounded container
  - Active: gold border + shadow
- **Shape swatches**: 40x40px shapes (circle / square / rectangle / heart)
  - Heart uses clip-path
  - Active: gold border + shadow
- **Preview table**: Live table-surface preview with selected theme + shape
- **Section labels**: Quicksand 0.75rem, uppercase, letter-spacing 0.06em

---

## Shift Complete Screen

- Same gradient bg as shift intro
- **Heading**: Playfair Display, 2rem
- **Summary**: 0.95rem stats
- **Rating**: 1.5rem, contextual emoji:
  - 0 mistakes: ✨✨✨ Perfect
  - 1-2 mistakes: ✨✨ Great
  - 3-4 mistakes: ✨ Not bad
  - 5+ mistakes: 💥 Rough

---

## Animations Reference

| Animation           | Keyframes                                              | Duration / Timing              |
|---------------------|--------------------------------------------------------|--------------------------------|
| `bubble-pop`        | Scale 0 -> 1 (from top)                               | 0.35s ease                     |
| `food-appear`       | Scale 0 -> 1 (centered)                               | 0.4s ease                      |
| `overlay-glow`      | Opacity 0.6 -> 1 -> 0.6                               | 1.5s ease-in-out infinite      |
| `heart-pulse`       | Scale 0 -> 1.2 -> 1 -> 1.15 -> 1 -> 0.8, fade out    | 4s ease-in-out forwards        |
| `sponge-wobble`     | Rotate 0 -> -8deg -> +8deg -> 0                       | 1s ease-in-out infinite        |
| `barista-slide`     | TranslateY 0 -> -20px (scale 1.05) -> 0               | 0.6s ease                      |
| `tip-bounce`        | Scale 1 -> 1.3 -> 0.95 -> 1                           | 0.6s ease                      |
| `tip-float-up`      | TranslateY 0 -> -40px, fade out                       | 1.2s ease-out forwards         |
| `chatResponseIn`    | TranslateY 6px -> 0, fade in                          | 0.3s ease                      |
| `result-fade-in`    | Opacity 0 -> 1                                         | 0.4s ease                      |
| `result-bounce`     | Scale 0.3 -> 1.15 -> 1, fade in                       | 0.6s ease                      |
| `fuse-anim-in`      | Opacity 0 -> 1                                         | 0.3s ease                      |
| `fuse-anim-pop`     | Scale 0.5 rotate -10deg -> 1.1 rotate 2deg -> 1       | 0.8s ease                      |
| `fuse-ready`        | Gold glow shadow pulse                                 | 1.5s ease-in-out infinite      |
| `slot-glow`         | Mint box-shadow 0 -> 12px 4px -> none                  | 0.6s ease                      |
| `order-slide-in`    | TranslateX -20px -> 0, fade in                         | 0.4s ease                      |

---

## Emoji / Icon Reference

| Context            | Emoji     | Usage                                 |
|--------------------|-----------|---------------------------------------|
| Food slot default  | 🍽️       | Empty plate placeholder               |
| Sponge cleanup     | 🧽        | Messy table, click to clean           |
| Fuse (drink)       | ☕✨      | Fuse animation overlay                |
| Fuse (food)        | 🧙✨      | Fuse animation overlay                |
| Heart (eating)     | ❤️        | Single big heart pulse on served dish |
| Tip currency       | 🪣        | Button currency indicator             |
| Barista            | ☕        | Barista sprite icon                   |
| Success            | ✨        | Serve result                          |
| Failure            | 😞        | Serve result                          |
| Rating: Perfect    | ✨✨✨    | 0 mistakes                            |
| Rating: Great      | ✨✨      | 1-2 mistakes                          |
| Rating: Good       | ✨        | 3-4 mistakes                          |
| Rating: Rough      | 💥        | 5+ mistakes                           |
| Recipe tab: Drinks | ☕        | Recipe book index                     |
| Recipe tab: Food   | 🍲        | Recipe book index                     |
| Recipe tab: Desserts | 🎂      | Recipe book index                     |
| Recipe tab: Specials | ✨      | Recipe book index                     |
| Customer avatars   | 👤🧑👩👨👦👧🧓 | Cycling seat avatars          |

---

## Delivery Animation Sequence

After FUSE + serve result, returning to Table Zone triggers this sequence:

1. **Barista slides** (0.6s) -- Sprite bounces up/down
2. **Food placed** -- Table -> "served", recipe icon scale-in, green glow overlay
3. **Customer eating** (0.8s) -- Table -> "eating", big red heart pulse animation
4. **Customer leaves** (1.2s) -- Table -> "messy", customer disappears, sponge appears
5. **Player cleans** -- Click sponge -> clean table -> `seatNextCustomers()`

Failed dishes skip steps 2-3 and go directly to messy state.

---

## Table States (Visual)

| State        | Customer   | Food Slot       | Overlay         | Surface Border      |
|--------------|------------|-----------------|-----------------|---------------------|
| **Empty**    | --         | --              | --              | Default             |
| **Ordering** | Avatar     | --              | --              | Gold pulse          |
| **Crafting** | Avatar     | --              | --              | Default             |
| **Served**   | Avatar     | Recipe icon     | Green glow      | Pale mint           |
| **Eating**   | Avatar     | Recipe icon     | Heart pulse     | Pale mint           |
| **Messy**    | Gone       | Wobbling 🧽     | --              | Dusty rose, 70% opacity |

---

## Cafe Scene Mood Boards

6 conceptual scene variations for future art direction:

### Morning Sunlight Cafe
- **Mood**: Soft morning glow, warm sunlight through windows
- **Tables**: Light wood, pastel tablecloths
- **Props**: Steaming coffee, small pastries, open recipe book
- **FX**: Sunbeams with watercolour overlay

### Rainy Day Cozy Cafe
- **Mood**: Gentle rain, reflective wet window panes
- **Tables**: Darker pastel shades, small indoor plants
- **Props**: Tea cups with steam, puddle reflections
- **FX**: Soft raindrops, warm interior glow

### Flea Market Cafe Extension
- **Mood**: Vintage, eclectic
- **Tables**: Mismatched styles (wood, pastel, shabby chic)
- **Props**: Clay cups, vintage teapots, small trinkets
- **FX**: Floating sparkles around "treasures"

### Fruit & Citrus Theme
- **Mood**: Bright, cheerful, energetic
- **Tables**: Rectangular, centre fruit baskets
- **Props**: Fruit salad plates, juice gradient cups
- **FX**: Glowing hearts and floating fruit icons

### Afternoon Study Cafe
- **Mood**: Calm, serene, library-like
- **Tables**: Small tables with books and tea cups
- **Props**: Open books, pastries, sketch notebooks
- **FX**: Warm watercolour highlights on surfaces

### Evening Dessert Glow
- **Mood**: Twilight, dim pastel lamplight
- **Tables**: Rich pastel surfaces, candle jars
- **Props**: Desserts on plates, clay cups
- **FX**: Glow around desserts, subtle cup sparkle

---

## Responsive Breakpoints (<=640px)

| Element            | Desktop       | Mobile           |
|--------------------|---------------|------------------|
| Table container    | 140px         | 120px            |
| Table surface      | 120x120px     | 120x85px         |
| Seat               | 52x52px       | 30x40px          |
| Card slot          | 64x80px       | 52x66px          |
| Ingredient card    | 72x86px       | 58x72px          |
| FUSE button        | 1rem, 12x40px | 0.85rem, 10x28px |
| Deck tab           | 0.68rem       | 0.6rem           |
| Row gap            | 52px          | 40px             |
| Windows            | 64x80px       | 44x56px          |
| Recipe book width  | 92%           | 96%              |

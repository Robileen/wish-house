# Wish House – Gameplay UI Spec

## Game Flow

```
Journal (Main Menu)
    │
    ├── VN Episode (visual novel scenes)
    │
    └── Cafe Shift
            │
            ├── Shift Intro Overlay
            │       └── click "Start Shift"
            │
            ├── Decoration Screen
            │       ├── Table colour/texture picker (7 themes)
            │       ├── Live preview table
            │       └── click "Begin Shift"
            │
            ├── Table Zone (cafe room with 6 circular tables)
            │       ├── Customers appear at random tables with speech bubbles
            │       ├── Click a table → take order → Craft View
            │       ├── After serving → food delivery animation
            │       ├── Customer eats → leaves → table goes messy
            │       └── Click sponge to clean → next customer seats
            │
            ├── Craft View (ingredient matching)
            │       ├── Order banner (customer + recipe icon/name)
            │       ├── Card slots (auto-filled from recipe)
            │       ├── Ingredient deck (all ingredients, tabbed)
            │       ├── FUSE button
            │       └── "Back to Tables" returns to Table Zone
            │
            └── Shift Complete Overlay
```

---

## 1. Shift Intro

Full-screen overlay with shift name, description, and goal (e.g. "Serve 12 successful dishes"). Click "Start Shift" to enter the Decoration Screen.

---

## 2. Decoration Screen

Appears between Shift Intro and gameplay. Player picks a table style for the shift.

### Table Themes

| Theme | Texture | Description |
|-------|---------|-------------|
| **Wood** | Rich grain with knot swirls | Warm brown wood with visible grain lines |
| **Marble** | Veined pink marble | Soft pink with diagonal white/grey vein streaks |
| **Ceramic** | Matte sage with speckle | Earthy green with scattered tiny flecks |
| **Terrazzo** | Pastel purple chips | Lavender base with scattered terrazzo chip shapes |
| **Ocean** | Watercolour wash | Soft blue with irregular wet paint bleeds |
| **Stone** | Polished amber | Warm translucent layers with subtle light veins |
| **Clay** | Terracotta | Earthy peach with fine sandy texture dots |

### UI Layout

* Title: "Decorate Your Cafe" (Playfair Display)
* Subtitle: "Choose a table style for today's shift"
* Preview table: circular table surface showing the selected texture
* 7 colour swatches: circular fills with labels, gold border on active
* "Begin Shift" button: gold gradient (same style as Start Shift)
* Selection persisted in `localStorage` key `wishhouse_table_theme`

---

## 3. HUD (Top Bar)

Always visible during the shift:

```
┌─────────────────────────────────────────────────────────────────┐
│ Shift 1   [████░░░░░░░░] 3/12   Streak: 2   ??   [End Shift] [×] │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| **Shift label** | Playfair Display, cocoa brown |
| **Progress bar** | Pale mint → gold gradient fill |
| **Dish count** | e.g. "3 / 12" |
| **Streak** | Gold text, resets on mistake |
| **Mistakes** | ❓ icons (up to 5) |
| **End Shift** | Enabled once goal met |
| **Quit (×)** | Opens confirmation modal — discards progress, returns to journal |

---

## 4. Table Zone (Cafe Room)

6 **circular tables** (170×170px) in a **2×3 grid** with a barista zone at the bottom.

### Table Design

* **Shape:** Circle (`border-radius: 50%`)
* **Texture:** Themed surface matching the player's Decoration Screen selection
* **Legs:** Two small wooden pegs at the bottom, colour-matched to theme
* **Table labels:** Centred below each table

### Customer Seats

* **Dynamic placement:** seats appear at random angles around the table edge
* **Only shown when occupied** — no empty seat outlines
* **Collision avoidance:** minimum 60° angle separation between seats on the same table
* **Size:** 52×52px circles with customer avatar emoji
* **Style:** pastel gradient fill, solid border, subtle shadow
* Positions cached per table (don't jump on re-render)

### Speech Bubbles

* Float **above** the table centre
* Centred horizontally with V-shaped tail pointing down
* Gold border (`1.5px`), warm-white background (`rgba(255,245,235,0.95)`)
* Recipe icon + name (single order) or all icons + "N orders" (multiple)
* **Pop-in animation only on first appearance** (new customer seating)
* Re-renders (after serving/cleaning) show bubble without animation

### Table States

| State | Visual | Interaction |
|-------|--------|-------------|
| **Empty** | Clean circular table, no customers | — |
| **Ordering** | Customer circle(s) around table, speech bubble | Click table → Craft View |
| **Crafting** | Customers seated, no bubble | Player is in Craft View |
| **Served** | Customers + food icon on table, pale mint border | Auto-advances |
| **Eating** | Customers + food, floating hearts animation | Auto-advances |
| **Messy** | No customers, wobbling sponge emoji on table | Click table/sponge to clean |

### Customer Seating

* Up to 3 tables populated at a time from the order queue
* New customers seat when a table is cleaned
* 20 customers per shift, 12 required to pass

---

## 5. Craft View

Entered by clicking a table with an ordering customer. Recipe is **auto-selected** from the customer's order.

```
┌─────────────────────────────────────────────────────────────────┐
│ 👩 Office Worker  "Just a simple coffee, please."  ☕ House Blend │
│                                           [?] [Back to Tables]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│          [ ☕ ] [ 🔥 ]        ↺                                  │
│          Coffee  Hot                                             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [All] [Bases] [Produce] [Toppings] [Dairy&More] [Temp] [Special]│
│                                                                  │
│  🍎    🍌    🍞    🧈    🥤    🧀    🍒    🍫    🌰             │
│ Apple Banana Bread Butter Crml Cheese Chrry Choco Cinn          │
│  ☕    ❄️    🥚    🌾    🍯    🔥    ...                         │
│ Coffee Cold  Egg  Flour Honey  Hot                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     ✨ FUSE ✨                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Order Banner

| Element | Description |
|---------|-------------|
| **Avatar** | Customer emoji in blush/rose circle |
| **Name** | Playfair Display bold |
| **Dialogue** | Italic, muted text |
| **Recipe hint** | Gold icon + name of the ordered dish |
| **? button** | Opens Recipe Book modal |
| **Back to Tables** | Returns to Table Zone, resets table to ordering state |

### Card Slots

* Auto-created based on recipe ingredient count
* Dashed border when empty (`+` placeholder)
* Solid border + ingredient icon when filled
* Green glow when correct ingredient placed
* Click filled slot to remove ingredient
* **Revert button (↺)** beside the slots — clears all selections at once
* Drag-and-drop: slots accept dropped ingredient cards

### Ingredient Deck

All ingredients shown (31 non-special + wild card), sorted **alphabetically** by name. Filtered by tabs:

| Tab | Ingredient Groups |
|-----|-------------------|
| **All** | Everything |
| **Bases** | base (Coffee, Tea, Milk, Flour, Bread, Rice, Matcha) |
| **Produce** | fruit (Apple, Banana, Blueberry, Cherry, Lemon, Strawberry) + vegetable (Lettuce, Mushroom, Seaweed, Tomato) |
| **Toppings** | topping (Caramel, Chocolate, Cinnamon, Cream, Honey) + sweetener (Sugar, Vanilla) + spice (Lavender) |
| **Dairy & More** | dairy (Butter, Cheese) + protein (Egg) + grain (Oats) |
| **Temp** | temp (Hot, Cold) |
| **Special** | Wild Card, Stardust, category cards, premades |

* Active tab: gold background with white text
* Cards show emoji icon + name
* Highlighted border (pale mint) on cards matching the current recipe
* Drag support: `draggable=true`, drag-over glow on slots

### Ingredient Card Behaviour

Cards are split into **multi-use** and **single-use** categories:

#### Multi-Use Cards
Groups: base, fruit, topping, sweetener, dairy, protein, vegetable, grain, spice

* Card stays fully visible in the deck after being placed in a slot
* A **usage count badge** (small circle, top-right) shows how many slots the card occupies
* Clicking the same card again places it in the next empty slot (e.g. a recipe needing 2x milk)
* When removed from a slot the badge count decreases; at 0 the badge disappears

#### Single-Use Cards
Groups: special (`isSpecial: true`), temp (`group === "temp"`)

* Card **disappears** from the deck when placed in a slot
* Card **reappears** in the deck when removed from the slot
* No usage count badge — only one instance can be placed at a time

**Includes:** Wild Card, Combo Card, Premade Dish, Premade Drink, category wildcards (Any Fruit, Any Base, Any Topping), Hot, Cold

#### Temperature Exclusion Rule

Hot and Cold are **mutually exclusive** — only one temperature can be used per recipe:

* If **Hot** is placed in a slot, the **Cold** card is hidden from the deck
* If **Cold** is placed in a slot, the **Hot** card is hidden from the deck
* Removing the placed temperature card from its slot makes the other temperature card reappear
* This prevents the player from placing both Hot and Cold in the same recipe

#### Wild Card

* Always included in every recipe's deck
* Substitutes for **any** ingredient during recipe matching
* Single-use (disappears from deck when placed)
* Gold border with sparkle animation

#### Recipe Matching

* **Order doesn't matter** — ingredients can be placed in any slot
* **Exact matches preferred** — algorithm tries exact ingredient matches first
* **Wild card fallback** — if no exact match found, a wild card substitutes
* **One-to-one** — each placed ingredient matches at most one required ingredient
* Success requires: correct ingredients **AND** correct recipe for the customer's order

### FUSE Button

* Bottom center, fixed position
* Disabled (muted) until all slots filled
* Enabled: gold gradient, pulsing glow animation
* Triggers brew (drinks) or conjure (food) animation overlay

---

## 6. Recipe Book Modal

Opened via the **?** button. See `RECIPE_BOOK.md` for full spec.

Key points:
* Book-style modal with leather cover, spine, cream pages
* Two-page spread, 2 dishes per page, 4 per spread
* Index tabs on right edge (Drinks, Food, Desserts, Specials)
* Faded page arrows on left/right sides of book
* Shows ALL recipes from `Assets/Data/CafeData/recipes/`
* Ingredient icons with names below each icon

---

## 7. Post-FUSE Flow — Serve Result Screen

After FUSE animation completes, a result overlay is shown. The buttons displayed depend on the outcome and remaining orders:

### Success — Table Has More Orders

```
        ✨
  House Blend served successfully!

  [Continue Next Order]  [Return to Tables]
```

* **Continue Next Order** (pink, primary): shows order picker for remaining orders at same table
* **Return to Tables** (subtle): delivers food briefly, returns table to ordering state with remaining orders

### Success — Last/Only Order at Table

```
        ✨
  House Blend served successfully!

  [Back to Tables]   (or [Finish Shift] if goal met)
```

* Single button — goes to table zone with full delivery animation (serve → eat → messy → clean)

### Failure — Table Has More Orders

```
        😞
  Wrong recipe! Edward: "Maybe check the recipe book?"

  [Try Again?]  [Next Order]  [Return to Tables]
```

* **Try Again?** (gold, primary): re-opens same order with fresh ingredient slots
* **Next Order** (pink): goes to order picker to select a different order at the same table
* **Return to Tables** (subtle): returns to table zone, all incomplete orders remain (including the failed one)

### Failure — Single Order at Table

```
        😞
  Wrong recipe! Edward: "…our budget, boss… 😒"

  [Try Again?]  [Return to Tables]
```

* **Try Again?** (gold): re-opens same order with fresh slots
* **Return to Tables** (subtle): returns to table zone, failed order stays as pending

### Failure — 5+ Mistakes (Forced End)

```
        😞
  Wrong recipe!
  Edward: "Uh boss… more practice?"
  Kit: "Why?!"

  [Continue]
```

* Single button — ends the shift immediately, goes to Shift Complete screen

### Key Behaviours

* **Failed orders are NOT marked as completed** — they remain pending and retryable
* **"Return to Tables" always preserves incomplete orders** — customers stay seated, speech bubble shows remaining orders
* **Mistake counter resets to 0 at the start of every shift** — each shift is treated as fresh

---

## 8. Visual & UI Notes

* **Style:** 2D, watercolour, gentle, Barbie My Scene
* **Palette:**
  * Base: Cream `#FFF8F0`, soft peach `#FDDCBA`, blush `#F4B8C1`
  * Anchors: Milk tea `#C8A882`, cocoa `#8B4513`, dusty rose `#C48B9F`
  * Accents: Gold `#D4A843`, soft yellow `#F5E6A3`, pale mint `#C8E6D0`
* **Fonts:** Playfair Display (headings), Quicksand (UI/labels)
* **Scrollbar:** Custom thin 6px, blush-to-milk-tea gradient
* **Responsive:** Scaled down at ≤640px (smaller tables, cards, tabs)

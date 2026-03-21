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
            ├── Table Zone (cafe room with 6 tables)
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

Full-screen overlay with shift name, description, and goal (e.g. "Serve 12 successful dishes"). Click "Start Shift" to enter the Table Zone.

---

## 2. HUD (Top Bar)

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

## 3. Table Zone (Cafe Room)

6 tables in a **2×3 grid** with a barista zone at the bottom. Vertical gap of 52px between rows to accommodate speech bubbles.

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│    ☕ House Blend     🍵 Matcha                            │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐        │
│   │ 👩  ·    │     │ 👨  ·    │     │  ·   ·   │        │
│   │    🍽    │     │    🍽    │     │    🍽    │        │
│   └──────────┘     └──────────┘     └──────────┘        │
│    Table 1          Table 2          Table 3             │
│                                                           │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐        │
│   │  ·   ·   │     │ 🧓  ·    │     │  ·   ·   │        │
│   │    🍽    │     │    🍽    │     │    🍽    │        │
│   └──────────┘     └──────────┘     └──────────┘        │
│    Table 4          Table 5          Table 6             │
│                                                           │
│                    ☕ M & B                                │
└───────────────────────────────────────────────────────────┘
```

### Table States

| State | Visual | Interaction |
|-------|--------|-------------|
| **Empty** | Empty seats (dashed borders), no customer | — |
| **Ordering** | Customer avatar in seat A, speech bubble above table with recipe icon + name | Click table → go to Craft View |
| **Crafting** | Customer seated, no bubble (player is in Craft View) | — |
| **Served** | Customer + food icon on table, green glow overlay | Auto-advances |
| **Eating** | Customer + food, floating hearts animation | Auto-advances |
| **Messy** | No customer, wobbling sponge emoji on table | Click table/sponge to clean |

### Speech Bubbles

* Float **above** the table (outside `.table-surface`)
* Centered horizontally with V-shaped tail pointing down
* Gold border, warm-white background
* Recipe icon + name (e.g. "☕ House Blend") or dialogue text
* Pop-in animation on appear

### Customer Seating

* Up to 3 customers seated at random empty tables at a time
* New customers seat when a table is cleaned
* 20 customers per shift, 12 required to pass

---

## 4. Craft View

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
* Multi-click on food cards (non-special, non-temp) — usage count badge
* Single-use for special and temp cards
* Drag support: `draggable=true`, drag-over glow on slots
* Highlighted border on cards matching the current recipe

### FUSE Button

* Bottom center, fixed position
* Disabled (muted) until all slots filled
* Enabled: gold gradient, pulsing glow animation
* Triggers brew (drinks) or conjure (food) animation overlay

---

## 5. Recipe Book Modal

Opened via the **?** button. See `RECIPE_BOOK.md` for full spec.

Key points:
* Book-style modal with leather cover, spine, cream pages
* Two-page spread, 2 dishes per page, 4 per spread
* Index tabs on right edge (Drinks, Food, Desserts, Specials)
* Faded page arrows on left/right sides of book
* Shows ALL recipes from `Assets/Data/CafeData/recipes/`
* Ingredient icons with names below each icon

---

## 6. Post-FUSE Flow

1. Fuse animation overlay (brew/conjure)
2. Serve result screen (success ✨ or fail 😞 with reason)
3. Click "Back to Tables" → returns to Table Zone
4. Delivery animation: barista slides → food placed → glow → hearts → customer eats → messy
5. Click sponge to clean table → next customer seats

---

## 7. Visual & UI Notes

* **Style:** 2D, watercolour, gentle, Barbie My Scene
* **Palette:**
  * Base: Cream `#FFF8F0`, soft peach `#FDDCBA`, blush `#F4B8C1`
  * Anchors: Milk tea `#C8A882`, cocoa `#8B4513`, dusty rose `#C48B9F`
  * Accents: Gold `#D4A843`, soft yellow `#F5E6A3`, pale mint `#C8E6D0`
* **Fonts:** Playfair Display (headings), Quicksand (UI/labels)
* **Scrollbar:** Custom thin 6px, blush-to-milk-tea gradient
* **Responsive:** Scaled down at ≤640px (smaller tables, cards, tabs)

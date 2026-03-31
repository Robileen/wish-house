# Wish House – Gameplay Specs

## 1. Shift Overview

* Each shift represents a work session in the cafe.
* **20 customers per shift**, **12 required** to pass.
* 3 shifts available (First Shift, Afternoon Rush, Quiet Evening).
* Customers are seated at **6 circular tables** in a 2×3 grid (Table Zone).
* Each table gets **1–2 customers**, each customer has **1–3 orders**.
* Player clicks a table to take orders, then crafts dishes in the Craft View.
* **Mistake counter resets to 0 at the start of every shift** — each shift is fresh.
* Shifts end when:
  * Player clicks "End Shift" after completing 12+ successful dishes, or
  * Player accumulates **5 mistakes** in the current shift (forced end), or
  * Player quits (discards all tips earned).

**Shift Goal:** Serve 12 successful dishes to complete the shift and earn tips.

---

## 2. Currency — Buttons

* The game currency is **buttons**.
* Buttons are earned during shifts and **only saved on shift completion** (not on quit).
* Sources of buttons:
  * **+1 button** for each correctly served dish
  * **+1 button** for choosing the best response in customer chat dialogue
* Button counter displayed in:
  * **Journal page** — below the Memories progress bar
  * **Cafe HUD** — in the shift progress bar area
* Shift complete screen shows "Tips earned: X" summary.
* Quitting a shift via "Quit Shift" **discards all tips** earned during that shift.

---

## 3. Decoration Screen

After clicking "Start Shift", a Decoration Screen appears where the player picks a table style.

* **7 themes:** Wood, Marble, Ceramic, Terrazzo, Ocean, Stone, Clay
* Each theme has a unique tactile texture (grain, veins, speckle, chips, wash, layers, sand)
* Live preview table shows the selected texture
* Selection saved in `localStorage` and restored on next shift
* Table legs colour-match the selected theme

---

## 4. Table Zone (Cafe Room)

6 **circular tables** in a **2×3 grid** with barista zone at the bottom.

### Table Design

* Circular shape (170×170px, `border-radius: 50%`)
* Themed texture from Decoration Screen selection
* Two small wooden legs at the bottom, colour-matched

### Customer Seating

* Up to 3 tables populated at a time from the order queue.
* Each table randomly gets **1 or 2 customers** (40% chance of 2).
* Each customer randomly gets **1, 2, or 3 orders** (30% chance of multi-order).
* Customer avatars cycle through: 👤 🧑 👩 👨 👦 👧 🧓
* **Seats are dynamically placed** at random angles around the table edge
* **Only occupied seats are shown** — no empty seat outlines
* Minimum 60° angle separation between seats on the same table
* Seat positions cached per table (stable across re-renders)
* Speech bubbles float above tables showing all pending order icons.
  * Single order: icon + recipe name (e.g. "☕ House Blend")
  * Multiple orders: all icons + "3 orders"
  * **Pop-in animation only on first appearance** (not on re-render)

### Table States

| State | Visual | Interaction |
|-------|--------|-------------|
| **Empty** | Clean circular table, no customers | — |
| **Ordering** | Customer circle(s), speech bubble above | Click → Craft View |
| **Crafting** | Customers seated, no bubble | Player is in Craft View |
| **Served** | Food icon on table, pale mint border | Auto (0.8s) |
| **Eating** | Food icon, floating hearts animation | Auto (5s) |
| **Messy** | Wobbling 🧽 sponge emoji | Click → clean table |

### Interaction Flow

1. Customer appears at table with speech bubble
2. Player clicks table → enters Craft View
3. If table has multiple orders → Order Picker shown first
4. Player completes order → serve result screen shown
5. Player chooses next action (see Serve Result Buttons below)
6. All orders done → full delivery → eating (5s hearts) → messy
7. Player clicks sponge to clean → next customers seat

---

## 5. Craft View (Dish/Drink Mini Card Game)

### Order Banner (Top)

* Customer avatar, name, dialogue quote
* Recipe icon + name (auto-selected from order)
* **?** button → opens Recipe Book modal
* **Back to Tables** → returns to Table Zone

### Order Picker

* Shown when a table has **multiple orders**
* Cards showing recipe icon, name, customer avatar + name
* Player clicks an order to start crafting it
* Completed orders shown faded/disabled
* Single-order tables skip the picker

### Customer Chat (Papers Please style)

* **~60% chance** per order when crafting begins
* Random dialogue from a pool of 20 conversations
* Customer says a line, player chooses from **2 responses**
* Best response = **+1 button tip**
* Choice order randomized (best answer not always first)
* Correct answer: green (mint) highlight
* Wrong answer: faded dusty rose
* Auto-hides after 1.2s

### Ingredient Deck

* **All 31 non-special ingredients + wild card** shown, sorted **alphabetically**
* Filtered by **7 category tabs**:

| Tab | Ingredient Groups |
|-----|-------------------|
| **All** | Everything |
| **Bases** | Coffee, Tea, Milk, Flour, Bread, Rice, Matcha |
| **Produce** | Fruits (Apple, Banana, Blueberry, Cherry, Lemon, Strawberry) + Vegetables (Lettuce, Mushroom, Seaweed, Tomato) |
| **Toppings** | Caramel, Chocolate, Cinnamon, Cream, Honey + Sugar, Vanilla + Lavender |
| **Dairy & More** | Butter, Cheese + Egg + Oats |
| **Temp** | Hot, Cold |
| **Special** | Wild Card, Stardust, category cards, premade cards |

* Cards show emoji icon + ingredient name
* Multi-click on food cards (non-special, non-temp) with usage badge
* Single-use for special and temp cards
* Drag-and-drop support into slots
* Highlighted border on cards matching the current recipe

### Card Slots

* Auto-created based on recipe ingredient count
* Dashed border when empty (`+` placeholder)
* Green glow when correct ingredient placed
* **Ingredient order does NOT matter** — only presence counts
* Click a filled slot to remove ingredient
* **Revert button (↺)** beside slots — clears all at once

### FUSE Button

* Bottom center, fixed position
* Disabled (muted) until all slots filled
* Enabled: gold gradient, pulsing glow
* Triggers animation:
  * **Drinks:** "Brewing..." (☕✨)
  * **Food/Desserts:** "Fusing..." (🧙✨)

---

## 6. Serve Result Screen — Buttons

After FUSE, a result overlay shows the outcome. Buttons depend on success/failure and remaining orders:

### Success + More Orders at Table

| Button | Style | Action |
|--------|-------|--------|
| **Continue Next Order** | Pink (primary) | Shows order picker for remaining orders at same table |
| **Return to Tables** | Subtle (secondary) | Brief delivery, table returns to ordering with remaining orders |

### Success + Last/Only Order

| Button | Style | Action |
|--------|-------|--------|
| **Back to Tables** | Pink | Full delivery animation → eat → messy → clean |
| **Finish Shift** | Pink (if goal met + no more orders) | Goes to Shift Complete |

### Failure + More Orders at Table

| Button | Style | Action |
|--------|-------|--------|
| **Try Again?** | Gold (primary) | Re-opens same order with fresh ingredient slots |
| **Next Order** | Pink | Shows order picker to choose a different order at same table |
| **Return to Tables** | Subtle | Returns to table zone, ALL incomplete orders remain (including failed one) |

### Failure + Single Order

| Button | Style | Action |
|--------|-------|--------|
| **Try Again?** | Gold (primary) | Re-opens same order with fresh slots |
| **Return to Tables** | Subtle | Returns to table zone, failed order stays pending |

### Failure + 5 Mistakes (Forced End)

| Button | Style | Action |
|--------|-------|--------|
| **Continue** | Pink | Ends shift, goes to Shift Complete screen |

### Key Rules

* **Failed orders are NOT marked as completed** — they stay pending and retryable
* **"Return to Tables" always preserves incomplete orders** — customers stay, speech bubble shows remaining
* **"Try Again?" resets ingredient slots** but keeps the same order selected
* **"Next Order" on failure** skips delivery and goes straight to order picker

---

## 7. Special Cards

| Card Type | Function |
|-----------|----------|
| Wild Card 🃏 | Represents any single ingredient |
| Category Card | Represents any ingredient in a category (e.g., Any Fruit 🍊🃏) |
| Combination Card 🃏🃏 | Represents a fixed pair/trio of ingredients |
| Premade Dish/Drink Card | Automatically completes a dish without ingredients |

**Premade Cards Notes:**
* Unlockable after repeated successful use of a dish
* Limited per shift (e.g., 2 max)
* Visual: gold border, subtle sparkle effect

---

## 8. Shift Mistake System

* Mistakes do **not** block story progression.
* Mistakes affect **Shift Rating** and visual rewards.
* **Mistake counter resets to 0 at the start of every new shift.**
* Chapter 1 is explorative; mistake meter introduced Chapter 2.

### Mistake Meter (HUD)

| Mistakes | HUD Indicator | Notes |
|----------|---------------|-------|
| 0 | ✨ Sparkles | Perfect — no mistakes |
| 1 | ❓ (55% opacity) | Slight mistakes |
| 2 | ❓❓ (70% opacity) | |
| 3 | ❓❓❓ (85% opacity) | |
| 4 | ❓❓❓❓ (100% opacity) | |
| 5 | 💥 | **Shift forced to end** |

### At 5 Mistakes

* Serve result shows special dialogue:
  * Edward: "Uh boss… more practice?"
  * Kit: "Why?!"
* Button shows **"Continue"** (not "End Shift")
* Player is forced to end — goes straight to shift complete screen

### Barista Quips (Every Failure)

Random Edward dialogue on every failed serve (10 variations):
* "…our budget, boss… 😒"
* "That's coming out of our supplies…"
* "I'm not cleaning that up."
* "Maybe check the recipe book?"
* "…you sure about that one?"
* "The customers can see us, you know."
* "I'll pretend I didn't see that."
* "We're running low on ingredients…"
* "Deep breaths. Try again."
* "…that was creative, at least."

### Shift Complete Rating

| Mistakes | Rating |
|----------|--------|
| 0 | ✨✨✨ Perfect shift! |
| 1–2 | ✨✨ Great work! |
| 3–4 | ✨ Not bad! |
| 5+ | 💥 Rough shift... |

---

## 9. Gameplay Flow

```
1. Shift Intro → click "Start Shift"
2. Decoration Screen → pick table theme → click "Begin Shift"
3. Table Zone: 3 tables populated with 1-2 customers each
4. Player clicks a table with ordering customers
5. If multiple orders → Order Picker shown
6. Player selects an order → Craft View
7. Customer chat may appear (~60%) → 2 choices → best = +1 tip
8. Player fills ingredient slots from deck (any order)
9. Click FUSE → brew/conjure animation
10. Serve Result Screen:
    ├── Success + more orders:
    │   ├── "Continue Next Order" → order picker (same table)
    │   └── "Return to Tables" → brief delivery, table stays ordering
    ├── Success + last order:
    │   └── "Back to Tables" → full delivery → eat → messy → clean
    ├── Failure + more orders:
    │   ├── "Try Again?" → same order, fresh slots
    │   ├── "Next Order" → order picker (same table)
    │   └── "Return to Tables" → table stays ordering, all orders kept
    ├── Failure + single order:
    │   ├── "Try Again?" → same order, fresh slots
    │   └── "Return to Tables" → table stays ordering, order kept
    └── 5 mistakes → "Continue" → forced shift end
11. Clean table (click sponge) → next customers seat
12. Repeat until 12+ dishes served
13. Shift complete → rating + tips summary → saved to journal
```

---

## 10. Shift Strategy

* **No time pressure**, but:
  * 5 mistakes = forced shift end
  * Tips (buttons) only saved on completion, lost on quit
* Players can balance:
  * Completing dishes efficiently for buttons
  * Answering customer chat for bonus tips
  * Using the Recipe Book for reference
  * Using special/wild cards for difficult recipes

---

## 11. Recipe Book

* Opened via **?** button in craft view
* Book-style modal with leather cover, spine, two-page spread
* Shows **all 50 recipes** from `Assets/Data/CafeData/recipes/`
* 4 index tabs: Drinks, Food, Desserts, Specials
* 2 recipes per page, 4 per spread, with prev/next navigation
* Each recipe card shows: dish icon, name, subcategory, ingredient icons with names
* Auto-updates when new recipes added to JSON files
* See `RECIPE_BOOK.md` for full design spec

---

## 12. Visual & UI Notes

* **Style:** 2D, watercolour, gentle, Barbie My Scene
* **Palette:**
  * Base: Cream `#FFF8F0`, soft peach `#FDDCBA`, blush `#F4B8C1`
  * Anchors: Milk tea `#C8A882`, cocoa `#8B4513`, dusty rose `#C48B9F`
  * Accents: Gold `#D4A843`, soft yellow `#F5E6A3`, pale mint `#C8E6D0`
* **Fonts:** Playfair Display (headings), Quicksand (UI/labels)
* **Scrollbar:** Custom thin 6px, blush-to-milk-tea gradient
* **Responsive:** Scaled at ≤640px
* **Data:** All recipes, ingredients, shifts loaded from `Assets/Data/CafeData/` JSON files

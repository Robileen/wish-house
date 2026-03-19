# 🏠 Bake a Wish / Wish House – Gameplay Specs

## 1. Shift Overview

* Each shift represents a work session in the café.
* Customers arrive at tables; the player selects which order to process first.
* Waiter handles drinks; Magician handles food and desserts.
* Players prioritize orders: drink, food, dessert.
* Shifts end when:

  * Player chooses to end after completing **5 successful dishes**, or
  * All customers for the shift are served.

**Shift Goal:** Serve a minimum of 5 successful dishes to progress story interactions and unlock NPC dialogue.

---

## 2. Dish / Drink Mini Card Game

### Recipe Book

* Takes up **top half of screen**.
* Two pages, **2 dishes per page** (left/right).
* Each dish includes:

  * Dish Illustration (watercolour style, Barbie My Scene aesthetic)
  * Dish Name
  * Required ingredient cards (icons for ingredients, visually readable).
* Tabs:

  * Food
  * Drinks
  * Desserts
  * Special Cards

### Ingredient Deck

* **Bottom of screen**
* **Horizontal scroll row** with slight overlap for tactile feel.
* Scrollbar: faint watercolor style to indicate overflow.
* Cards:

  * Ingredients (fruits, bases, add-ons, temperature)
  * Special cards: Wild Card, Category Card, Combination Card, Premade Dish/Drink Card (new)
* Interaction:

  * Hover/tap lifts card
  * Drag to empty card slots
  * Glow highlights for correct ingredients

### Card Slots

* Placed **between recipe book and deck**
* Grey dented gradient slots hint at how many ingredients are required
* Slots highlight when correct cards are placed

### Fuse / Conjure Button

* Located bottom center, floating above deck
* Disabled until slots are filled
* Label: “FUSE” (or alternative: Conjure/Infuse)
* On click → Magician (food) or Barista (drink) animation plays

---

## 3. Special Cards

| Card Type               | Function                                                           |
| ----------------------- | ------------------------------------------------------------------ |
| Wild Card 🃏            | Represents any ingredient                                          |
| Category Card           | Represents any ingredient in a category (e.g., berries)            |
| Combination Card 🍰     | Represents a fixed pair/trio of ingredients                        |
| Premade Dish/Drink Card | Automatically completes a dish/drink without requiring ingredients |

**Premade Cards Notes:**

* Unlockable after repeated successful use of a dish.
* Limited per shift (e.g., 2 max per shift).
* Visual: gold border, subtle sparkle effect.
* Optional narrative commentary when used.

---

## 4. Shift Mistake System

* Mistakes do **not** block story progression.
* Mistakes affect **Shift Rating** and can unlock visual rewards.
* Shift mistake meter introduced **Chapter 2**; Chapter 1 is explorative.

### Mistake Meter

| Mistakes | Visual Indicator | Notes                                                                                       |
| -------- | ---------------- | ------------------------------------------------------------------------------------------- |
| 0        | ✨ Sparkles       | Perfect shift                                                                               |
| 1        | ? (1 faded)      | Slight mistakes                                                                             |
| 2        | ??               |                                                                                             |
| 3        | ???              |                                                                                             |
| 4        | ????             |                                                                                             |
| 5        | 💥               | Serve button allowed, dialogue appears: Waiter: “Uh boss… more practice?” Magician: “Why!?” |

* Player may **discard and redo** wrong dishes. Dialogue from waiter: “…our budget, boss… 😒”

* **Streaks of correct dishes** increase tolerance for mistakes (5, 10, 15 streaks).

---

## 5. Gameplay Flow

1. Customer orders appear at a table.
2. Player selects order: Food / Drink / Dessert.

   * **Drink:** Handled by Waiter
   * **Food/Dessert:** Handled by Magician
3. Player opens Recipe Book to view required ingredients.
4. Player selects ingredients from deck and places into card slots.
5. Click **FUSE** to prepare dish/drink.
6. Animation plays:

   * **Magician:** magic movements
   * **Barista:** slicing, steaming, stirring
7. Serve dish:

   * Correct → dish delivered, streaks & rating updated
   * Incorrect → dish can be redone or served with mistake dialogue
8. Story NPCs appear after ~5–6 dishes. Player may choose to interact to progress VN.

---

## 6. Shift Strategy

* **No time pressure**, but:

  * Mistakes reduce efficiency
  * Using **Premade Cards** can speed shift completion
* Players can balance:

  * Completing dishes efficiently
  * Interacting with Story NPCs
  * Experimenting with ingredients

---

## 7. Visual & UI Notes

* Style: 2D, watercolor, gentle, Barbie My Scene
* Palette:

  * **Base:** Cream, soft peach, blush
  * **Anchors:** Milk tea browns, cocoa, dusty rose
  * **Magical accents:** Gold, soft yellow, pale mint glow
  * **Ingredients:** Soft, recognizable colors (fruits, bases, add-ons, temperature)
* Deck: Horizontal scroll with slight overlap
* Recipe Book: Dish illustrations, ingredient icons in rows
* Card slots: Dent gray gradient
* Fuse button: Bottom center, glowing when ready


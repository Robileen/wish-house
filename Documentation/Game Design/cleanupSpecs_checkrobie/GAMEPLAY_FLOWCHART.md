Perfect — let’s extend your Markdown with a **Shift Flow Diagram** so the dev team can see the full progression from order to story interaction. I’ll keep it text-based, clean, and annotated.

Here’s the updated section to append to your Markdown:

---

## 9. Shift Flow Diagram

```id="shift_flow"
Start of Shift
      │
      ▼
Customer Orders Appear
      │
      ▼
Player Chooses Order Type
 ┌───────────────┬───────────────┐
 │               │               │
 ▼               ▼               ▼
Drink          Food/Dessert    Special (Story NPC)
 │               │               │
 │               │               │
 Waiter         Magician        Dialogue Trigger
 Handles        Handles
 Drink          Recipe Puzzle
 │               │
 │               ▼
 │        Open Recipe Book
 │        Select Ingredient Cards
 │        Place in Slots
 │        (Slots Highlight Correct Cards)
 │               │
 │               ▼
 │          Click FUSE
 │          ▼
 │      Animation Plays
 │  (Barista or Magician)
 │               │
 ▼               ▼
Serve Dish / Drink
 │
 │
Success? ──► Yes ──► Streak & Shift Rating Update
 │
No
 │
 ▼
Optional: Discard & Redo
 │
 ▼
Repeat for Next Order
 │
 ▼
Shift End Conditions
 ┌───────────────────────────────┐
 │  1. Player completes 5+       │
 │     successful dishes         │
 │  2. All customers served       │
 │  3. Player chooses to skip     │
 └───────────────────────────────┘
      │
      ▼
Story NPC Interaction / Chapter Progression
      │
      ▼
Shift Complete → Earnings & Reputation Updated
```

### 📝 Notes

1. **Player Choice & Freedom**

   * Player may interact with Story NPCs after ~5–6 dishes.
   * Can skip remaining orders to prioritize VN progress.
   * Earnings and streaks are kept even if shift is skipped.

2. **Mistake System Integration**

   * Mistakes feed into Shift Rating / Mistake Meter
   * Dialogue triggers appear when mistakes accumulate.
   * Maximum mistakes allowed per shift can be increased via streaks.

3. **Special Cards**

   * Can be used at any point to instantly complete a dish/drink.
   * Limited per shift to avoid imbalance.

4. **Visual Feedback**

   * Glow/highlight on correct ingredient placement.
   * Dish/drink animations for FUSE button feedback.
   * Shift ratings visualized with sparkles/question marks/explosions.

---

This flow chart now clearly communicates **every step of a shift**, from player choice → gameplay mechanics → story progression → shift end.

--- 
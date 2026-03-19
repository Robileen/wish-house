Perfect! Let’s extend your Markdown with a **wireframe/diagram section** using text-based illustrations so it’s easy to reference in the repo. I’ll also annotate key elements.

Here’s the updated Markdown spec including the visual layout:

---

# 🏠 Bake a Wish / Wish House – Gameplay Specs

*(Existing sections as above)*

---

## 8. UI / Wireframe Layout

This is a **2D watercolor-inspired wireframe** for the mini card game during a shift.
All elements are annotated for clarity.

```
┌───────────────────────────────────────────────┐
│               Recipe Book (Top)              │
│                                               │
│  ┌───────────────┐   ┌───────────────┐       │
│  │ Dish Img 🥘    │   │ Dish Img 🥗    │       │
│  │ Honey Matcha  │   │ Berry Salad    │       │
│  │ Cake           │   │               │       │
│  │ 🌁 🌌 🌅 🎇     │   │ 🌁 🎇          │       │
│  └───────────────┘   └───────────────┘       │
│                                               │
│  Tabs: [ Food ] [ Drinks ] [ Desserts ] [ Specials ] │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│             Ingredient Slots (Middle)        │
│                                               │
│  [ + ] [ + ] [ + ] [ + ]                      │
│  → Number of slots = ingredients required    │
│  → Slots highlight when correct cards placed │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│             Ingredient Deck (Bottom)         │
│                                               │
│  ◀ 🍓 🍫 ☕ 🥛 🍯 🍒 🍞 🧈 ▶                     │
│  → Horizontal scroll with faint scrollbar     │
│  → Slight overlap between cards               │
│  → Hover/tap lifts card + glow               │
│  → Includes special cards: Wild, Category,   │
│    Combination, Premade Dish/Drink           │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                 Fuse Button                   │
│                                               │
│                ✨ FUSE ✨                      │
│  → Glows when slots filled                    │
│  → Animations: Magician (food), Barista (drink) │
└───────────────────────────────────────────────┘
```

### 📝 Notes

1. **Recipe Book**

   * Two-page layout (left/right)
   * Two dishes per page
   * Ingredient icons in row for clarity

2. **Ingredient Deck**

   * Horizontal scroll row
   * Slight overlap for tactile feel
   * Faint watercolor scrollbar
   * Edge fade hint for extra cards

3. **Ingredient Slots**

   * Between recipe book and deck
   * Number of slots = ingredients required
   * Visual highlight when correct card placed

4. **Fuse Button**

   * Bottom center
   * Disabled until slots filled
   * Triggers animations
   * Label can toggle: “FUSE” / “CONJURE”

5. **Special Cards**

   * Include: Wild, Category, Combination, Premade Dish/Drink
   * Premade cards complete dish instantly, limited per shift
   * Gold border / subtle sparkles for visibility

---

This **diagram + notes** gives a clear, visual reference for the gameplay layout while maintaining your **watercolor, gentle, Barbie My Scene aesthetic**.

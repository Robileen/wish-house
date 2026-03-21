
# Recipe Book

## Overview

The Recipe Book is a modal overlay opened via the italic **?** button in the craft view order banner. It displays **all recipes** loaded from `Assets/Data/CafeData/recipes/` (drinks, food, desserts, specials), automatically updating whenever new recipes are added to those JSON files.

## Layout

* **Book-style modal** — leather cover with spine, cream interior pages
* **Two-page spread** — left page and right page side by side
* **2 dishes per page**, 4 per spread
* **Prev / Next pagination** with page indicator (e.g. "3 / 5")
* **Ribbon bookmark tabs** on the right edge for category switching

```
┌──────────────────────────────────────────────────────┐
│ [x]                                                   │
│ ╔══╦══════════════════════════════════════════╗ ┌───┐ │
│ ║▌▌║                                          ║ │ ☕│ │
│ ║▌▌║  ┌─────────────┐  │  ┌─────────────┐    ║ │DRK│ │
│ ║▌▌║  │   🥘         │  │  │   🥗         │    ║ └─V─┘ │
│ ║▌▌║  │ Honey Matcha │  │  │ Berry Salad  │    ║ ┌───┐ │
│ ║▌▌║  │    Cake      │  │  │              │    ║ │ 🍚│ │
│ ║▌▌║  │  COFFEE      │  │  │  BREAD       │    ║ │FOD│ │
│ ║▌▌║  │ ☕ 🍯 🌵 🥛   │  │  │ 🍞 🍯        │    ║ └─V─┘ │
│ ║▌▌║  └─────────────┘  │  └─────────────┘    ║ ┌───┐ │
│ ║▌▌║                    │                      ║ │ 🍰│ │
│ ║▌▌║  ┌─────────────┐  │  ┌─────────────┐    ║ │DST│ │
│ ║▌▌║  │   ☕         │  │  │   🍵         │    ║ └─V─┘ │
│ ║▌▌║  │ House Blend  │  │  │ Chai Latte   │    ║ ┌───┐ │
│ ║▌▌║  │ ☕ 🔥         │  │  │ 🍵 🥛 🌰     │    ║ │ ✨│ │
│ ║▌▌║  └─────────────┘  │  └─────────────┘    ║ │SPC│ │
│ ║▌▌║                    │                      ║ └─V─┘ │
│ ║▌▌║              « 1 / 5 »                   ║       │
│ ╚══╩══════════════════════════════════════════╝       │
└──────────────────────────────────────────────────────┘
```

## Recipe Card

Each dish entry on a page includes:

| Element | Description |
|---------|-------------|
| **Dish Icon** | Large emoji (2.6rem) with drop-shadow, watercolour feel |
| **Dish Name** | Playfair Display serif, 0.82rem, cocoa brown |
| **Subcategory** | Quicksand uppercase label in dusty rose (e.g. "Coffee", "Bread", "Cakes") — derived from compound category like `drink-coffee` |
| **Ingredient Icons** | Row of circular badges (24px) showing each required ingredient emoji with tooltip on hover |

Cards have a subtle gradient background (`#FFF8F0` to soft peach), rounded corners, and lift with shadow on hover.

## Bookmark Tabs

Four colourful ribbon bookmarks on the **right edge** of the book, each with a V-cut pointed bottom (`clip-path: polygon`):

| Tab | Colour | Emoji | Matches Category |
|-----|--------|-------|------------------|
| **Drinks** | Soft blue (`#B8D4E3` → `#8CB4CE`) | ☕ | `drink-*` |
| **Food** | Warm peach (`#F5CBA7` → `#E8A87C`) | 🍚 | `food-*` |
| **Desserts** | Pink (`#F4B8C1` → `#E091A3`) | 🍰 | `dessert-*` |
| **Specials** | Lavender (`#D4C5F9` → `#B8A4E8`) | ✨ | `specials-*` |

* White text + emoji on coloured gradient background
* Active bookmark slides out further right with brighter gradient and stronger shadow
* Hover on inactive bookmarks slides them out slightly
* Uppercase label below emoji icon

## Book Design

| Element | Style |
|---------|-------|
| **Cover** | Leather brown gradient (`#D4A060` → `#C8946A` → `#B8845A`), rounded left corners |
| **Spine** | Darker brown strip on the left (`#A07040` → `#8B5E3C`), 8px wide with inset shadow |
| **Pages** | Cream `#FFF8F0` with subtle watercolour texture (radial gradients of peach and pink) |
| **Left page** | Gradient `#FFFAF5` → `#FFF8F0`, right border divider |
| **Right page** | Gradient `#FFF8F0` → `#FFFAF5` |
| **Close button** | Dusty rose circle (top-right), white × icon, scales on hover |
| **Pagination** | Bottom bar with « » buttons (gold on hover) and page indicator |
| **Backdrop** | Dark overlay with 2px blur |

## Data Source

Recipes are loaded at startup by `cafe-data.js` from:

```
Assets/Data/CafeData/recipes/
├── drinks.json       ← All drink recipes
├── food.json         ← All food recipes
├── desserts.json     ← All dessert recipes
└── specials.json     ← All special recipes
```

The recipe book reads directly from the global `RECIPES` dictionary (`Object.values(RECIPES)`), filtered by `category.startsWith(activeTab)` and sorted alphabetically. **Adding a new recipe to any of the above JSON files will automatically include it in the recipe book** — no code changes needed.

## Visual & UI Notes

* Style: 2D, watercolour, gentle, Barbie My Scene
* Palette:
  * **Base:** Cream, soft peach, blush
  * **Anchors:** Milk tea browns, cocoa, dusty rose
  * **Magical accents:** Gold, soft yellow, pale mint glow
  * **Ingredients:** Soft, recognizable colours (fruits, bases, add-ons, temperature)
* Recipe cards: Dish emoji illustrations, ingredient icons in rows
* Responsive: Smaller tabs and cards on mobile (≤640px)


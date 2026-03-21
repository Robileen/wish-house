
# Recipe Book

## Overview

The Recipe Book is a modal overlay opened via the italic **?** button in the craft view order banner. It displays **all recipes** loaded from `Assets/Data/CafeData/recipes/` (drinks, food, desserts, specials), automatically updating whenever new recipes are added to those JSON files.

## Layout

* **Book-style modal** — leather cover with spine, cream interior pages
* **Fixed size** — 60vh height (max 420px, min 320px) so the book never resizes between pages
* **Two-page spread** — left page and right page side by side, recipes pinned to top
* **2 dishes per page**, 4 per spread
* **Faded page arrows** on the left and right sides of the book for navigation
* **Index tabs** on the right edge for category switching
* **Page indicator** (e.g. "1 / 5") at the bottom of the index tabs column

```
                                                           ┌──────────┐
  [x]                                                      │ ☕ Drinks │
╔══╦══════════════════════════════════════════════╗         ├──────────┤
║▌▌║                                              ║         │ 🍚 Food  │
║▌▌║     Coffee, Tea              Chocolate       ║         ├──────────┤
║▌▌║  ┌─────────────┐  │  ┌─────────────┐        ║         │ 🍰 Desst │
║▌▌║  │   🥘         │  │  │   ☕         │        ║         ├──────────┤
║▌▌║  │ Honey Matcha │  │  │ Hot         │        ║         │ ✨ Spec  │
║▌▌║  │    Cake      │  │  │ Chocolate   │        ║         │          │
║▌▌║  │  COFFEE      │  │  │  CHOCOLATE  │        ║         │          │
║▌▌║  │ ☕    🍯    🥛 │  │  │ 🍫    🥛    │        ║         │          │
║▌▌║  │Coffee Honey  │  │  │Choco  Milk  │        ║         │          │
║▌▌║  │      Milk    │  │  │             │        ║         │          │
║▌▌║  └─────────────┘  │  └─────────────┘        ║         │          │
║▌▌║                    │                          ║         │          │
║▌▌║  ┌─────────────┐  │  ┌─────────────┐        ║         │          │
║▌▌║  │   🍵         │  │  │   🍵         │        ║         │          │
║▌▌║  │ Chai Latte   │  │  │ Matcha      │        ║         │          │
║▌▌║  │ 🍵  🥛  🌰   │  │  │ Latte       │        ║         │          │
║▌▌║  │Tea Milk Cinn │  │  │ 🌵  🥛       │        ║         │          │
║▌▌║  └─────────────┘  │  │Matcha Milk   │        ║         │          │
║▌▌║                    │  └─────────────┘        ║         │          │
‹ ║▌▌║                    │                          ║ ›       │  1 / 5   │
╚══╩══════════════════════════════════════════════╝         └──────────┘
```

## Recipe Card

Each dish entry on a page includes:

| Element | Description |
|---------|-------------|
| **Dish Icon** | Large emoji (2.6rem) with drop-shadow, watercolour feel |
| **Dish Name** | Playfair Display serif, 0.82rem, cocoa brown |
| **Subcategory** | Quicksand uppercase label in dusty rose (e.g. "Coffee", "Bread", "Cakes") — derived from compound category like `drink-coffee` |
| **Ingredient Icons + Names** | Row of circular badges (26px) showing each required ingredient emoji, with the ingredient name in small text below each icon (0.42rem Quicksand) |

Cards have a subtle gradient background (`#FFF8F0` to soft peach), rounded corners, and lift with shadow on hover.

## Page Headers

Each page displays a **subcategory header** at the top showing only the subcategories of recipes on that page (e.g. "Coffee, Tea" or "Porridge, Rice"). The main category name is not shown since it's already indicated by the active tab.

## Index Tabs

Four index-style divider tabs on the **right edge** of the book, with semicircular right-rounded shape:

| Tab | Edge Colour | Emoji | Matches Category |
|-----|-------------|-------|------------------|
| **Drinks** | Blue `#7BAFD4` | ☕ | `drink-*` |
| **Food** | Peach `#E8A87C` | 🍚 | `food-*` |
| **Desserts** | Pink `#E091A3` | 🍰 | `dessert-*` |
| **Specials** | Lavender `#B8A4E8` | ✨ | `specials-*` |

* Parchment background (`#F0E6D6`) with coloured left-edge strip per category
* Emoji + label side by side horizontally
* Active tab: white background (`#FFF8F0`), category-coloured text, slides out 6px, thicker edge strip
* Hover on inactive tabs slides them out 3px
* Tightly stacked with 2px gap like real binder dividers
* **Page indicator** (e.g. "1 / 5") shown in white bold text at the bottom of the tabs column

## Pagination

* **Faded arrows** (`‹` and `›`) positioned as overlays on the left and right edges of the book content area
* Semi-transparent (50% opacity), darken to 85% on hover
* Hidden (15% opacity) when there's no page to turn to
* No bottom pagination bar inside the book

## Book Design

| Element | Style |
|---------|-------|
| **Cover** | Leather brown gradient (`#D4A060` → `#C8946A` → `#B8845A`), rounded left corners |
| **Spine** | Darker brown strip on the left (`#A07040` → `#8B5E3C`), 8px wide with inset shadow |
| **Pages** | Cream `#FFF8F0` with subtle watercolour texture (radial gradients of peach and pink) |
| **Left page** | Gradient `#FFFAF5` → `#FFF8F0`, right border divider |
| **Right page** | Gradient `#FFF8F0` → `#FFFAF5` |
| **Close button** | Dusty rose circle (top-right), white × icon, scales on hover |
| **Backdrop** | Dark overlay (`rgba(74,55,40,0.4)`) with 2px blur |
| **Fixed size** | 60vh height, max 420px, min 320px — never resizes between pages |
| **Scrollbar** | Custom thin (6px) blush-to-milk-tea gradient, matching game palette |

## Data Source

Recipes are loaded at startup by `cafe-data.js` from:

```
Assets/Data/CafeData/recipes/
├── drinks.json       ← All drink recipes
├── food.json         ← All food recipes
├── desserts.json     ← All dessert recipes
└── specials.json     ← All special recipes
```

The recipe book reads directly from the global `RECIPES` dictionary (`Object.values(RECIPES)`), filtered by `category.startsWith(activeTab)`, sorted by subcategory then alphabetically by name. **Adding a new recipe to any of the above JSON files will automatically include it in the recipe book** — no code changes needed.

## Visual & UI Notes

* Style: 2D, watercolour, gentle, Barbie My Scene
* Palette:
  * **Base:** Cream, soft peach, blush
  * **Anchors:** Milk tea browns, cocoa, dusty rose
  * **Magical accents:** Gold, soft yellow, pale mint glow
  * **Ingredients:** Soft, recognizable colours (fruits, bases, add-ons, temperature)
* Recipe cards: Dish emoji illustrations, ingredient icons with names in rows
* Responsive: Smaller tabs and cards on mobile (≤640px)

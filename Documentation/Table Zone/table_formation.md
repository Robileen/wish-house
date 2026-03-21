
# Cafe Room — Table Formation & Zone Spec

## Room Layout

6 tables in a **2×3 grid** with a barista/magician zone at the bottom. Vertical gap of 52px between rows to accommodate speech bubbles floating above tables.

```
─────────────────────────────── Cafe Room ───────────────────────────────
|                                                                         |
|        💬 Order           💬 Order                                      |
|   [Table 1]       [Table 2]       [Table 3]                            |
|   ┌─────────┐     ┌─────────┐     ┌─────────┐                          |
|   │ 👩  ·   │     │ 👨  ·   │     │  ·   ·  │                          |
|   │   🍽    │     │   🍽    │     │   🍽    │                          |
|   │ Overlay │     │ Overlay │     │ Overlay │                          |
|   └─────────┘     └─────────┘     └─────────┘                          |
|                                                                         |
|   [Table 4]       [Table 5]       [Table 6]                            |
|   ┌─────────┐     ┌─────────┐     ┌─────────┐                          |
|   │  ·   ·  │     │ 🧓  ·   │     │  ·   ·  │                          |
|   │   🍽    │     │   🍽    │     │   🍽    │                          |
|   │ Overlay │     │ Overlay │     │ Overlay │                          |
|   └─────────┘     └─────────┘     └─────────┘                          |
|                                                                         |
|                    ☕ M & B (Barista/Magician Zone)                      |
──────────────────────────────────────────────────────────────────────────
```

## Legend

| Symbol | Meaning |
|--------|---------|
| `[Table X]` | Table module (160×110px), pastel watercolour gradient |
| `👩 / 👨 / 🧓` | Customer avatar in seat A (left seat) |
| `·` | Empty seat (dashed border) |
| `🍽` | Food slot — center of table, shows dish icon when served |
| `💬` | Speech bubble — floats above table with recipe icon + name |
| `Overlay` | Glow / hearts / animation layer |
| `☕ M & B` | Barista/Magician zone — bottom bar with sprite |
| `🧽` | Sponge emoji on messy tables — click to clean |

## Table Module Structure

Each table contains:

```html
<div class="cafe-table" data-table="1">
    <div class="table-surface">
        <div class="seat seat-a"></div>     <!-- Left seat -->
        <div class="seat seat-b"></div>     <!-- Right seat -->
        <div class="food-slot"></div>       <!-- Center, for served dish -->
        <div class="table-overlay"></div>   <!-- Glow/hearts layer -->
    </div>
    <div class="table-label">Table 1</div>
</div>
```

* **Seats**: Seat A always left, Seat B always right (from player perspective)
* **Food Slot**: Center-top of table; displays dish emoji when served, sponge when messy
* **Overlay**: Same position as food slot; glow/hearts animations appear here

## Table States

| State | Customer | Food Slot | Overlay | Seat A | Click Action |
|-------|----------|-----------|---------|--------|--------------|
| **Empty** | — | — | — | Dashed border | — |
| **Ordering** | Avatar shown | — | — | Occupied (pink bg) | → Craft View |
| **Crafting** | Avatar shown | — | — | Occupied | — (player in Craft View) |
| **Served** | Avatar shown | Recipe icon | Green glow | Occupied | Auto-advances |
| **Eating** | Avatar shown | Recipe icon | Floating hearts | Occupied | Auto-advances |
| **Messy** | Gone | Wobbling 🧽 | — | Empty | Click → clean table |

### State Transitions

```
ordering → crafting → served → eating → messy → (cleaned) → empty
                                                      ↓
                                              seatNextCustomers()
```

## Speech Bubbles

* Appended to `.cafe-table` (not inside `.table-surface`) so they float above
* Positioned: `bottom: calc(100% + 8px)`, centered with `left: 50%; translateX(-50%)`
* V-shaped tail pointing down (via `::before` gold border + `::after` white fill)
* Content: `<span class="bubble-icon">☕</span> House Blend` or dialogue text
* Pop-in animation: `translateX(-50%) scale(0)` → `scale(1)`
* Removed when table state changes

## Sponge Cleanup

* When a table enters **messy** state, the food slot shows a wobbling 🧽 sponge emoji
* Sponge has a CSS wobble animation (`rotate ±8deg`) to draw attention
* Scales up with pink drop-shadow on hover
* Clicking anywhere on the messy table (including the sponge) triggers `cleanTable()`
* No separate "Clean" button — the sponge IS the button

## Delivery Animation Sequence

After FUSE + serve result, returning to the Table Zone triggers:

1. **Barista slides** — sprite bounces up/down animation (0.6s)
2. **Food placed** — table state → "served", recipe icon appears in food slot with scale-in animation, green glow overlay
3. **Customer eating** (0.8s) — state → "eating", floating hearts animation overlay
4. **Customer leaves** (1.2s) — state → "messy", customer disappears, sponge appears
5. **Player cleans** — click sponge → `delete table`, `seatNextCustomers()`

Failed dishes skip steps 2-3 and go directly to messy state.

## Customer Seating

* `seatNextCustomers()` seats up to 3 customers at random empty tables from the order queue
* Called at shift start and after each table cleanup
* Avatars cycle through: 👤 🧑 👩 👨 👦 👧 🧓
* When queue is empty and all tables are clear, shift completion is checked

## Barista / Magician Zone

* Bottom bar with gradient background
* Sprite: 48px circle with peach/blush gradient, ☕ emoji
* Slide animation on delivery (bounce up/down)
* Label: "M & B" in Playfair Display

## Visual Notes

* **Tables**: Rectangular (160×110px), pastel watercolour gradient (`#FFF8F0` → `#FDDCBA` → `#F5E6C8`), 2px border, 12px rounded corners
* **Customers**: Emoji avatars in seat A (left), front-facing
* **Effects**: Separate overlay layer for glow, hearts, animations
* **Responsive**: Tables shrink to 120×85px, seats to 30×40px at ≤640px
* **Row gap**: 52px (40px on mobile) to accommodate speech bubbles
* **Hover**: Tables lift 3px on hover; ordering tables have gold pulse animation

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.cafe-table` | Table wrapper, `position: relative` |
| `.table-surface` | Visual table rectangle |
| `.seat.seat-a` / `.seat-b` | Left/right seat positions |
| `.seat.occupied` | Pink background, solid border |
| `.seat.empty` | Dashed border, transparent |
| `.food-slot` | Center food placement |
| `.food-slot.has-food` | Shows dish icon with border |
| `.food-slot.clickable` | Wobbling sponge, cursor pointer |
| `.table-overlay.glow` | Green radial glow |
| `.table-overlay.hearts` | Floating heart animation |
| `.table-order-bubble` | Speech bubble with tail |
| `.has-customer` | Gold pulse animation on table |
| `.served` | Pale mint border on surface |
| `.messy` | Dusty rose border, 70% opacity |

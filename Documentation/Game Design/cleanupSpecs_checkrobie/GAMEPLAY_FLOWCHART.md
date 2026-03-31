# Wish House – Shift Flow Diagram

## Complete Shift Flow

```
Start of Shift
      │
      ▼
Shift Intro Screen
  "Shift 1 — Your first day!"
  [Start Shift]
      │
      ▼
Decoration Screen
  "Decorate Your Cafe"
  Pick table theme: Wood | Marble | Ceramic | Terrazzo | Ocean | Stone | Clay
  [Begin Shift]
      │
      ▼
Table Zone (6 circular tables, 2×3 grid)
  ├── Up to 3 tables populated with 1-2 customers each
  ├── Speech bubbles show pending order icons
  └── Player clicks a table with ordering customers
          │
          ▼
    ┌─── Multiple orders at table? ───┐
    │ YES                              │ NO
    ▼                                  ▼
Order Picker                     Craft View
  Select which order               (single order
  to work on                        auto-selected)
    │                                  │
    └──────────┬───────────────────────┘
               ▼
         Craft View
    ┌─────────────────────────────┐
    │ Customer chat (~60% chance) │
    │  → 2 choices, best = +1 tip│
    ├─────────────────────────────┤
    │ Fill ingredient slots       │
    │ from deck (any order)       │
    ├─────────────────────────────┤
    │ Click FUSE                  │
    │ → Brew/Conjure animation    │
    └─────────────────────────────┘
               │
               ▼
      ┌── Recipe Correct? ──┐
      │ YES                  │ NO
      ▼                      ▼
  +1 success              +1 mistake
  +1 button               streak reset
  +1 streak               Edward quip
      │                      │
      ▼                      ▼
  ╔════════════╗        ╔════════════╗
  ║  SUCCESS   ║        ║  FAILURE   ║
  ║  SCREEN    ║        ║  SCREEN    ║
  ╚════════════╝        ╚════════════╝
      │                      │
      │                      ├── 5 mistakes?
      │                      │   YES → [Continue] → Shift Complete (forced end)
      │                      │
      │                      ├── Table has more orders?
      │                      │   YES:
      │                      │     [Try Again?] → same order, fresh slots ──→ Craft View
      │                      │     [Next Order] → order picker ──→ Craft View
      │                      │     [Return to Tables] → table stays ordering ──→ Table Zone
      │                      │
      │                      └── Single order:
      │                          [Try Again?] → same order, fresh slots ──→ Craft View
      │                          [Return to Tables] → table stays ordering ──→ Table Zone
      │
      ├── Table has more orders?
      │   YES:
      │     [Continue Next Order] → delivery → order picker ──→ Craft View
      │     [Return to Tables] → brief delivery → table stays ordering ──→ Table Zone
      │
      └── Last/only order:
          [Back to Tables] → full delivery animation ──→ Table Zone
          [Finish Shift] (if goal met) → Shift Complete
                │
                ▼
          Delivery Animation
            Barista slides → food on table → glow
            → hearts (5s) → customer leaves → messy
                │
                ▼
          Messy Table
            🧽 wobbling sponge
            Click to clean
                │
                ▼
          Table cleaned → next customers seat
                │
                ▼
          ┌── More customers in queue? ──┐
          │ YES                           │ NO
          ▼                               ▼
    Back to Table Zone             ┌── Goal met? ──┐
    (new customers seated)         │ YES            │ NO
                                   ▼                ▼
                              Shift Complete    Continue
                                                (wait for
                                                 cleanup)
```

---

## Serve Result — Button Matrix

```
┌─────────────────────┬─────────────────────┬─────────────────────────────┐
│ Outcome             │ Table Orders        │ Buttons Shown               │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ SUCCESS             │ More orders remain  │ [Continue Next Order]       │
│                     │                     │ [Return to Tables]          │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ SUCCESS             │ Last/only order     │ [Back to Tables]            │
│                     │                     │  or [Finish Shift]          │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ FAILURE             │ More orders remain  │ [Try Again?]                │
│                     │                     │ [Next Order]                │
│                     │                     │ [Return to Tables]          │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ FAILURE             │ Single order        │ [Try Again?]                │
│                     │                     │ [Return to Tables]          │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ FAILURE (5 mistakes)│ Any                 │ [Continue] → forced end     │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

---

## Key Rules

1. **Failed orders stay pending** — not marked complete, retryable at any time
2. **"Return to Tables" preserves all incomplete orders** — customers stay seated
3. **Mistake counter resets to 0 every new shift** — each shift is independent
4. **Tips (buttons) only saved on shift completion** — lost if player quits
5. **No time pressure** — player can take as long as needed
6. **5 mistakes = forced shift end** — no retry, goes to Shift Complete

---

*Last Updated: 2026-03-31*

# UI Snapshots

## How to Use

Open `wireframes.html` in your browser to see visual mockups of every game screen. Screenshot each section to save as images.

```bash
# From the project root
open "Documentation/UI Snapshots/wireframes.html"
# or
python3 -m http.server 8000
# then visit http://localhost:8000/Documentation/UI%20Snapshots/wireframes.html
```

## Screens Included

1. **Journal (Main Menu)** — Two-page book with chapter info, episode list, button counter
2. **Shift Intro** — Full-screen overlay with shift name, description, goal
3. **Table Zone** — 6-table grid with customers, speech bubbles, barista zone, HUD
4. **Craft View** — Order banner, customer chat dialogue, ingredient slots, deck tabs, FUSE
5. **Recipe Book** — Leather book modal with two-page spread, index tabs, recipe cards
6. **Serve Result** — Success / Failure / 5-mistake forced end variants
7. **Shift Complete** — Rating, dishes served, streak, tips earned

## Notes

- Uses the same colour palette and fonts as the game (Quicksand, Playfair Display)
- Mobile-width frames (9:16 aspect ratio) matching the game container
- Standalone HTML — no external dependencies except Google Fonts

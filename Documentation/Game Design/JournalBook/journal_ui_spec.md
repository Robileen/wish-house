# Washi Tape Chapters UI Design

This document summarizes the UI design concepts for the "Wish House" visual novel / service game, focusing on the **Washi Tape Chapters Journal** system. It is intended to guide implementation using C#, HTML/CSS/JS.

---

## 1. Journal Structure

* **Chapter**: Each chapter represents a location (e.g., Café, Library, Beach). Each chapter lasts **10 days**.
* **Daily Shift Pages**: Each day of the chapter has a dedicated page.
* **Shifts per Day**: Each day is divided into **Morning, Afternoon, Evening shifts**.

### Hierarchy

```
Chapter (Location)
 └─ Day 1
     ├─ Morning Shift
     ├─ Afternoon Shift
     └─ Evening Shift
 └─ Day 2
 ...
 └─ Day 10
```

---

## 2. Washi Tape Timeline
- every chapter has 8 episodes.
- each chapter has 4 shifts in 1 of the 8 episodes. for now you can randomize to mark an episode as a Shift based on the [shiftId](../../../Assets/Resources/DialogueFiles/Chapter1/chapter1_episodelist_spec.json) . if ShiftId shows a number. then that means its a VN and cafe game.

### Visual Elements

* **Faded NPC sketch** on tape (watercolor style)
* **Magician presence**: subtle magical sparkles or glow overlay on tape
* **Scrapbook decoration**: stickers, paperclips, pressed flowers, soft watercolor textures

### Interactivity
* Tapping a tape opens the VN scene / event / game.
* Tape may show **incomplete outlines** if not yet unlocked.
* Optional: animation for tape peel when opening an event.
---

## 3. 10-Day Chapter Layout

* **Tabs or headers** for each day (Day 1–Day 10) for quick navigation.
* Each daily page shows all shifts and their respective tapes.
* Completed days can show **memory completion progress**: e.g., "3/5 Memories Collected".
* End of chapter shows summary:

  * Total memories unlocked
  * Customer satisfaction / success rating
  * Optional celebratory illustration

---

## 6. Visual / Art Style

* **2D, watercolor textures, pastel tones, My Scene / Barbie cartoon style**.
* Journals have realistic scrapbook feel with subtle textures.
* NPC sketches are faded to simulate memory impression.
* Magical effects are soft glows, sparkles, or small animated flourishes.

---

## 7. Gameplay Integration

* **Daily Goals**: Serve all orders, handle special requests, trigger magician interactions.
* **Chapter Goals**: By Day 10, maximize customer satisfaction, unlock all memories.
* **Replayable Shifts**: Completed days move to Memory Album; players can replay shifts to collect missing memories or see alternate endings.
* **Timeline consistency**: Each shift page maintains chronological order with tapes representing events.

---

## 8. Suggested Implementation Notes

* **HTML/CSS/JS**:

  * Use **flexbox / grid** for timeline layout.
  * Washed / faded images for NPC sketches (opacity / overlay).
  * Animate tapes with **CSS transitions** for peel effect.
* **C# / Unity**:

  * Use scrollable UI panels for journal pages.
  * Prefabs for tapes, memory icons, magician effects.
  * Scripted VN events triggered by tape selection.
* Ensure **modular design**: days, shifts, tapes, and fragments are data-driven to allow easy updates.

---

**End of Washi Tape Chapters UI Design**

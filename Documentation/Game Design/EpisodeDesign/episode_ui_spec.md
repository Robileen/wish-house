# Episode UI Design Spec

This document describes the visual-novel episode player UI for **Wish House**. It covers every screen, component, animation, and interaction the player encounters from the moment they tap an episode in the Journal Book through to the episode-complete screen. Intended to guide implementation in HTML/CSS/JS (web demo) and C#/Unity.

---

## 1. Episode Flow Overview

```
Journal Book
  └─ Tap episode strip
       └─ Title Card Screen
            └─ "Begin" button
                 └─ VN Player (dialogue + choices)
                      ├─ Skip Story → Episode Complete
                      └─ Dialogue ends → Episode Complete
                           ├─ "Back to Journal" → Journal Book
                           └─ "Replay Episode" → Title Card
```

---

## 2. Game Container

| Property        | Value                                |
|-----------------|--------------------------------------|
| Width           | `900px` (max `95vw`)                 |
| Height          | `600px` (max `90vh`)                 |
| Border-radius   | `16px`                               |
| Background      | `var(--warm-white)` / `#FFF5EB`      |
| Box-shadow      | `0 8px 32px var(--shadow), 0 2px 8px rgba(0,0,0,0.08)` |
| Overflow        | `hidden`                             |

### Mobile (viewport ≤ 640 px)

Container becomes full-screen: `100vw × 100vh`, `border-radius: 0`.

---

## 3. Colour Palette (CSS Custom Properties)

```css
--cream:        #FFF8F0
--soft-peach:   #FDDCBA
--blush:        #F4B8C1
--milk-tea:     #C8A882
--cocoa:        #8B4513
--dusty-rose:   #C48B9F
--gold:         #D4A843
--soft-yellow:  #F5E6A3
--pale-mint:    #C8E6D0
--warm-white:   #FFF5EB
--text-dark:    #4A3728
--text-light:   #7A6455
--shadow:       rgba(74, 55, 40, 0.15)
```

---

## 4. Typography

| Role              | Family                  | Weight  | Size     | Notes                    |
|-------------------|-------------------------|---------|----------|--------------------------|
| Headings / titles | Playfair Display, serif | 400/700 | 2–3 rem  | Italic for episode names |
| Body / UI         | Quicksand, sans-serif   | 400–700 | 0.75–1.1 rem | Primary UI font       |
| Speaker name      | Playfair Display        | 700     | 1.05 rem | Colour per character     |
| Dialogue text     | Quicksand               | 400     | 1 rem    | `line-height: 1.65`     |

---

## 5. Title Card Screen

Shown immediately when the player taps an episode in the Journal.

| Element           | Details                                                                                       |
|-------------------|-----------------------------------------------------------------------------------------------|
| Background        | Vertical gradient: `cream → soft-peach (60%) → blush`                                         |
| Title `<h1>`      | "Wish House" — Playfair Display, `3rem`, `var(--cocoa)`, text-shadow `0 2px 4px var(--shadow)` |
| Subtitle          | Chapter label (e.g. "Chapter 1") — Quicksand `1rem`, `var(--dusty-rose)`, weight 500          |
| Episode title     | Playfair Display italic, `1.3rem`, `var(--gold)`, bottom margin `2rem`                        |
| **Begin button**  | Pill shape (`border-radius: 30px`), `14px 48px` padding, gradient `dusty-rose → blush`, white text, Quicksand 600 |
| Begin hover       | `translateY(-2px)`, amplified box-shadow                                                      |
| Transition out    | `opacity 0.8s ease` → becomes `opacity: 0; pointer-events: none` (class `.hidden`)            |
| z-index           | `100` (sits above the scene layer)                                                            |

---

## 6. Scene Area (VN Player)

### 6.1 Background

- Fills entire container (`position: absolute; inset: 0`)
- Gradient: `cream → soft-peach (70%) → blush` (vertical)
- Placeholder icon layer at `opacity: 0.15`, centred, `6rem` font-size, non-interactive

### 6.2 Character Sprites

Two fixed slots: **left** and **right**.

| Property          | Value                                                             |
|-------------------|-------------------------------------------------------------------|
| Position          | Absolute, `bottom: 180px`                                        |
| Left slot         | `left: 60px` (mobile: `10px`)                                    |
| Right slot        | `right: 60px` (mobile: `10px`)                                   |
| Container size    | `180 × 260px`                                                    |
| Transitions       | `opacity 0.4s, transform 0.4s`                                   |

#### Character Placeholder (until real art is integrated)

| Property        | Value                                                        |
|-----------------|--------------------------------------------------------------|
| Size            | `120 × 220px` (mobile: `90 × 170px`)                        |
| Border-radius   | `60px 60px 20px 20px` (rounded head, squared feet)          |
| Icon            | `2.5rem`, centred above name                                 |
| Font            | `0.75rem`, weight 600, `var(--warm-white)`                   |
| Box-shadow      | `0 4px 12px var(--shadow)`                                   |
| **Dimmed state** | `opacity: 0.4; filter: grayscale(30%)` — applied when a different character is actively speaking |
| Transition      | `opacity 0.3s, filter 0.3s`                                 |

#### Per-Character Gradients

| Character | CSS Class       | Gradient (top → bottom)         | Icon |
|-----------|-----------------|----------------------------------|------|
| Kit       | `.char-kit`     | `#2C1810 (20%) → var(--gold)`   | 🎩   |
| Claire    | `.char-claire`  | `#5A3E4A (20%) → var(--dusty-rose)` | 🌸 |
| Edward    | `.char-edward`  | `#3A1A4A (20%) → var(--cocoa)`  | ☕   |

---

## 7. Dialogue Box

Anchored to the bottom of the scene area.

| Property        | Value                                                                       |
|-----------------|-----------------------------------------------------------------------------|
| Position        | `absolute; bottom: 0; left: 0; right: 0`                                   |
| Min-height      | `170px` (mobile: `150px`)                                                   |
| Background      | Gradient: `rgba(255,248,240,0.95) → rgba(253,220,186,0.97)`                |
| Border-top      | `3px solid var(--blush)`                                                    |
| Padding         | `20px 30px 24px` (mobile: `16px 20px 20px`)                                |
| Cursor          | `pointer` (click anywhere to advance)                                       |
| Transition      | `opacity 0.3s`                                                              |

### 7.1 Narrator / Stage Mode

When the speaker is `"Narrator"` or `"Stage"`, the dialogue box switches appearance:

| Property        | Narrator Mode Value                                              |
|-----------------|------------------------------------------------------------------|
| Background      | `rgba(74,55,40,0.9) → rgba(74,55,40,0.95)` (dark overlay)       |
| Border-top      | `var(--gold)` instead of blush                                   |
| Text colour     | `var(--cream)`, italic                                           |
| Speaker label   | Hidden (no name displayed)                                       |

### 7.2 Speaker Name Colours

| Speaker    | CSS Class           | Colour               |
|------------|---------------------|-----------------------|
| Kit        | `.speaker-kit`      | `var(--gold)` #D4A843 |
| Edward     | `.speaker-edward`   | `var(--cocoa)` #8B4513|
| Claire     | `.speaker-claire`   | `var(--dusty-rose)` #C48B9F |
| Narrator   | `.speaker-narrator` | `var(--text-light)`, italic |
| Stage      | `.speaker-stage`    | `#999`, italic        |

### 7.3 Advance Indicator

- Text: "Click or press Space to continue"
- Position: bottom-right of dialogue box (`bottom: 10px; right: 20px`)
- Hidden while text is typing; fades in (`opacity 0.3s`) when typewriter completes
- Pulse animation: `opacity 0.4 → 1 → 0.4` over `1.5s`, infinite

### 7.4 Typewriter Effect

- Speed: **30 ms per character**
- Clicking or pressing Space/Enter while typing instantly completes the line
- After typing finishes the advance indicator becomes visible

---

## 8. Choice Panel

Appears above the dialogue box when a branching point is reached.

| Property          | Value                                                           |
|-------------------|-----------------------------------------------------------------|
| Position          | `absolute; bottom: 180px; left: 50%; transform: translateX(-50%)` |
| Layout            | Flex column, `gap: 12px`                                        |
| z-index           | `50`                                                            |
| Hidden state      | `opacity: 0; pointer-events: none`                              |
| Visible state     | `.visible` → `opacity: 1; pointer-events: auto`                |
| Transition        | `opacity 0.4s`                                                  |

### Choice Buttons

| Property        | Value                                                              |
|-----------------|--------------------------------------------------------------------|
| Min-width       | `340px` (mobile: `260px`)                                          |
| Padding         | `14px 32px` (mobile: `12px 24px`)                                  |
| Font            | Quicksand, `0.95rem` (mobile `0.85rem`), weight 600                |
| Colour          | `var(--text-dark)`                                                 |
| Background      | Gradient: `warm-white → cream`                                     |
| Border          | `2px solid var(--blush)`, `border-radius: 24px`                    |
| Box-shadow      | `0 3px 12px var(--shadow)`                                         |
| Hover           | `translateY(-2px)`, gradient shifts to `soft-peach → blush`, border `var(--dusty-rose)`, shadow amplified |

### Behaviour

- The dialogue box shows the choice **prompt text** in narrator mode while choices are visible.
- Clicking a choice records `{ choiceId, index, text }` in `choiceHistory`, hides the panel, and transitions to the target dialogue block.
- While the choice panel is visible, clicks on the dialogue box and keyboard advance are **disabled**.

---

## 9. Skip Story Button

A subtle, opt-in shortcut to bypass remaining dialogue.

| Property        | Default (Idle)                            | Hover / Focus                            |
|-----------------|-------------------------------------------|------------------------------------------|
| Position        | `top: 12px; right: 16px`                  | —                                        |
| z-index         | `60`                                      | —                                        |
| Padding         | `6px 18px`                                | —                                        |
| Font            | Quicksand `0.78rem`, weight 500           | weight **700**                           |
| Colour          | `var(--text-light)`                       | `var(--cocoa)`                           |
| Background      | `transparent`                             | `rgba(255, 248, 240, 0.85)`             |
| Border          | `1px solid rgba(122,100,85,0.2)`, radius `16px` | `1px solid var(--cocoa)`           |
| Opacity         | `0.35`                                    | `1`                                      |
| Active          | `transform: scale(0.97)`                  | —                                        |
| Transitions     | `opacity 0.3s, color 0.3s, background 0.3s, border-color 0.3s, font-weight 0.3s` | — |

### Visibility Rules

| Screen               | Visible? |
|----------------------|----------|
| Title Card           | No (`display: none`)  |
| Active VN playback   | Yes (`display: block`) |
| Episode Complete     | No (hidden by `skipStory()` → sets `display: none`) |

### Behaviour

Clicking Skip Story:
1. Hides the skip button
2. Dismisses any visible choice panel
3. Triggers the scene-transition flow (fade overlay) and lands on the Episode Complete screen

---

## 10. Fade Overlay

Used for scene transitions (end-of-block, skip story).

| Property        | Value                                       |
|-----------------|---------------------------------------------|
| Position        | `absolute; inset: 0`                        |
| Background      | `#2C1810` (deep brown)                      |
| z-index         | `200`                                       |
| Hidden          | `opacity: 0; pointer-events: none`          |
| Active          | `.active` → `opacity: 1`                    |
| Transition      | `opacity 0.8s ease`                         |

### Transition Sequence

1. Add `.active` → overlay fades in over **800 ms**
2. Swap scene content / show episode complete
3. Wait **400 ms**, remove `.active` → overlay fades out over **800 ms**

---

## 11. Episode Complete Screen

| Property          | Value                                                              |
|-------------------|--------------------------------------------------------------------|
| Position          | `absolute; inset: 0`                                               |
| Background        | Same gradient as title card: `cream → soft-peach (60%) → blush`    |
| z-index           | `150`                                                              |
| Hidden            | `opacity: 0; pointer-events: none`                                 |
| Visible           | `.visible` → `opacity: 1; pointer-events: auto`                   |
| Transition        | `opacity 0.6s`                                                     |

### Content

| Element              | Details                                                       |
|----------------------|---------------------------------------------------------------|
| Heading `<h2>`       | "Episode N Complete" — Playfair Display `2rem`, `var(--cocoa)` |
| Episode title `<p>`  | Quoted title in `var(--dusty-rose)`, `1rem`                   |
| Choice summary       | "Your choice: …" — shows last choice made (if any)           |
| Next-episode hint    | `var(--text-light)`, `0.9rem`                                 |
| **Back to Journal**  | Returns to the Journal Book screen; uses `journal-return-btn` styling |
| **Replay Episode**   | Pill button, gradient `dusty-rose → blush`, white text, radius `24px`, hover lifts `translateY(-2px)` |

### On Appear

- Dialogue box, character-left, character-right are all faded to `opacity: 0`
- Skip button is already hidden

---

## 12. Input Handling

| Input                     | Action                                          |
|---------------------------|-------------------------------------------------|
| **Click dialogue box**    | Advance to next line (or complete typewriter)    |
| **Space / Enter key**     | Same as click (with `preventDefault`)            |
| **Click choice button**   | Select that branch, record in `choiceHistory`    |
| **Click Skip Story**      | Jump to episode complete                         |
| **Click Begin**           | Dismiss title card, start VN playback            |
| **Click Replay Episode**  | Reset all state, return to title card            |
| **Click Back to Journal** | Return to Journal Book screen                    |

Advance is **disabled** when:
- Title card is showing
- Episode complete screen is visible
- Choice panel is visible

---

## 13. Character Data Model

Characters are defined with the following schema:

```js
{
  "Character Name": {
    id:       string,   // e.g. "kit"
    color:    string,   // hex colour for speaker label
    icon:     string,   // emoji placeholder for sprite
    cssClass: string,   // e.g. "char-kit" (gradient class)
    side:     string|null // "left" | "right" | null (narrator/stage)
  }
}
```

### Current Characters

| Name              | ID       | Colour  | Side  |
|-------------------|----------|---------|-------|
| Kit (Wizard)      | kit      | #D4A843 | left  |
| Edward (Barista)  | edward   | #8B4513 | right |
| Claire            | claire   | #C48B9F | right |
| Narrator          | narrator | #7A6455 | —     |
| Stage             | stage    | #999999 | —     |

---

## 14. Episode Dialogue Data Schema

Each episode block follows this structure:

```json
{
  "episode": 1,
  "dialogueLines": [
    { "id": 1, "speaker": "Narrator", "text": "..." },
    { "id": 2, "speaker": "Kit (Wizard)", "text": "..." }
  ],
  "choices": [
    {
      "id": "EP1-CHOICE-1",
      "prompt": "Question text shown in dialogue box",
      "options": [
        { "text": "Option A", "next": { "chapter": 1, "episode": 1.1 } },
        { "text": "Option B", "next": { "chapter": 1, "episode": 1.2 } }
      ]
    }
  ],
  "sceneTransition": {
    "next": { "chapter": 1, "episode": 2 },
    "effect": "fade",
    "music": "cafe_theme",
    "delayMs": 1200
  }
}
```

- **Branching sub-episodes** use decimal keys (e.g. `"1.1"`, `"1.2"`) and have no choices of their own — they converge back via `sceneTransition.next`.
- If `choices` is empty, the engine proceeds directly to the scene transition after the last dialogue line.
- If `sceneTransition` is absent, the episode complete screen is shown immediately.

---

## 15. Z-Index Stack

| Layer              | z-index |
|--------------------|---------|
| Fade overlay       | 200     |
| Episode complete   | 150     |
| Title card         | 100     |
| Skip Story button  | 60      |
| Choice panel       | 50      |
| Scene / characters | default |

---

## 16. Animation Summary

| Animation              | Duration | Easing     | Trigger                     |
|------------------------|----------|------------|-----------------------------|
| Title card fade-out    | 0.8 s    | ease       | Click "Begin"               |
| Typewriter text        | 30 ms/ch | linear     | Each new dialogue line       |
| Advance indicator pulse| 1.5 s    | ease-in-out| Loops while waiting for input|
| Character dim/undim    | 0.3 s    | default    | Speaker changes              |
| Character appear/hide  | 0.4 s    | default    | Character enters/exits scene |
| Choice panel fade-in   | 0.4 s    | default    | Branch point reached         |
| Fade overlay in/out    | 0.8 s    | ease       | Scene transition             |
| Episode complete fade  | 0.6 s    | default    | Episode finishes             |
| Skip button hover      | 0.3 s    | default    | Mouse enter/focus            |
| Button press (active)  | instant  | —          | `scale(0.97)` on mousedown  |
| Button hover lift      | 0.15–0.2s| default    | `translateY(-2px)`           |

---

**End of Episode UI Design Spec**

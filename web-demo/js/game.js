/**
 * Wish House Visual Novel - Web Demo Engine
 *
 * Loads episode dialogue JSON data dynamically and drives the visual novel:
 * typewriter text, character sprites, branching choices, scene transitions.
 *
 * Character name format: "Kit (Wizard)", "Edward (Barista)", "Claire"
 */

// ── Character Definitions ──
const CHARACTERS = {
  "Kit (Wizard)":     { id: "kit",     color: "#D4A843", icon: "\uD83C\uDFA9", cssClass: "char-kit",     side: "left"  },
  "Edward (Barista)": { id: "edward",  color: "#8B4513", icon: "\u2615",       cssClass: "char-edward",  side: "right" },
  "Claire":           { id: "claire",  color: "#C48B9F", icon: "\uD83C\uDF38", cssClass: "char-claire",  side: "right" },
  "Narrator":         { id: "narrator",color: "#7A6455", icon: "",             cssClass: "",              side: null    },
  "Stage":            { id: "stage",   color: "#999999", icon: "",             cssClass: "",              side: null    }
};

// ── Expression Catalog (loaded from data/expressions.json at runtime) ──
// Structure: { characterId: { expressionLabel: { emoji, image } } }
// Populated by WishHouseEngine.loadExpressions()
let EXPRESSIONS = {};

// ── Game Engine ──
class WishHouseEngine {
  constructor() {
    // DOM references
    this.titleScreen     = document.getElementById("title-screen");
    this.startBtn        = document.getElementById("start-btn");
    this.scene           = document.getElementById("scene");
    this.dialogueBox     = document.getElementById("dialogue-box");
    this.speakerName     = document.getElementById("speaker-name");
    this.dialogueText    = document.getElementById("dialogue-text");
    this.advanceIndicator= document.getElementById("advance-indicator");
    this.choicePanel     = document.getElementById("choice-panel");
    this.charLeft        = document.getElementById("character-left");
    this.charRight       = document.getElementById("character-right");
    this.fadeOverlay     = document.getElementById("fade-overlay");
    this.episodeComplete = document.getElementById("episode-complete");
    this.nextEpisodeBtn  = document.getElementById("next-episode-btn");
    this.skipStoryBtn    = document.getElementById("skip-story-btn");
    this.skipToChoiceBtn = document.getElementById("skip-to-choice-btn");
    this.skipToChoiceBtnTitle = document.getElementById("skip-to-choice-btn-title");
    this.backToJournalTitleBtn = document.getElementById("back-to-journal-title-btn");
    this.dishCard        = document.getElementById("dish-card");

    // State
    this.episodeData     = null;   // Currently loaded episode data
    this.currentChapter  = 1;
    this.currentEpisode  = 1;
    this.currentBlock    = null;
    this.currentLineIdx  = 0;
    this.isTyping        = false;
    this.skipRequested   = false;
    this.typewriterSpeed = 7; // ms per character
    this._typewriterId   = 0;  // incremented each typewriter call to cancel stale ones
    this.choiceHistory   = [];
    this.activeCharacters = {};  // Track which characters appear in current episode
    this.characterExpressions = {}; // Track current expression per character (by speaker name)
    this.spriteCache = {};  // Cache tested sprite availability: path -> boolean

    // Bind events
    this.startBtn.addEventListener("click", () => this.startGame());
    this.dialogueBox.addEventListener("click", () => this.advance());
    this.nextEpisodeBtn.addEventListener("click", () => this.goToNextEpisode());
    this.skipStoryBtn.addEventListener("click", () => this.skipStory());
    this.skipToChoiceBtn.addEventListener("click", () => this.skipToChoice());
    this.skipToChoiceBtnTitle.addEventListener("click", () => this.skipToChoice());
    this.backToJournalTitleBtn.addEventListener("click", () => this.backToJournalFromTitle());
    document.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.advance();
      }
    });
  }

  // ── Episode Loading ──

  /**
   * Load the expression catalog from data/expressions.json.
   * Populates the global EXPRESSIONS object keyed by character id.
   * Safe to call multiple times -- only fetches once.
   */
  async loadExpressions() {
    if (Object.keys(EXPRESSIONS).length > 0) return; // already loaded
    try {
      const resp = await fetch("data/expressions.json");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      // Flatten: { characters: { kit: { expressions: {...} } } } -> { kit: {...} }
      for (const [charId, charInfo] of Object.entries(data.characters || {})) {
        EXPRESSIONS[charId] = charInfo.expressions || {};
      }
      console.log(`[Engine] Loaded expressions for: ${Object.keys(EXPRESSIONS).join(", ")}`);
    } catch (e) {
      console.warn("[Engine] Could not load expressions.json, expressions will use dialogue-line data only.", e);
    }
  }

  /**
   * Load episode data from JSON files.
   * Tries split layout (main + branch files), merges them.
   */
  async loadEpisode(chapter, episode) {
    const folder = `data/Chapter${chapter}/Episode${episode}`;

    // Try split layout: main + branch files
    let mainData = null;
    try {
      const mainResp = await fetch(`${folder}/episode${episode}_main_dialogue.json`);
      if (mainResp.ok) {
        mainData = await mainResp.json();
      }
    } catch (e) { /* fall through */ }

    if (mainData) {
      // Merge branch files (fetch all in parallel)
      const branchPromises = [];
      for (let b = 1; b <= 9; b++) {
        branchPromises.push(
          fetch(`${folder}/episode${episode}_${b}_dialogue.json`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
      }
      const branchResults = await Promise.all(branchPromises);
      for (const branchData of branchResults) {
        if (branchData && branchData.episodes) {
          for (const [key, block] of Object.entries(branchData.episodes)) {
            if (!mainData.episodes[key]) {
              mainData.episodes[key] = block;
            }
          }
        }
      }

      console.log(`[Engine] Loaded split Ch${chapter} Ep${episode}: keys=[${Object.keys(mainData.episodes).join(", ")}]`);
      return mainData;
    }

    // Fallback: monolithic file
    try {
      const resp = await fetch(`${folder}/episode${episode}_dialogue.json`);
      if (resp.ok) {
        const data = await resp.json();
        console.log(`[Engine] Loaded monolithic Ch${chapter} Ep${episode}`);
        return data;
      }
    } catch (e) { /* fall through */ }

    console.error(`[Engine] Could not load Ch${chapter} Ep${episode}`);
    return null;
  }

  /**
   * Called by journal to load and prepare a specific episode.
   */
  async loadAndPrepareEpisode(chapter, episode) {
    this.currentChapter = chapter;
    this.currentEpisode = episode;

    // Ensure expression catalog is loaded
    await this.loadExpressions();

    this.episodeData = await this.loadEpisode(chapter, episode);

    if (!this.episodeData) {
      console.error(`[Engine] Failed to load episode data for Ch${chapter} Ep${episode}`);
      return false;
    }

    // Characters are revealed progressively as they speak (not pre-scanned).
    // This prevents characters from appearing on screen before they enter the story.
    this.activeCharacters = {};

    // Set initial off-screen positions for character slide-in animation
    this.charLeft.style.opacity = "0";
    this.charLeft.style.transform = "translateX(-50px)";
    this.charRight.style.opacity = "0";
    this.charRight.style.transform = "translateX(50px)";

    // Show "Skip to Choice" buttons if episode was already completed and has choices
    const mainBlock = this.episodeData.episodes[String(episode)];
    const hasChoices = mainBlock?.choices?.length > 0;
    const wasCompleted = window.journal?.getEpisodeState(chapter, episode) === "completed";
    const showSkip = hasChoices && wasCompleted;
    this.skipToChoiceBtnTitle.style.display = showSkip ? "inline-block" : "none";
    this.skipToChoiceBtn.style.display = "none"; // in-VN button shown on startGame()

    return true;
  }

  // ── Game Flow ──

  startGame() {
    this.titleScreen.classList.add("hidden");
    this.skipStoryBtn.style.display = "block";

    // Show in-VN "Skip to Choice" if eligible (episode completed + has choices)
    const mainBlock = this.episodeData?.episodes[String(this.currentEpisode)];
    const hasChoices = mainBlock?.choices?.length > 0;
    const wasCompleted = window.journal?.getEpisodeState(this.currentChapter, this.currentEpisode) === "completed";
    this.skipToChoiceBtn.style.display = (hasChoices && wasCompleted) ? "block" : "none";

    // Start the main block (block key = episode number)
    this.startBlock(String(this.currentEpisode));
  }

  // ── Time-of-Day Theme ──

  /**
   * Determine the time-of-day theme from a "HH:MM" time string.
   * Returns one of: "night", "sunrise", "day", "sunset", or null if no time.
   *
   * Ranges (per design):
   *   night   = 7:00 PM (19:00) – 5:00 AM (04:59)
   *   sunrise = 5:00 AM (05:00) – 7:00 AM (06:59)
   *   day     = 7:00 AM (07:00) – 5:00 PM (16:59)
   *   sunset  = 5:00 PM (17:00) – 7:00 PM (18:59)
   */
  getTimeTheme(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h)) return null;
    const mins = h * 60 + (m || 0);

    if (mins >= 1140 || mins < 300) return "night";   // 19:00–04:59
    if (mins >= 300 && mins < 420)  return "sunrise";  // 05:00–06:59
    if (mins >= 420 && mins < 1020) return "day";      // 07:00–16:59
    return "sunset";                                    // 17:00–18:59
  }

  /**
   * Apply the time-of-day theme class to the scene element.
   * Removes any previous theme class first.
   */
  applyTimeTheme(block) {
    const themes = ["scene-night", "scene-sunrise", "scene-day", "scene-sunset"];
    themes.forEach(cls => this.scene.classList.remove(cls));

    const theme = this.getTimeTheme(block?.time);
    if (theme) {
      this.scene.classList.add(`scene-${theme}`);
      console.log(`[Engine] Time theme: ${theme} (time=${block.time})`);
    }
  }

  startBlock(blockKey) {
    if (!this.episodeData) {
      console.error("[Engine] No episode data loaded.");
      return;
    }

    const block = this.episodeData.episodes[blockKey];
    if (!block) {
      console.error(`[Engine] Block "${blockKey}" not found. Available: [${Object.keys(this.episodeData.episodes).join(", ")}]`);
      return;
    }

    this.currentBlock = block;
    this.currentLineIdx = 0;
    this.choicePanel.classList.remove("visible");
    this.hideDishCard();
    this.dialogueBox.style.opacity = "1";
    this.applyTimeTheme(block);
    this.displayNextLine();
  }

  advance() {
    if (this.titleScreen && !this.titleScreen.classList.contains("hidden")) return;
    if (this.episodeComplete.classList.contains("visible")) return;
    if (this.choicePanel.classList.contains("visible")) return;

    if (this.isTyping) {
      this.skipRequested = true;
      return;
    }

    this.displayNextLine();
  }

  displayNextLine() {
    if (!this.currentBlock) return;

    const lines = this.currentBlock.dialogueLines;

    if (this.currentLineIdx >= lines.length) {
      this.onBlockComplete();
      return;
    }

    const line = lines[this.currentLineIdx];
    this.currentLineIdx++;

    // Reveal character on screen when they first speak
    const charData = CHARACTERS[line.speaker];
    if (charData && charData.side && !this.activeCharacters[line.speaker]) {
      this.activeCharacters[line.speaker] = charData;
    }

    // Update expression state for this character
    if (line.expression) {
      const charId = CHARACTERS[line.speaker]?.id;
      const catalogEntry = charId && EXPRESSIONS[charId]?.[line.expression];
      this.characterExpressions[line.speaker] = {
        expression:      line.expression,
        expressionEmoji: line.expressionEmoji || catalogEntry?.emoji || null,
        expressionImage: line.expressionImage || catalogEntry?.image || null,
      };
    }

    this.updateSpeaker(line.speaker);
    this.updateCharacters(line.speaker);

    // Dish card: show or hide based on dialogue fields
    if (line.dish) {
      this.showDishCard(line.dish);
    }
    if (line.hideDish) {
      this.hideDishCard();
    }

    this.typewriterEffect(line.text);
  }

  // ── Speaker & Characters ──

  updateSpeaker(speaker) {
    const isNarrator = speaker === "Narrator";
    const isStage = speaker === "Stage";

    // Narrator/stage mode
    if (isNarrator || isStage) {
      this.dialogueBox.classList.add("narrator-mode");
      this.speakerName.textContent = "";
      this.speakerName.className = isStage ? "speaker-stage" : "speaker-narrator";
    } else {
      this.dialogueBox.classList.remove("narrator-mode");
      this.speakerName.textContent = speaker;

      // Set speaker color class
      const charData = CHARACTERS[speaker];
      if (charData) {
        this.speakerName.className = `speaker-${charData.id}`;
        this.speakerName.style.color = charData.color;
      }
    }
  }

  updateCharacters(activeSpeaker) {
    // Find which characters should be on left/right based on active characters
    let leftChar = null;
    let rightChar = null;

    for (const [name, data] of Object.entries(this.activeCharacters)) {
      if (data.side === "left") leftChar = name;
      if (data.side === "right") rightChar = name;
    }

    // Left character (slide in from left)
    if (leftChar) {
      this.charLeft.innerHTML = this.createCharacterPlaceholder(leftChar, activeSpeaker);
      this.charLeft.style.opacity = "1";
      this.charLeft.style.transform = "translateX(0)";
    } else {
      this.charLeft.style.opacity = "0";
      this.charLeft.style.transform = "translateX(-50px)";
    }

    // Right character (slide in from right)
    if (rightChar) {
      this.charRight.innerHTML = this.createCharacterPlaceholder(rightChar, activeSpeaker);
      this.charRight.style.opacity = "1";
      this.charRight.style.transform = "translateX(0)";
    } else {
      this.charRight.style.opacity = "0";
      this.charRight.style.transform = "translateX(50px)";
    }
  }

  createCharacterPlaceholder(charName, activeSpeaker) {
    const charData = CHARACTERS[charName];
    if (!charData) return "";

    const isDimmed = activeSpeaker !== charName && activeSpeaker !== "Narrator" && activeSpeaker !== "Stage";
    const dimClass = isDimmed ? "dimmed" : "";

    // Resolve expression display: sprite image > emoji > default icon
    const exprState = this.characterExpressions[charName];
    let iconHtml;
    let exprLabel = "";

    if (exprState) {
      exprLabel = exprState.expression || "";
      const imgPath = exprState.expressionImage;

      // Try sprite image if path exists and was confirmed loadable
      if (imgPath && this.spriteCache[imgPath] === true) {
        iconHtml = `<img class="char-sprite" src="${imgPath}" alt="${exprLabel}">`;
      } else if (imgPath && this.spriteCache[imgPath] === undefined) {
        // Haven't tested this sprite yet -- probe it, use emoji for now
        this.probeSprite(imgPath);
        iconHtml = `<span class="char-expression-emoji">${exprState.expressionEmoji || charData.icon}</span>`;
      } else {
        // Sprite unavailable or no path -- show emoji
        iconHtml = `<span class="char-expression-emoji">${exprState.expressionEmoji || charData.icon}</span>`;
      }
    } else {
      iconHtml = `<span class="char-icon">${charData.icon}</span>`;
    }

    // Always show character icon on top when an expression is active
    const charIconHtml = exprState ? `<span class="char-icon">${charData.icon}</span>` : "";

    return `<div class="character-placeholder ${charData.cssClass} ${dimClass}" data-expression="${exprLabel}">
      ${charIconHtml}
      ${iconHtml}
      <span class="char-name-label">${charName}</span>
      ${exprLabel ? `<span class="char-expression-label">${exprLabel.replace(/_/g, " ")}</span>` : ""}
    </div>`;
  }

  /**
   * Probe whether a sprite image exists. Caches the result so we only check once.
   */
  probeSprite(path) {
    if (this.spriteCache[path] !== undefined) return;
    this.spriteCache[path] = false; // mark as testing
    const img = new Image();
    img.onload = () => { this.spriteCache[path] = true; };
    img.onerror = () => { this.spriteCache[path] = false; };
    img.src = path;
  }

  // ── Dish Card (served item popup) ──

  showDishCard(dish) {
    // Make container visible if not already
    this.dishCard.classList.add("visible");

    // Create a new dish-item element
    const item = document.createElement("div");
    item.className = "dish-item";
    item.innerHTML = `
      <span class="dish-emoji">${dish.emoji || "☕"}</span>
      <span class="dish-name">${dish.name || ""}</span>
    `;
    this.dishCard.appendChild(item);

    // Force reflow then animate in
    void item.offsetWidth;
    item.classList.add("visible");
  }

  hideDishCard() {
    // Fade out all dish items, then clear container
    const items = this.dishCard.querySelectorAll(".dish-item");
    items.forEach(item => item.classList.remove("visible"));
    // After transition completes, hide container and clear
    setTimeout(() => {
      this.dishCard.classList.remove("visible");
      this.dishCard.innerHTML = "";
    }, 850);
  }

  // ── Typewriter Effect ──

  async typewriterEffect(fullText) {
    const myId = ++this._typewriterId;
    this.isTyping = true;
    this.skipRequested = false;
    this.advanceIndicator.classList.remove("visible");
    this.dialogueText.textContent = "";

    for (let i = 0; i < fullText.length; i++) {
      if (this._typewriterId !== myId) return; // cancelled by a newer call
      if (this.skipRequested) {
        this.dialogueText.textContent = fullText;
        break;
      }

      this.dialogueText.textContent += fullText[i];
      await this.sleep(this.typewriterSpeed);
    }

    if (this._typewriterId !== myId) return; // cancelled by a newer call
    this.isTyping = false;
    this.advanceIndicator.classList.add("visible");
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Choices ──

  onBlockComplete() {
    const choices = this.currentBlock.choices;

    if (choices && choices.length > 0) {
      this.presentChoices(choices[0]);
      return;
    }

    // No choices - trigger scene transition
    this.handleSceneTransition();
  }

  presentChoices(choice) {
    this.advanceIndicator.classList.remove("visible");
    this.speakerName.textContent = "";
    this.speakerName.className = "speaker-narrator";
    this.dialogueBox.classList.add("narrator-mode");
    this.dialogueText.textContent = choice.prompt;

    // Build choice buttons
    this.choicePanel.innerHTML = "";
    choice.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = option.text;
      btn.addEventListener("click", () => this.selectChoice(choice.id, index, option));
      this.choicePanel.appendChild(btn);
    });

    this.choicePanel.classList.add("visible");
  }

  selectChoice(choiceId, index, option) {
    this.choiceHistory.push({ choiceId, index, text: option.text });
    this.choicePanel.classList.remove("visible");

    // Navigate to the target block
    const blockKey = String(option.next.episode);
    this.startBlock(blockKey);
  }

  // ── Scene Transitions ──

  async handleSceneTransition() {
    const transition = this.currentBlock.sceneTransition;
    if (!transition) {
      this.showEpisodeComplete();
      return;
    }

    // Hide dialogue and characters before fade so they don't linger
    this.dialogueBox.style.opacity = "0";
    this.charLeft.style.opacity = "0";
    this.charRight.style.opacity = "0";
    this.skipStoryBtn.style.display = "none";
    this.skipToChoiceBtn.style.display = "none";

    // Fade out
    this.fadeOverlay.classList.add("active");
    await this.sleep(800);

    this.showEpisodeComplete();

    // Fade back in
    await this.sleep(400);
    this.fadeOverlay.classList.remove("active");
  }

  showEpisodeComplete() {
    this.dialogueBox.style.opacity = "0";
    this.charLeft.style.opacity = "0";
    this.charRight.style.opacity = "0";

    const choiceSummary = document.getElementById("choice-summary");
    if (choiceSummary && this.choiceHistory.length > 0) {
      const lastChoice = this.choiceHistory[this.choiceHistory.length - 1];
      choiceSummary.textContent = `Your choice: ${lastChoice.text}`;
    }

    // Show/hide "Next Episode" based on whether a next episode exists
    const nextEp = this.findNextEpisode();
    if (nextEp) {
      this.nextEpisodeBtn.style.display = "inline-block";
      this.nextEpisodeBtn.textContent = nextEp.shiftId != null ? "Next: Cafe Shift" : "Next Episode";
    } else {
      this.nextEpisodeBtn.style.display = "none";
    }

    this.episodeComplete.classList.add("visible");
  }

  /**
   * Find the next episode after the current one.
   * Returns the episode spec object from CHAPTERS, or null if at end of chapter.
   */
  findNextEpisode() {
    if (!window.journal) return null;
    const chData = typeof CHAPTERS !== "undefined" ? CHAPTERS[this.currentChapter] : null;
    if (!chData) return null;
    return chData.episodes.find(e => e.episode === this.currentEpisode + 1) || null;
  }

  /**
   * Navigate to the next episode. Marks current episode complete,
   * then opens the next one through journal.
   */
  goToNextEpisode() {
    const nextEp = this.findNextEpisode();
    if (!nextEp || !window.journal) return;

    // Mark current episode as completed
    window.journal.completeEpisode(this.currentChapter, this.currentEpisode);

    // Clear stale dialogue content before making anything visible
    this.dialogueText.textContent = "";
    this.speakerName.textContent = "";

    // Reset VN state
    this.episodeComplete.classList.remove("visible");
    this.choiceHistory = [];
    this.characterExpressions = {};
    this.fadeOverlay.classList.remove("active");
    this.charLeft.style.opacity = "0";
    this.charRight.style.opacity = "0";
    this.dialogueBox.style.opacity = "0";
    this.dialogueBox.classList.remove("narrator-mode");
    this.skipStoryBtn.style.display = "none";
    this.skipToChoiceBtn.style.display = "none";
    this.skipToChoiceBtnTitle.style.display = "none";

    // Open the next episode through journal (handles VN vs cafe shift)
    window.journal._activeChapter = this.currentChapter;
    window.journal._activeEpisode = nextEp.episode;
    window.journal.openEpisode(this.currentChapter, nextEp);
  }

  /**
   * Return to journal from the title screen without marking episode complete.
   */
  backToJournalFromTitle() {
    if (window.journal) {
      const vnPlayer = document.getElementById("vn-player");
      const journalScreen = document.getElementById("journal-screen");
      if (vnPlayer) vnPlayer.classList.add("hidden-screen");
      if (journalScreen) journalScreen.classList.remove("hidden-screen");
      window.journal.showChapter(window.journal.currentChapter);
    }
  }

  skipStory() {
    // Skip all remaining dialogue and go straight to episode complete
    this.skipStoryBtn.style.display = "none";
    this.choicePanel.classList.remove("visible");
    this.handleSceneTransition();
  }

  /**
   * Skip to Choice - jumps past all dialogue in the main block and presents
   * the choice prompt directly. Only available on replay (episode already completed).
   */
  skipToChoice() {
    this.titleScreen.classList.add("hidden");
    this.skipStoryBtn.style.display = "block";
    this.skipToChoiceBtn.style.display = "none";
    this.skipToChoiceBtnTitle.style.display = "none";

    // Load the main block
    const blockKey = String(this.currentEpisode);
    const block = this.episodeData?.episodes[blockKey];
    if (!block) return;

    this.currentBlock = block;
    this.dialogueBox.style.opacity = "1";
    this.applyTimeTheme(block);

    // Set up character expressions and reveal all speakers from the main block
    // so the characters show their final expressions (skip-to-choice = replay)
    if (block.dialogueLines) {
      for (const line of block.dialogueLines) {
        const cd = CHARACTERS[line.speaker];
        if (cd && cd.side && !this.activeCharacters[line.speaker]) {
          this.activeCharacters[line.speaker] = cd;
        }
        if (line.expression) {
          const charId = cd?.id;
          const catalogEntry = charId && EXPRESSIONS[charId]?.[line.expression];
          this.characterExpressions[line.speaker] = {
            expression:      line.expression,
            expressionEmoji: line.expressionEmoji || catalogEntry?.emoji || null,
            expressionImage: line.expressionImage || catalogEntry?.image || null,
          };
        }
      }
    }

    // Show characters in their final state
    this.updateCharacters("Narrator");

    // Jump straight to the choice
    if (block.choices && block.choices.length > 0) {
      this.currentLineIdx = block.dialogueLines.length;
      this.presentChoices(block.choices[0]);
    } else {
      // Fallback: no choices found, just start normally
      this.startBlock(blockKey);
    }
  }
}

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
  window.game = new WishHouseEngine();
  // Preload expression catalog so it's ready before any episode opens
  window.game.loadExpressions();
});

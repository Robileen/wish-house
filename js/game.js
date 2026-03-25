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
    this.restartBtn      = document.getElementById("restart-btn");
    this.skipStoryBtn    = document.getElementById("skip-story-btn");

    // State
    this.episodeData     = null;   // Currently loaded episode data
    this.currentChapter  = 1;
    this.currentEpisode  = 1;
    this.currentBlock    = null;
    this.currentLineIdx  = 0;
    this.isTyping        = false;
    this.skipRequested   = false;
    this.typewriterSpeed = 30; // ms per character
    this.choiceHistory   = [];
    this.activeCharacters = {};  // Track which characters appear in current episode

    // Bind events
    this.startBtn.addEventListener("click", () => this.startGame());
    this.dialogueBox.addEventListener("click", () => this.advance());
    this.restartBtn.addEventListener("click", () => this.restart());
    this.skipStoryBtn.addEventListener("click", () => this.skipStory());
    document.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.advance();
      }
    });
  }

  // ── Episode Loading ──

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
      // Merge branch files
      for (let b = 1; b <= 9; b++) {
        try {
          const branchResp = await fetch(`${folder}/episode${episode}_${b}_dialogue.json`);
          if (!branchResp.ok) continue;
          const branchData = await branchResp.json();
          if (branchData && branchData.episodes) {
            for (const [key, block] of Object.entries(branchData.episodes)) {
              if (!mainData.episodes[key]) {
                mainData.episodes[key] = block;
              }
            }
          }
        } catch (e) { continue; }
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
    this.episodeData = await this.loadEpisode(chapter, episode);

    if (!this.episodeData) {
      console.error(`[Engine] Failed to load episode data for Ch${chapter} Ep${episode}`);
      return false;
    }

    // Scan all dialogue lines to find which characters appear
    this.activeCharacters = {};
    for (const block of Object.values(this.episodeData.episodes)) {
      if (!block.dialogueLines) continue;
      for (const line of block.dialogueLines) {
        const charData = CHARACTERS[line.speaker];
        if (charData && charData.side) {
          this.activeCharacters[line.speaker] = charData;
        }
      }
    }

    return true;
  }

  // ── Game Flow ──

  startGame() {
    this.titleScreen.classList.add("hidden");
    this.skipStoryBtn.style.display = "block";
    // Start the main block (block key = episode number)
    this.startBlock(String(this.currentEpisode));
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
    this.dialogueBox.style.opacity = "1";
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

    this.updateSpeaker(line.speaker);
    this.updateCharacters(line.speaker);
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

    // Left character
    if (leftChar) {
      this.charLeft.innerHTML = this.createCharacterPlaceholder(leftChar, activeSpeaker);
      this.charLeft.style.opacity = "1";
    } else {
      this.charLeft.style.opacity = "0";
    }

    // Right character
    if (rightChar) {
      this.charRight.innerHTML = this.createCharacterPlaceholder(rightChar, activeSpeaker);
      this.charRight.style.opacity = "1";
    } else {
      this.charRight.style.opacity = "0";
    }
  }

  createCharacterPlaceholder(charName, activeSpeaker) {
    const charData = CHARACTERS[charName];
    if (!charData) return "";

    const isDimmed = activeSpeaker !== charName && activeSpeaker !== "Narrator" && activeSpeaker !== "Stage";
    const dimClass = isDimmed ? "dimmed" : "";

    return `<div class="character-placeholder ${charData.cssClass} ${dimClass}">
      <span class="char-icon">${charData.icon}</span>
      <span>${charName}</span>
    </div>`;
  }

  // ── Typewriter Effect ──

  async typewriterEffect(fullText) {
    this.isTyping = true;
    this.skipRequested = false;
    this.advanceIndicator.classList.remove("visible");
    this.dialogueText.textContent = "";

    for (let i = 0; i < fullText.length; i++) {
      if (this.skipRequested) {
        this.dialogueText.textContent = fullText;
        break;
      }

      this.dialogueText.textContent += fullText[i];
      await this.sleep(this.typewriterSpeed);
    }

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

    this.episodeComplete.classList.add("visible");
  }

  restart() {
    this.episodeComplete.classList.remove("visible");
    this.choiceHistory = [];
    this.fadeOverlay.classList.remove("active");
    this.charLeft.style.opacity = "0";
    this.charRight.style.opacity = "0";
    this.dialogueBox.style.opacity = "1";
    this.dialogueBox.classList.remove("narrator-mode");
    this.skipStoryBtn.style.display = "none";
    this.titleScreen.classList.remove("hidden");
  }

  skipStory() {
    // Skip all remaining dialogue and go straight to episode complete
    this.skipStoryBtn.style.display = "none";
    this.choicePanel.classList.remove("visible");
    this.handleSceneTransition();
  }
}

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
  window.game = new WishHouseEngine();
});

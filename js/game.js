/**
 * Wish House Visual Novel - Web Demo Engine
 * Chapter 1, Episode 1: "That'll Be 1 Button."
 *
 * Loads episode dialogue JSON data and drives the visual novel:
 * typewriter text, character sprites, branching choices, scene transitions.
 *
 * Character name format: "Kit (Wizard)", "Edward (Barista)", "Claire"
 */

// ── Episode 1 Dialogue Data (embedded from episode1_dialogue.json) ──
const EPISODE_DATA = {
  chapter: 1,
  episodes: {
    "1": {
      episode: 1,
      dialogueLines: [
        { id: 1, speaker: "Narrator", text: "A soft chime rings as the café door opens. A young woman steps inside, shoulders heavy, expression tired yet hopeful." },
        { id: 2, speaker: "Narrator", text: "Her uniform—simple, modest, and unmistakably that of a maid—carries faint wrinkles of a day far longer than most could bear." },
        { id: 3, speaker: "Narrator", text: "She works in one of the wealthiest estates in town. A place where perfection is demanded, gratitude is rare, and mistakes are not forgiven." },
        { id: 4, speaker: "Narrator", text: "Today is her off day. A fleeting breath of freedom she desperately needed." },
        { id: 5, speaker: "Claire", text: "...Hello? Is—Is it alright for me to come in?" },
        { id: 6, speaker: "Kit (Wizard)", text: "Of course. Welcome to the Wish House. A seat is yours if you wish to rest." },
        { id: 7, speaker: "Kit (Wizard)", text: "What brings you here on this fine evening? You look like you've walked through an entire storm." },
        { id: 8, speaker: "Claire", text: "Sorry... It's been a long day. A long week. Maybe a long life." },
        { id: 9, speaker: "Claire", text: "I work at a rich household nearby. They're… demanding. Everything has to be spotless. Timed. Perfect." },
        { id: 10, speaker: "Claire", text: "And on my off day, I just wanted somewhere new. Somewhere quiet. Somewhere the world can't find me for a while." },
        { id: 11, speaker: "Kit (Wizard)", text: "Then you've found the right corner of the world. What can I brew to help you forget your troubles?" },
        { id: 12, speaker: "Claire", text: "Just… coffee. Something warm. Something simple." },
        { id: 13, speaker: "Stage", text: "[Kit begins brewing—gentle, steady movements, like a small ritual written in steam and warmth.]" },
        { id: 14, speaker: "Kit (Wizard)", text: "Here you go—one house blend. Let it warm more than just your hands." },
        { id: 15, speaker: "Claire", text: "Thank you. Um… how much is it?" },
        { id: 16, speaker: "Kit (Wizard)", text: "That'll be a button, miss. But for today, it's on the house." },
        { id: 17, speaker: "Claire", text: "A… button? That's… oddly adorable." },
        { id: 18, speaker: "Kit (Wizard)", text: "Think of it as a tradition here. One small token, one small wish." }
      ],
      choices: [
        {
          id: "EP1-CHOICE-1",
          prompt: "Claire hesitates, holding the warm cup. What should Kit say next?",
          options: [
            { text: "\u201CIf you\u2019d like\u2026 you can tell me what\u2019s been weighing on you.\u201D", next: { chapter: 1, episode: 1.1 } },
            { text: "\u201CYou don\u2019t have to talk. Just rest. The world can wait.\u201D", next: { chapter: 1, episode: 1.2 } },
            { text: "\u201CHave you ever visited a place like this before?\u201D", next: { chapter: 1, episode: 1.3 } }
          ]
        }
      ],
      sceneTransition: { next: { chapter: 1, episode: 2 }, effect: "fade", music: "cafe_theme", delayMs: 1200 }
    },

    "1.1": {
      episode: 1.1,
      dialogueLines: [
        { id: 1, speaker: "Kit (Wizard)", text: "If you'd like… you can tell me what's been weighing on you." },
        { id: 2, speaker: "Claire", text: "I… don't usually talk about it. People don't really listen." },
        { id: 3, speaker: "Claire", text: "But today… I feel like if I don't let it out, I might just disappear." },
        { id: 4, speaker: "Stage", text: "[She grips the cup gently, drawing warmth from it.]" },
        { id: 5, speaker: "Claire", text: "The household I work for… they're strict. Cruel, sometimes. I'm one mistake away from being yelled at—or replaced." },
        { id: 6, speaker: "Claire", text: "I keep my head down. Smile when spoken to. Hide when needed. It's suffocating." },
        { id: 7, speaker: "Kit (Wizard)", text: "No one should have to live under fear." },
        { id: 8, speaker: "Claire", text: "I know. But quitting isn't an option. I need the money… badly." },
        { id: 9, speaker: "Claire", text: "This café… it feels different. Quiet. Safe." },
        { id: 10, speaker: "Kit (Wizard)", text: "You're welcome here anytime. For rest, warmth… or just silence." }
      ],
      choices: [],
      sceneTransition: { next: { chapter: 1, episode: 2 } }
    },

    "1.2": {
      episode: 1.2,
      dialogueLines: [
        { id: 1, speaker: "Kit (Wizard)", text: "You don't have to talk. Just rest. The world can wait." },
        { id: 2, speaker: "Stage", text: "[Claire closes her eyes, letting the warmth of the cup seep into her tired hands.]" },
        { id: 3, speaker: "Narrator", text: "The quiet hum of the café fills the space—soft, gentle, and healing." },
        { id: 4, speaker: "Claire", text: "…Thank you. People don't usually say things like that to me." },
        { id: 5, speaker: "Kit (Wizard)", text: "Then perhaps you're overdue for a little kindness." },
        { id: 6, speaker: "Claire", text: "It's strange… I feel safe here. Like no one can find me." },
        { id: 7, speaker: "Kit (Wizard)", text: "That's the magic of a place built to grant rest to weary souls." }
      ],
      choices: [],
      sceneTransition: { next: { chapter: 1, episode: 2 } }
    },

    "1.3": {
      episode: 1.3,
      dialogueLines: [
        { id: 1, speaker: "Kit (Wizard)", text: "Have you ever visited a place like this before?" },
        { id: 2, speaker: "Claire", text: "No… not really. I usually go straight home after work. There's never time for anything else." },
        { id: 3, speaker: "Claire", text: "But today felt different. Like I needed to step somewhere unfamiliar." },
        { id: 4, speaker: "Kit (Wizard)", text: "Then welcome to a small corner of the world where unfamiliar things happen often." },
        { id: 5, speaker: "Claire", text: "I can tell… this place feels magical somehow. Warm. Mysterious." },
        { id: 6, speaker: "Kit (Wizard)", text: "Magic, hm? Well… you're not entirely wrong." },
        { id: 7, speaker: "Claire", text: "I'd like to learn more about this café. Maybe next time?" },
        { id: 8, speaker: "Kit (Wizard)", text: "We'll be here. Always." }
      ],
      choices: [],
      sceneTransition: { next: { chapter: 1, episode: 2 } }
    }
  }
};

// ── Character Definitions ──
const CHARACTERS = {
  "Kit (Wizard)":     { id: "kit",     color: "#D4A843", icon: "🎩", cssClass: "char-kit",     side: "left"  },
  "Edward (Barista)": { id: "edward",  color: "#8B4513", icon: "☕", cssClass: "char-edward",  side: "right" },
  "Claire":           { id: "claire",  color: "#C48B9F", icon: "🌸", cssClass: "char-claire",  side: "right" },
  "Narrator":         { id: "narrator",color: "#7A6455", icon: "",   cssClass: "",              side: null    },
  "Stage":            { id: "stage",   color: "#999999", icon: "",   cssClass: "",              side: null    }
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
    this.currentBlock    = null;
    this.currentLineIdx  = 0;
    this.isTyping        = false;
    this.skipRequested   = false;
    this.typewriterSpeed = 30; // ms per character
    this.choiceHistory   = [];

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

  // ── Game Flow ──

  startGame() {
    this.titleScreen.classList.add("hidden");
    this.skipStoryBtn.style.display = "block";
    this.startBlock("1");
  }

  startBlock(blockKey) {
    const block = EPISODE_DATA.episodes[blockKey];
    if (!block) {
      console.error(`Block "${blockKey}" not found.`);
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
    const charData = CHARACTERS[activeSpeaker];
    const isNarrator = !charData || !charData.side;

    // Determine which characters are in scene
    // Episode 1: Kit is always present, Claire appears from line 5 onward
    const kitVisible = true;
    const claireVisible = this.currentLineIdx >= 5;

    // Kit placeholder
    if (kitVisible) {
      this.charLeft.innerHTML = this.createCharacterPlaceholder("Kit (Wizard)", activeSpeaker);
      this.charLeft.style.opacity = "1";
    } else {
      this.charLeft.style.opacity = "0";
    }

    // Claire placeholder
    if (claireVisible) {
      this.charRight.innerHTML = this.createCharacterPlaceholder("Claire", activeSpeaker);
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

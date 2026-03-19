/**
 * Wish House - Journal Book (Main Menu)
 *
 * Scrapbook-style journal hub. Each chapter is a page with washi tape
 * episode strips. Tapping a tape opens the VN player for that episode.
 *
 * Flow: Journal -> Episode Title Card -> VN Player -> Episode Complete -> Journal
 */

// ── Chapter Data (from chapter1_episodelist_spec.json) ──
const CHAPTERS = {
  1: {
    chapter: 1,
    location: "The Wish House",
    synopsis: "In a quiet corner of the city stands the Wish House, a small cafe whispered about in rumors \u2014 said to grant the wishes of anyone who walks through its doors. Most dismiss it as a silly urban legend. But those who visit discover that the rumors are true\u2026 just not in the way they expect.",
    episodes: [
      { episode: 1, title: "That\u2019ll Be 1 Button.", shiftId: null, type: "Visual Novel", pov: ["wizard"], scene: "Story will be focused on a NPC, who visited the wish house and met the magician who served her coffee. This is the introduction of this entire game VN." },
      { episode: 2, title: "Help Wanted, No Experience Required?", shiftId: null, type: "Visual Novel", pov: ["barista"], scene: "Barista is heading home from school, he stumbles upon job ad poster." },
      { episode: 3, title: "Operation MDI", shiftId: null, type: "Visual Novel", pov: ["wizard", "barista"], scene: "Wizard & barista are working together to make the first Wish House menu." },
      { episode: 4, title: "Trial, Error, and Too Much Sugar", shiftId: 1, type: "Visual Novel & Game", pov: ["wizard", "barista", "gameplay"], scene: "Gameplay." },
      { episode: 5, title: "3:07PM", shiftId: 2, type: "Visual Novel & Game", pov: ["gameplay"], scene: "Wish House is near schools and the student crowd came." },
      { episode: 6, title: "A Scared and Hungry Boy", shiftId: 3, type: "Visual Novel & Game", pov: ["gameplay"], scene: "A scared and hungry boy in a dirty school uniform." }
    ]
  }
};

// Tape color classes per episode index
const TAPE_COLORS = [
  "tape-blush", "tape-mint", "tape-peach", "tape-lavender",
  "tape-yellow", "tape-blue", "tape-tea", "tape-rose"
];

// Decoration types per episode index
const DECORATIONS = ["sticker", "paperclip", "flower", "none", "sticker", "flower", "paperclip", "sticker"];

// ── Journal Manager ──
class JournalBook {
  constructor() {
    // DOM
    this.journalScreen  = document.getElementById("journal-screen");
    this.vnPlayer       = document.getElementById("vn-player");
    this.episodeList    = document.getElementById("episode-list");
    this.chapterLabel   = document.getElementById("journal-chapter-label");
    this.locationLabel  = document.getElementById("journal-location");
    this.synopsisEl     = document.getElementById("journal-synopsis");
    this.memoryFill     = document.getElementById("memory-fill");
    this.memoryText     = document.getElementById("memory-text");
    this.pageIndicator  = document.getElementById("page-indicator");
    this.prevBtn        = document.getElementById("prev-chapter-btn");
    this.nextBtn        = document.getElementById("next-chapter-btn");
    this.backToJournal  = document.getElementById("back-to-journal-btn");

    // State
    this.currentChapter = 1;
    this.progress = this.loadProgress();

    // Bind
    this.prevBtn.addEventListener("click", () => this.showChapter(this.currentChapter - 1));
    this.nextBtn.addEventListener("click", () => this.showChapter(this.currentChapter + 1));
    this.backToJournal.addEventListener("click", () => this.returnToJournal());

    // Render
    this.showChapter(1);
  }

  // ── Progress Management ──

  loadProgress() {
    const saved = localStorage.getItem("wishhouse_journal");
    if (saved) return JSON.parse(saved);

    // Default: Episode 1 unlocked, rest locked
    return { completedEpisodes: [], currentChapter: 1 };
  }

  saveProgress() {
    localStorage.setItem("wishhouse_journal", JSON.stringify(this.progress));
  }

  getEpisodeState(chapter, episode) {
    const key = `${chapter}-${episode}`;
    if (this.progress.completedEpisodes.includes(key)) return "completed";

    // Episode is unlocked if it's the first one OR the previous one is completed
    if (episode === 1) return "unlocked";
    const prevKey = `${chapter}-${episode - 1}`;
    if (this.progress.completedEpisodes.includes(prevKey)) return "unlocked";

    return "locked";
  }

  completeEpisode(chapter, episode) {
    const key = `${chapter}-${episode}`;
    if (!this.progress.completedEpisodes.includes(key)) {
      this.progress.completedEpisodes.push(key);
      this.saveProgress();
    }
  }

  getCompletedCount(chapter) {
    return this.progress.completedEpisodes.filter(k => k.startsWith(`${chapter}-`)).length;
  }

  // ── Chapter Rendering ──

  showChapter(chapter) {
    const data = CHAPTERS[chapter];
    if (!data) return;

    this.currentChapter = chapter;

    // Left page
    this.chapterLabel.textContent = `Chapter ${chapter}`;
    this.locationLabel.textContent = data.location;
    this.synopsisEl.textContent = data.synopsis;

    // Progress
    const completed = this.getCompletedCount(chapter);
    const total = data.episodes.length;
    const pct = total > 0 ? (completed / total) * 100 : 0;
    this.memoryFill.style.width = `${pct}%`;
    this.memoryText.textContent = `${completed} / ${total}`;

    // Navigation
    this.prevBtn.disabled = chapter <= 1;
    this.nextBtn.disabled = !CHAPTERS[chapter + 1];
    this.pageIndicator.textContent = `${chapter} / 8`;

    // Right page: episode tapes
    this.renderEpisodeTapes(chapter, data.episodes);
  }

  renderEpisodeTapes(chapter, episodes) {
    this.episodeList.innerHTML = "";

    episodes.forEach((ep, idx) => {
      const state = this.getEpisodeState(chapter, ep.episode);
      const tapeColor = TAPE_COLORS[idx % TAPE_COLORS.length];
      const isShift = ep.shiftId !== null && ep.shiftId !== undefined;
      const hasWizard = ep.pov && ep.pov.includes("wizard");

      // Create tape element
      const tape = document.createElement("div");
      tape.className = `washi-tape ${tapeColor} ${state === "locked" ? "tape-locked" : ""}`;

      // Tape content
      let titleDisplay = state === "locked" ? "???" : ep.title;
      let statusHtml = this.getStatusHtml(state);
      let badgeHtml = state !== "locked" ? this.getBadgeHtml(isShift) : "";
      let sparkleHtml = hasWizard && state !== "locked" ? '<div class="tape-sparkle">\u2728</div>' : "";

      tape.innerHTML = `
        ${sparkleHtml}
        <div class="tape-content">
          <span class="tape-episode-num">${ep.episode}</span>
          <span class="tape-title">${titleDisplay}</span>
          ${badgeHtml}
          ${statusHtml}
        </div>
      `;

      // Click handler
      if (state !== "locked") {
        tape.addEventListener("click", () => this.openEpisode(chapter, ep));
      }

      this.episodeList.appendChild(tape);
    });
  }

  getStatusHtml(state) {
    switch (state) {
      case "completed":
        return '<span class="tape-status status-completed">\u2713</span>';
      case "unlocked":
        return '<span class="tape-status status-unlocked">\u25CB</span>';
      default:
        return '<span class="tape-status status-locked">\uD83D\uDD12</span>';
    }
  }

  getBadgeHtml(isShift) {
    if (isShift) {
      return '<span class="tape-type-badge badge-shift">VN + Shift</span>';
    }
    return '<span class="tape-type-badge badge-vn">VN</span>';
  }

  // ── Episode Launch ──

  openEpisode(chapter, episode) {
    // Update the VN player title card
    const subtitle = document.getElementById("ep-subtitle");
    const title = document.getElementById("ep-title");
    const completeHeading = document.getElementById("complete-heading");
    const completeTitle = document.getElementById("complete-title");
    const nextHint = document.getElementById("next-episode-hint");

    if (subtitle) subtitle.textContent = `Chapter ${chapter}`;
    if (title) title.textContent = `\u201C${episode.title}\u201D`;
    if (completeHeading) completeHeading.textContent = `Episode ${episode.episode} Complete`;
    if (completeTitle) completeTitle.textContent = `\u201C${episode.title}\u201D`;

    // Find next episode for hint text
    const chData = CHAPTERS[chapter];
    const nextEp = chData ? chData.episodes.find(e => e.episode === episode.episode + 1) : null;
    if (nextHint) {
      nextHint.textContent = nextEp
        ? `To be continued in Episode ${nextEp.episode}: \u201C${nextEp.title}\u201D`
        : "End of chapter.";
    }

    // Store current episode info for completion callback
    this._activeChapter = chapter;
    this._activeEpisode = episode.episode;

    // Transition: journal -> VN player
    this.journalScreen.classList.add("hidden-screen");
    this.vnPlayer.classList.remove("hidden-screen");

    // Reset VN player state
    const titleScreen = document.getElementById("title-screen");
    const episodeComplete = document.getElementById("episode-complete");
    if (titleScreen) titleScreen.classList.remove("hidden");
    if (episodeComplete) episodeComplete.classList.remove("visible");
  }

  // ── Return to Journal ──

  returnToJournal() {
    // Mark episode as completed
    if (this._activeChapter && this._activeEpisode) {
      this.completeEpisode(this._activeChapter, this._activeEpisode);
    }

    // Transition: VN player -> journal
    this.vnPlayer.classList.add("hidden-screen");
    this.journalScreen.classList.remove("hidden-screen");

    // Re-render current chapter to update states
    this.showChapter(this.currentChapter);
  }
}

// ── Initialize ──
let journal;
document.addEventListener("DOMContentLoaded", () => {
  journal = new JournalBook();
  // Expose globally for game.js integration
  window.journal = journal;
});

/**
 * Wish House - Cafe Shift Game Engine
 *
 * Implements the card-matching mini-game from GAMEPLAY_SPECS.md:
 * - Customer orders appear one at a time
 * - Recipe is auto-selected from the customer's order (icon + name display)
 * - Player drags / clicks ingredient cards into slots
 * - Clicks FUSE to prepare the dish/drink
 * - Correct dishes advance the shift; mistakes are tracked
 * - Shift ends after ordersRequired successful dishes or all orders served
 *
 * Relies on: cafe-data.js (INGREDIENTS, RECIPES, SHIFTS)
 *            journal.js  (window.journal for return flow)
 */

class CafeEngine {
  constructor() {
    // DOM — overlays
    this.cafeScreen      = document.getElementById("cafe-screen");
    this.shiftIntro      = document.getElementById("shift-intro");
    this.shiftIntroTitle = document.getElementById("shift-intro-title");
    this.shiftIntroDesc  = document.getElementById("shift-intro-desc");
    this.shiftIntroGoal  = document.getElementById("shift-intro-goal");
    this.shiftStartBtn   = document.getElementById("shift-start-btn");
    this.serveResult     = document.getElementById("serve-result");
    this.serveResultIcon = document.getElementById("serve-result-icon");
    this.serveResultText = document.getElementById("serve-result-text");
    this.serveNextBtn    = document.getElementById("serve-next-btn");
    this.shiftComplete   = document.getElementById("shift-complete");
    this.shiftDoneBtn    = document.getElementById("shift-done-btn");

    // DOM — HUD
    this.hudLabel        = document.getElementById("hud-shift-label");
    this.hudFill         = document.getElementById("hud-progress-fill");
    this.hudDishCount    = document.getElementById("hud-dish-count");
    this.hudStreak       = document.getElementById("hud-streak");
    this.hudMistakes     = document.getElementById("hud-mistakes");
    this.endShiftBtn     = document.getElementById("end-shift-btn");

    // DOM — customer order
    this.orderAvatar     = document.getElementById("order-avatar");
    this.orderName       = document.getElementById("order-customer-name");
    this.orderDialogue   = document.getElementById("order-dialogue");
    this.orderRecipeIcon = document.getElementById("order-recipe-icon");
    this.orderRecipeName = document.getElementById("order-recipe-name");

    // DOM — card slots, deck, fuse
    this.cardSlotsEl     = document.getElementById("card-slots");
    this.deckScroll      = document.getElementById("deck-scroll");
    this.deckTabsEl      = document.getElementById("deck-tabs");
    this.fuseBtn         = document.getElementById("fuse-btn");

    // DOM — new buttons
    this.recipeBookBtn   = document.getElementById("recipe-book-btn");
    this.backToTablesBtn = document.getElementById("back-to-tables-btn");
    this.quitShiftBtn    = document.getElementById("quit-shift-btn");
    this.quitConfirm     = document.getElementById("quit-confirm");
    this.quitYesBtn      = document.getElementById("quit-confirm-yes");
    this.quitNoBtn       = document.getElementById("quit-confirm-no");

    // DOM — recipe book modal
    this.recipeBookModal = document.getElementById("recipe-book-modal");
    this.recipeBookTabs  = document.getElementById("recipe-book-tabs");
    this.recipeBookPages = document.getElementById("recipe-book-pages");
    this.recipeBookClose = document.getElementById("recipe-book-close");

    // State
    this.shiftData       = null;
    this.orderQueue      = [];
    this.currentOrder    = null;
    this.selectedRecipe  = null;
    this.slots           = [];       // { ingredientId: string | null } per slot
    this.usedCardEls     = new Set();
    this.successCount    = 0;
    this.mistakeCount    = 0;
    this.streak          = 0;
    this.bestStreak      = 0;
    this.totalServed     = 0;
    this.activeDeckTab   = "all";
    this.activeBookTab   = "drink";

    // Deck cache: shuffled once per order, filtered by tab
    this._deckCache      = [];   // full shuffled deck for current order
    this._deckCardUsage  = {};   // { ingredientId: timesPlaced } for multi-click

    // Ingredient group -> deck tab mapping
    this._groupToTab = {
      base: "drink", dairy: "drink", temp: "drink",
      fruit: "food", vegetable: "food", protein: "food", grain: "food",
      topping: "dessert", sweetener: "dessert", spice: "dessert",
      special: "special"
    };

    // Bind events
    this.shiftStartBtn.addEventListener("click", () => this.beginShift());
    this.fuseBtn.addEventListener("click", () => this.fuse());
    this.serveNextBtn.addEventListener("click", () => this.nextOrder());
    this.shiftDoneBtn.addEventListener("click", () => this.exitShift());
    this.endShiftBtn.addEventListener("click", () => this.endShiftEarly());

    // Deck tab clicks
    this.deckTabsEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".deck-tab");
      if (tab) {
        this.activeDeckTab = tab.dataset.group;
        this.renderDeckTabs();
        this.renderDeck();
      }
    });

    // Recipe book modal
    this.recipeBookBtn.addEventListener("click", () => this.openRecipeBook());
    this.recipeBookClose.addEventListener("click", () => this.closeRecipeBook());
    this.recipeBookModal.addEventListener("click", (e) => {
      if (e.target === this.recipeBookModal) this.closeRecipeBook();
    });
    this.recipeBookTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".recipe-tab");
      if (tab) {
        this.activeBookTab = tab.dataset.category;
        this.renderRecipeBookModal();
      }
    });

    // Back to Tables
    this.backToTablesBtn.addEventListener("click", () => this.backToTables());

    // Quit Shift
    this.quitShiftBtn.addEventListener("click", () => this.showQuitConfirm());
    this.quitYesBtn.addEventListener("click", () => this.confirmQuit());
    this.quitNoBtn.addEventListener("click", () => this.cancelQuit());
  }

  /* ══════════════════════════════════
     Shift Lifecycle
     ══════════════════════════════════ */

  /**
   * Called by journal.js when opening an episode with a shiftId.
   */
  openShift(shiftId, chapter, episode) {
    this.shiftData = SHIFTS[shiftId];
    if (!this.shiftData) {
      console.error(`Shift ${shiftId} not found`);
      return;
    }

    this._chapter = chapter;
    this._episode = episode;

    // Reset state
    this.orderQueue   = [...this.shiftData.customerOrders];
    this.currentOrder = null;
    this.selectedRecipe = null;
    this.slots        = [];
    this.usedCardEls  = new Set();
    this.successCount = 0;
    this.mistakeCount = 0;
    this.streak       = 0;
    this.bestStreak   = 0;
    this.totalServed  = 0;
    this.activeDeckTab = "all";
    this._deckCache   = [];
    this._deckCardUsage = {};

    // Show intro
    this.shiftIntroTitle.textContent = this.shiftData.name;
    this.shiftIntroDesc.textContent  = this.shiftData.description;
    this.shiftIntroGoal.innerHTML    = `Serve <strong>${this.shiftData.ordersRequired}</strong> successful dishes to complete the shift.`;
    this.shiftIntro.classList.remove("hidden");
    this.shiftComplete.classList.add("hidden");
    this.serveResult.classList.add("hidden");
    this.quitConfirm.classList.add("hidden");
    this.recipeBookModal.classList.add("hidden");

    // Show cafe screen
    this.cafeScreen.classList.remove("hidden-screen");
  }

  beginShift() {
    this.shiftIntro.classList.add("hidden");
    this.updateHud();
    this.endShiftBtn.disabled = true;
    this.nextOrder();
  }

  nextOrder() {
    this.serveResult.classList.add("hidden");

    if (this.orderQueue.length === 0 || this.successCount >= this.shiftData.ordersRequired) {
      this.completeShift();
      return;
    }

    this.currentOrder = this.orderQueue.shift();

    // Auto-select recipe from order
    this.selectedRecipe = RECIPES[this.currentOrder.recipeId] || null;

    // Set up slots
    if (this.selectedRecipe) {
      this.slots = this.selectedRecipe.ingredients.map(() => ({ ingredientId: null }));
    } else {
      this.slots = [];
    }
    this.usedCardEls = new Set();
    this._deckCardUsage = {};
    this.activeDeckTab = "all";

    // Build and cache the shuffled deck for this order
    this._deckCache = this.selectedRecipe ? this.buildDeck() : [];

    this.renderCustomerOrder();
    this.renderSlots();
    this.renderDeckTabs();
    this.renderDeck();
    this.updateFuseButton();
  }

  endShiftEarly() {
    if (this.successCount >= this.shiftData.ordersRequired) {
      this.completeShift();
    }
  }

  completeShift() {
    // Rating based on mistakes (Chapter 1 is explorative, forgiving)
    let ratingIcon;
    if (this.mistakeCount === 0) ratingIcon = "\u2728\u2728\u2728";
    else if (this.mistakeCount <= 2) ratingIcon = "\u2728\u2728";
    else if (this.mistakeCount <= 4) ratingIcon = "\u2728";
    else ratingIcon = "\uD83D\uDCA5";

    document.getElementById("shift-dishes-served").textContent = `Dishes served: ${this.successCount}`;
    document.getElementById("shift-streak-final").textContent  = `Best streak: ${this.bestStreak}`;
    document.getElementById("shift-rating").textContent        = `Shift rating: ${ratingIcon}`;

    this.shiftComplete.classList.remove("hidden");
  }

  exitShift() {
    this.cafeScreen.classList.add("hidden-screen");

    // Tell journal this episode is done
    if (window.journal) {
      window.journal.onCafeShiftComplete(this._chapter, this._episode);
    }
  }

  /* ══════════════════════════════════
     Back to Tables / Quit Shift
     ══════════════════════════════════ */

  backToTables() {
    // Return to the tables/order view — for now re-renders current order
    // (Future: multi-table view. Currently single-customer flow, so this
    //  just clears slots and lets the player re-approach the same order.)
    if (!this.selectedRecipe) return;
    this.slots = this.selectedRecipe.ingredients.map(() => ({ ingredientId: null }));
    this.usedCardEls = new Set();
    this._deckCardUsage = {};
    this.renderSlots();
    this.renderDeck();
    this.updateFuseButton();
  }

  showQuitConfirm() {
    this.quitConfirm.classList.remove("hidden");
  }

  cancelQuit() {
    this.quitConfirm.classList.add("hidden");
  }

  confirmQuit() {
    this.quitConfirm.classList.add("hidden");
    this.cafeScreen.classList.add("hidden-screen");

    // Discard progress — return to journal without marking complete
    if (window.journal) {
      const journalScreen = document.getElementById("journal-screen");
      if (journalScreen) journalScreen.classList.remove("hidden-screen");
    }
  }

  /* ══════════════════════════════════
     HUD
     ══════════════════════════════════ */

  updateHud() {
    const req = this.shiftData.ordersRequired;
    this.hudLabel.textContent     = `Shift ${this.shiftData.id}`;
    this.hudFill.style.width      = `${(this.successCount / req) * 100}%`;
    this.hudDishCount.textContent  = `${this.successCount} / ${req}`;
    this.hudStreak.textContent     = `Streak: ${this.streak}`;
    this.hudMistakes.textContent   = this.mistakeCount > 0 ? "\u2753".repeat(Math.min(this.mistakeCount, 5)) : "";

    // Allow ending shift early once goal met
    this.endShiftBtn.disabled = this.successCount < req;
  }

  /* ══════════════════════════════════
     Customer Order
     ══════════════════════════════════ */

  renderCustomerOrder() {
    if (!this.currentOrder) return;
    const recipe = RECIPES[this.currentOrder.recipeId];
    const avatarEmojis = ["\uD83D\uDC64", "\uD83E\uDDD1", "\uD83D\uDC69", "\uD83D\uDC68", "\uD83D\uDC66", "\uD83D\uDC67", "\uD83E\uDDD3"];
    this.orderAvatar.textContent = avatarEmojis[this.totalServed % avatarEmojis.length];
    this.orderName.textContent    = this.currentOrder.customer;
    this.orderDialogue.textContent = `\u201C${this.currentOrder.dialogue}\u201D`;
    this.orderRecipeIcon.textContent = recipe ? recipe.icon : "";
    this.orderRecipeName.textContent = recipe ? recipe.name : "";

    // Re-trigger slide animation
    const orderEl = document.getElementById("customer-order");
    orderEl.style.animation = "none";
    void orderEl.offsetHeight;
    orderEl.style.animation = "";
  }

  /* ══════════════════════════════════
     Recipe Book Modal
     ══════════════════════════════════ */

  openRecipeBook() {
    this.activeBookTab = "drink";
    this.recipeBookModal.classList.remove("hidden");
    this.renderRecipeBookModal();
  }

  closeRecipeBook() {
    this.recipeBookModal.classList.add("hidden");
  }

  renderRecipeBookModal() {
    // Update tab highlights
    this.recipeBookTabs.querySelectorAll(".recipe-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.category === this.activeBookTab);
    });

    if (!this.shiftData) return;

    const available = this.shiftData.availableRecipes
      .map(id => RECIPES[id])
      .filter(r => r && r.category.startsWith(this.activeBookTab));

    this.recipeBookPages.innerHTML = "";

    if (available.length === 0) {
      this.recipeBookPages.innerHTML = `<div style="padding:16px;color:var(--text-light);font-size:0.82rem;font-style:italic;">No ${this.activeBookTab} recipes this shift.</div>`;
      return;
    }

    available.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      const ingredientIcons = recipe.ingredients
        .map(ingId => {
          const ing = INGREDIENTS[ingId];
          return ing ? `<span class="recipe-ingredient-icon" title="${ing.name}">${ing.icon}</span>` : "";
        })
        .join("");

      card.innerHTML = `
        <div class="recipe-card-icon">${recipe.icon}</div>
        <div class="recipe-card-name">${recipe.name}</div>
        <div class="recipe-card-ingredients">${ingredientIcons}</div>
      `;

      this.recipeBookPages.appendChild(card);
    });
  }

  /* ══════════════════════════════════
     Card Slots
     ══════════════════════════════════ */

  renderSlots() {
    this.cardSlotsEl.innerHTML = "";

    if (!this.selectedRecipe) {
      this.cardSlotsEl.innerHTML = `<div style="color:var(--text-light);font-size:0.78rem;font-style:italic;padding:16px;">Waiting for order...</div>`;
      return;
    }

    this.slots.forEach((slot, idx) => {
      const slotEl = document.createElement("div");
      slotEl.className = "card-slot";

      if (slot.ingredientId) {
        const ing = INGREDIENTS[slot.ingredientId];
        slotEl.classList.add("filled");

        // Check correctness
        const requiredId = this.selectedRecipe.ingredients[idx];
        const isCorrect = slot.ingredientId === requiredId || slot.ingredientId === "wild";
        if (isCorrect) slotEl.classList.add("correct");

        slotEl.innerHTML = `<div class="slot-ingredient">
          <span class="slot-icon">${ing ? ing.icon : "?"}</span>
          <span class="slot-name">${ing ? ing.name : ""}</span>
        </div>`;

        // Click to remove
        slotEl.addEventListener("click", () => this.removeFromSlot(idx));
      } else {
        slotEl.textContent = "+";

        // Click to place the next selected card (if using click-to-place)
        slotEl.addEventListener("click", () => {
          if (this._pendingIngredient) {
            this.placeInSlot(idx, this._pendingIngredient.id, this._pendingIngredient.el);
            this._pendingIngredient = null;
          }
        });
      }

      // Drag-and-drop: slot as drop target
      slotEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!slot.ingredientId) slotEl.classList.add("drag-over");
      });
      slotEl.addEventListener("dragleave", () => {
        slotEl.classList.remove("drag-over");
      });
      slotEl.addEventListener("drop", (e) => {
        e.preventDefault();
        slotEl.classList.remove("drag-over");
        const ingId = e.dataTransfer.getData("text/plain");
        if (ingId && !slot.ingredientId) {
          // Find the card element in the deck
          const cardEl = this.deckScroll.querySelector(`.ingredient-card[data-ingredient-id="${ingId}"]:not(.used)`);
          this.placeInSlot(idx, ingId, cardEl);
        }
      });

      this.cardSlotsEl.appendChild(slotEl);
    });
  }

  placeInSlot(slotIdx, ingredientId, cardEl) {
    if (this.slots[slotIdx].ingredientId) return; // already filled

    this.slots[slotIdx].ingredientId = ingredientId;

    const ing = INGREDIENTS[ingredientId];
    const isMultiUse = ing && !ing.isSpecial && ing.group !== "temp";

    if (cardEl) {
      if (isMultiUse) {
        // Track usage count for multi-click cards
        this._deckCardUsage[ingredientId] = (this._deckCardUsage[ingredientId] || 0) + 1;
        this.renderDeck(); // re-render to update badge
      } else {
        cardEl.classList.add("used");
        this.usedCardEls.add(cardEl);
      }
    }

    this.renderSlots();
    this.updateFuseButton();
  }

  removeFromSlot(slotIdx) {
    const removed = this.slots[slotIdx].ingredientId;
    this.slots[slotIdx].ingredientId = null;

    // Un-mark the card in the deck
    if (removed) {
      const ing = INGREDIENTS[removed];
      const isMultiUse = ing && !ing.isSpecial && ing.group !== "temp";

      if (isMultiUse) {
        if (this._deckCardUsage[removed]) {
          this._deckCardUsage[removed]--;
          if (this._deckCardUsage[removed] <= 0) delete this._deckCardUsage[removed];
        }
        this.renderDeck();
      } else {
        this.usedCardEls.forEach(el => {
          if (el.dataset.ingredientId === removed && el.classList.contains("used")) {
            el.classList.remove("used");
            this.usedCardEls.delete(el);
          }
        });
      }
    }

    this.renderSlots();
    this.updateFuseButton();
  }

  /* ══════════════════════════════════
     Ingredient Deck
     ══════════════════════════════════ */

  renderDeckTabs() {
    this.deckTabsEl.querySelectorAll(".deck-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.group === this.activeDeckTab);
    });
  }

  renderDeck() {
    this.deckScroll.innerHTML = "";

    if (!this.selectedRecipe) return;

    // Filter cached deck by active tab
    const filtered = this.activeDeckTab === "all"
      ? this._deckCache
      : this._deckCache.filter(ingId => {
          const ing = INGREDIENTS[ingId];
          if (!ing) return false;
          return this._groupToTab[ing.group] === this.activeDeckTab;
        });

    filtered.forEach(ingId => {
      const ing = INGREDIENTS[ingId];
      if (!ing) return;

      const card = document.createElement("div");
      card.className = "ingredient-card";
      card.dataset.ingredientId = ingId;
      if (ing.isSpecial) card.classList.add("special-card");

      const isMultiUse = !ing.isSpecial && ing.group !== "temp";
      const usageCount = this._deckCardUsage[ingId] || 0;

      card.innerHTML = `
        <span class="card-icon">${ing.icon}</span>
        <span class="card-name">${ing.name}</span>
        ${usageCount > 0 ? `<span class="card-use-count">${usageCount}</span>` : ""}
      `;

      // Mark single-use cards as used
      if (!isMultiUse && this.usedCardEls.has(card)) {
        card.classList.add("used");
      }
      // Restore used state for non-multi-use cards from previous renders
      if (!isMultiUse) {
        const isUsed = [...this.usedCardEls].some(
          el => el.dataset.ingredientId === ingId
        );
        if (isUsed) card.classList.add("used");
      }

      // Click to place in first empty slot
      card.addEventListener("click", () => {
        if (card.classList.contains("used")) return;

        const emptyIdx = this.slots.findIndex(s => s.ingredientId === null);
        if (emptyIdx !== -1) {
          this.placeInSlot(emptyIdx, ingId, card);
        }
      });

      // Drag support
      card.draggable = true;
      card.addEventListener("dragstart", (e) => {
        if (card.classList.contains("used")) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", ingId);
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      this.deckScroll.appendChild(card);
    });

    this.highlightMatchingCards();
  }

  buildDeck() {
    const required = [...this.selectedRecipe.ingredients];

    // Add distractor ingredients (some from the full pool)
    const allIngIds = Object.keys(INGREDIENTS).filter(id => !INGREDIENTS[id].isSpecial);
    const distractors = [];
    const shuffled = allIngIds.sort(() => Math.random() - 0.5);

    for (const id of shuffled) {
      if (!required.includes(id) && distractors.length < 5) {
        distractors.push(id);
      }
    }

    // Combine and shuffle
    const deck = [...required, ...distractors, "wild"];
    return this.shuffle(deck);
  }

  highlightMatchingCards() {
    if (!this.selectedRecipe) return;
    const needed = new Set(this.selectedRecipe.ingredients);

    this.deckScroll.querySelectorAll(".ingredient-card").forEach(card => {
      if (needed.has(card.dataset.ingredientId)) {
        card.classList.add("highlight");
      }
    });
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ══════════════════════════════════
     FUSE
     ══════════════════════════════════ */

  updateFuseButton() {
    const allFilled = this.slots.length > 0 && this.slots.every(s => s.ingredientId !== null);
    this.fuseBtn.disabled = !allFilled;
  }

  async fuse() {
    if (this.fuseBtn.disabled) return;

    // Determine correctness
    const isCorrect = this.checkRecipeCorrect();
    const isTargetRecipe = this.selectedRecipe.id === this.currentOrder.recipeId;

    // Play fuse animation
    await this.playFuseAnimation(this.selectedRecipe);

    this.totalServed++;

    if (isCorrect && isTargetRecipe) {
      this.successCount++;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      this.showServeResult(true, this.selectedRecipe);
    } else {
      this.mistakeCount++;
      this.streak = 0;
      const reason = !isTargetRecipe
        ? `Wrong recipe! ${this.currentOrder.customer} ordered ${RECIPES[this.currentOrder.recipeId].name}.`
        : "Wrong ingredients! The recipe didn\u2019t turn out right.";
      this.showServeResult(false, this.selectedRecipe, reason);
    }

    this.updateHud();
  }

  checkRecipeCorrect() {
    if (!this.selectedRecipe) return false;

    return this.slots.every((slot, idx) => {
      const required = this.selectedRecipe.ingredients[idx];
      return slot.ingredientId === required || slot.ingredientId === "wild";
    });
  }

  async playFuseAnimation(recipe) {
    const overlay = document.createElement("div");
    overlay.className = "fuse-animation-overlay";

    const category = recipe.category;
    const animIcon = category.startsWith("drink") ? "\u2615\u2728" : "\uD83E\uDDD9\u2728";
    const animText = category.startsWith("drink") ? "Brewing..." : "Conjuring...";

    overlay.innerHTML = `
      <div class="fuse-anim-content">
        <div class="fuse-anim-icon">${animIcon}</div>
        <div class="fuse-anim-text">${animText}</div>
      </div>
    `;

    this.cafeScreen.appendChild(overlay);
    await this.sleep(1200);
    overlay.remove();
  }

  showServeResult(success, recipe, reason) {
    this.serveResultIcon.textContent = success ? "\u2728" : "\uD83D\uDE1E";
    this.serveResultText.textContent = success
      ? `${recipe.name} served successfully!`
      : reason || "Something went wrong...";

    // Change button text if shift is complete
    const shiftDone = this.successCount >= this.shiftData.ordersRequired || this.orderQueue.length === 0;
    this.serveNextBtn.textContent = shiftDone ? "Finish Shift" : "Next Order";

    this.serveResult.classList.remove("hidden");
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ── Initialize ──
let cafe;
document.addEventListener("DOMContentLoaded", () => {
  cafe = new CafeEngine();
  window.cafe = cafe;
});

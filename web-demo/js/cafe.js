/**
 * Wish House - Cafe Shift Game Engine
 *
 * Implements the card-matching mini-game from GAMEPLAY_SPECS.md:
 * - Customer orders appear one at a time
 * - Player selects a recipe from the recipe book
 * - Drags ingredient cards into slots
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

    // DOM — recipe book
    this.recipeTabs      = document.getElementById("recipe-tabs");
    this.recipePages     = document.getElementById("recipe-pages");

    // DOM — card slots, deck, fuse
    this.cardSlotsEl     = document.getElementById("card-slots");
    this.deckScroll      = document.getElementById("deck-scroll");
    this.fuseBtn         = document.getElementById("fuse-btn");

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
    this.activeTab       = "drink";

    // Bind events
    this.shiftStartBtn.addEventListener("click", () => this.beginShift());
    this.fuseBtn.addEventListener("click", () => this.fuse());
    this.serveNextBtn.addEventListener("click", () => this.nextOrder());
    this.shiftDoneBtn.addEventListener("click", () => this.exitShift());
    this.endShiftBtn.addEventListener("click", () => this.endShiftEarly());

    // Tab clicks
    this.recipeTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".recipe-tab");
      if (tab) {
        this.activeTab = tab.dataset.category;
        this.renderRecipeTabs();
        this.renderRecipeBook();
      }
    });
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
    this.activeTab    = "drink";

    // Show intro
    this.shiftIntroTitle.textContent = this.shiftData.name;
    this.shiftIntroDesc.textContent  = this.shiftData.description;
    this.shiftIntroGoal.innerHTML    = `Serve <strong>${this.shiftData.ordersRequired}</strong> successful dishes to complete the shift.`;
    this.shiftIntro.classList.remove("hidden");
    this.shiftComplete.classList.add("hidden");
    this.serveResult.classList.add("hidden");

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
    this.selectedRecipe = null;
    this.slots = [];
    this.usedCardEls = new Set();

    this.renderCustomerOrder();
    this.renderRecipeTabs();
    this.renderRecipeBook();
    this.renderSlots();
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
      // Show the VN player episode-complete screen if the episode also has VN content,
      // otherwise go straight back to journal
      window.journal.onCafeShiftComplete(this._chapter, this._episode);
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
    this.hudMistakes.textContent   = this.mistakeCount > 0 ? "?".repeat(Math.min(this.mistakeCount, 5)) : "";

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
     Recipe Book
     ══════════════════════════════════ */

  renderRecipeTabs() {
    this.recipeTabs.querySelectorAll(".recipe-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.category === this.activeTab);
    });
  }

  renderRecipeBook() {
    if (!this.shiftData) return;

    const available = this.shiftData.availableRecipes
      .map(id => RECIPES[id])
      .filter(r => r && r.category.startsWith(this.activeTab));

    this.recipePages.innerHTML = "";

    if (available.length === 0) {
      this.recipePages.innerHTML = `<div style="padding:16px;color:var(--text-light);font-size:0.82rem;font-style:italic;">No ${this.activeTab} recipes this shift.</div>`;
      return;
    }

    const targetRecipeId = this.currentOrder ? this.currentOrder.recipeId : null;

    available.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      if (this.selectedRecipe && this.selectedRecipe.id === recipe.id) card.classList.add("selected");
      if (targetRecipeId === recipe.id) card.classList.add("recipe-match");

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

      card.addEventListener("click", () => this.selectRecipe(recipe));
      this.recipePages.appendChild(card);
    });
  }

  selectRecipe(recipe) {
    this.selectedRecipe = recipe;

    // Create empty slots matching ingredient count
    this.slots = recipe.ingredients.map(() => ({ ingredientId: null }));
    this.usedCardEls = new Set();

    this.renderRecipeBook();
    this.renderSlots();
    this.renderDeck();
    this.updateFuseButton();
  }

  /* ══════════════════════════════════
     Card Slots
     ══════════════════════════════════ */

  renderSlots() {
    this.cardSlotsEl.innerHTML = "";

    if (!this.selectedRecipe) {
      this.cardSlotsEl.innerHTML = `<div style="color:var(--text-light);font-size:0.78rem;font-style:italic;padding:16px;">Select a recipe from the book above.</div>`;
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

      this.cardSlotsEl.appendChild(slotEl);
    });
  }

  placeInSlot(slotIdx, ingredientId, cardEl) {
    if (this.slots[slotIdx].ingredientId) return; // already filled

    this.slots[slotIdx].ingredientId = ingredientId;
    if (cardEl) {
      cardEl.classList.add("used");
      this.usedCardEls.add(cardEl);
    }

    this.renderSlots();
    this.updateFuseButton();
  }

  removeFromSlot(slotIdx) {
    const removed = this.slots[slotIdx].ingredientId;
    this.slots[slotIdx].ingredientId = null;

    // Un-mark the card in the deck
    if (removed) {
      this.usedCardEls.forEach(el => {
        if (el.dataset.ingredientId === removed && el.classList.contains("used")) {
          el.classList.remove("used");
          this.usedCardEls.delete(el);
        }
      });
    }

    this.renderSlots();
    this.updateFuseButton();
  }

  /* ══════════════════════════════════
     Ingredient Deck
     ══════════════════════════════════ */

  renderDeck() {
    this.deckScroll.innerHTML = "";

    if (!this.selectedRecipe) return;

    // Build deck: required ingredients + distractors + 1 wild card
    const deckIds = this.buildDeck();

    deckIds.forEach(ingId => {
      const ing = INGREDIENTS[ingId];
      if (!ing) return;

      const card = document.createElement("div");
      card.className = "ingredient-card";
      card.dataset.ingredientId = ingId;
      if (ing.isSpecial) card.classList.add("special-card");

      card.innerHTML = `
        <span class="card-icon">${ing.icon}</span>
        <span class="card-name">${ing.name}</span>
      `;

      // Click to select, then click a slot to place
      card.addEventListener("click", () => {
        if (card.classList.contains("used")) return;

        // Find first empty slot and place directly
        const emptyIdx = this.slots.findIndex(s => s.ingredientId === null);
        if (emptyIdx !== -1) {
          this.placeInSlot(emptyIdx, ingId, card);
        }
      });

      this.deckScroll.appendChild(card);
    });

    // Highlight ingredients that match the recipe
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

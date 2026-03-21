/**
 * Wish House - Cafe Shift Game Engine
 *
 * Flow: Shift Intro -> Table Zone -> Craft View -> Table Zone (loop)
 *
 * Table Zone: 6 cafe tables in a 2x3 grid. Customers appear at tables
 * with speech bubbles. Player clicks a table to take the order and
 * transition to the Craft View.
 *
 * Craft View: Recipe auto-selected from order, player fills ingredient
 * slots, clicks FUSE. After serving, returns to Table Zone with food
 * delivery animation (hearts, customer eats, cleanup).
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

    // DOM — table zone
    this.tableZone       = document.getElementById("table-zone");
    this.cafeRoom        = document.getElementById("cafe-room");
    this.baristaSprite   = document.getElementById("barista-sprite");

    // DOM — craft view
    this.craftView       = document.getElementById("craft-view");
    this.orderAvatar     = document.getElementById("order-avatar");
    this.orderName       = document.getElementById("order-customer-name");
    this.orderDialogue   = document.getElementById("order-dialogue");
    this.orderRecipeIcon = document.getElementById("order-recipe-icon");
    this.orderRecipeName = document.getElementById("order-recipe-name");

    // DOM — card slots, deck, fuse
    this.cardSlotsEl     = document.getElementById("card-slots");
    this.revertBtn       = document.getElementById("revert-slots-btn");
    this.deckScroll      = document.getElementById("deck-scroll");
    this.deckTabsEl      = document.getElementById("deck-tabs");
    this.fuseBtn         = document.getElementById("fuse-btn");

    // DOM — buttons
    this.recipeBookBtn   = document.getElementById("recipe-book-btn");
    this.backToTablesBtn = document.getElementById("back-to-tables-btn");
    this.quitShiftBtn    = document.getElementById("quit-shift-btn");
    this.quitConfirm     = document.getElementById("quit-confirm");
    this.quitYesBtn      = document.getElementById("quit-confirm-yes");
    this.quitNoBtn       = document.getElementById("quit-confirm-no");

    // DOM — recipe book modal
    this.recipeBookModal = document.getElementById("recipe-book-modal");
    this.recipeBookTabs  = document.getElementById("recipe-book-tabs");
    this.recipeBookClose = document.getElementById("recipe-book-close");
    this.recipePageLeft  = this.recipeBookModal.querySelector(".recipe-page-left");
    this.recipePageRight = this.recipeBookModal.querySelector(".recipe-page-right");
    this.recipePagePrev  = document.getElementById("recipe-page-prev");
    this.recipePageNext  = document.getElementById("recipe-page-next");
    this.recipePageIndicator = document.getElementById("recipe-page-indicator");

    // State
    this.shiftData       = null;
    this.orderQueue      = [];
    this.currentOrder    = null;
    this.selectedRecipe  = null;
    this.slots           = [];
    this.usedCardEls     = new Set();
    this.successCount    = 0;
    this.mistakeCount    = 0;
    this.streak          = 0;
    this.bestStreak      = 0;
    this.totalServed     = 0;
    this.activeDeckTab   = "all";
    this.activeBookTab   = "drink";
    this._bookPage       = 0;         // current page spread index
    this._bookRecipes    = [];        // filtered recipe list for current tab
    this._deckCache      = [];
    this._deckCardUsage  = {};

    // Table state: tracks which table has which order
    // { tableNum: { order, state: 'waiting'|'ordering'|'crafting'|'served'|'eating'|'messy'|'clean' } }
    this.tables          = {};
    this._activeTableNum = null;  // which table the player is crafting for

    // Avatars for customers
    this._avatarEmojis = ["\uD83D\uDC64", "\uD83E\uDDD1", "\uD83D\uDC69", "\uD83D\uDC68", "\uD83D\uDC66", "\uD83D\uDC67", "\uD83E\uDDD3"];

    // Ingredient group -> deck tab mapping
    this._groupToTab = {
      base: "base",
      fruit: "produce", vegetable: "produce",
      topping: "toppings", sweetener: "toppings", spice: "toppings",
      dairy: "dairy", protein: "dairy", grain: "dairy",
      temp: "temp",
      special: "special"
    };

    // Bind events
    this.shiftStartBtn.addEventListener("click", () => this.beginShift());
    this.fuseBtn.addEventListener("click", () => this.fuse());
    this.revertBtn.addEventListener("click", () => this.revertAllSlots());
    this.serveNextBtn.addEventListener("click", () => this.afterServeResult());
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
        this._bookPage = 0;
        this.renderRecipeBookModal();
      }
    });
    this.recipePagePrev.addEventListener("click", () => {
      if (this._bookPage > 0) { this._bookPage--; this.renderRecipeBookModal(); }
    });
    this.recipePageNext.addEventListener("click", () => {
      const totalPages = Math.ceil(this._bookRecipes.length / 4);
      if (this._bookPage < totalPages - 1) { this._bookPage++; this.renderRecipeBookModal(); }
    });

    // Back to Tables
    this.backToTablesBtn.addEventListener("click", () => this.backToTables());

    // Quit Shift
    this.quitShiftBtn.addEventListener("click", () => this.showQuitConfirm());
    this.quitYesBtn.addEventListener("click", () => this.confirmQuit());
    this.quitNoBtn.addEventListener("click", () => this.cancelQuit());

    // Table clicks (delegated)
    this.cafeRoom.addEventListener("click", (e) => {
      const tableEl = e.target.closest(".cafe-table");
      if (!tableEl) return;
      const num = parseInt(tableEl.dataset.table);
      this.onTableClick(num);
    });
  }

  /* ══════════════════════════════════
     Shift Lifecycle
     ══════════════════════════════════ */

  openShift(shiftId, chapter, episode) {
    this.shiftData = SHIFTS[shiftId];
    if (!this.shiftData) {
      console.error(`Shift ${shiftId} not found`);
      return;
    }

    this._chapter = chapter;
    this._episode = episode;

    // Reset state
    this.orderQueue     = [...this.shiftData.customerOrders];
    this.currentOrder   = null;
    this.selectedRecipe = null;
    this.slots          = [];
    this.usedCardEls    = new Set();
    this.successCount   = 0;
    this.mistakeCount   = 0;
    this.streak         = 0;
    this.bestStreak     = 0;
    this.totalServed    = 0;
    this.activeDeckTab  = "all";
    this._deckCache     = [];
    this._deckCardUsage = {};
    this.tables         = {};
    this._activeTableNum = null;

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

    // Set barista sprite
    this.baristaSprite.textContent = "\u2615";

    // Show table zone, hide craft view
    this.showTableZone();

    // Seat the first batch of customers
    this.seatNextCustomers();
  }

  /* ══════════════════════════════════
     Table Zone
     ══════════════════════════════════ */

  showTableZone() {
    this.tableZone.classList.remove("hidden");
    this.craftView.classList.add("hidden");
    this.renderAllTables();
  }

  showCraftView() {
    this.tableZone.classList.add("hidden");
    this.craftView.classList.remove("hidden");
  }

  /**
   * Seat customers at empty tables from the order queue.
   * Up to 3 customers at a time across the 6 tables.
   */
  seatNextCustomers() {
    if (this.orderQueue.length === 0) {
      // No more orders — check if shift is done
      const hasActive = Object.values(this.tables).some(t => t);
      if (!hasActive && this.successCount >= this.shiftData.ordersRequired) {
        this.completeShift();
      }
      return;
    }

    const emptyTables = [1, 2, 3, 4, 5, 6].filter(n => !this.tables[n]);
    const shuffledEmpty = this.shuffle([...emptyTables]);

    // Seat up to 3 new customers (or however many orders remain / tables available)
    const toSeat = Math.min(3, this.orderQueue.length, shuffledEmpty.length);

    for (let i = 0; i < toSeat; i++) {
      const order = this.orderQueue.shift();
      const tableNum = shuffledEmpty[i];
      const avatarIdx = (this.totalServed + Object.keys(this.tables).length + i) % this._avatarEmojis.length;

      this.tables[tableNum] = {
        order,
        state: "ordering",
        avatar: this._avatarEmojis[avatarIdx],
        recipe: RECIPES[order.recipeId] || null
      };
    }

    this.renderAllTables();
  }

  renderAllTables() {
    for (let n = 1; n <= 6; n++) {
      this.renderTable(n);
    }
  }

  renderTable(tableNum) {
    const el = this.cafeRoom.querySelector(`.cafe-table[data-table="${tableNum}"]`);
    if (!el) return;

    const surface = el.querySelector(".table-surface");
    const seatA = el.querySelector(".seat-a");
    const seatB = el.querySelector(".seat-b");
    const foodSlot = el.querySelector(".food-slot");
    const overlay = el.querySelector(".table-overlay");

    // Clear dynamic elements
    el.classList.remove("has-customer", "served", "messy");
    seatA.className = "seat seat-a empty";
    seatA.textContent = "";
    seatB.className = "seat seat-b empty";
    seatB.textContent = "";
    foodSlot.className = "food-slot";
    foodSlot.textContent = "";
    overlay.className = "table-overlay";
    overlay.textContent = "";

    // Remove any speech bubble
    const existingBubble = el.querySelector(".table-order-bubble");
    if (existingBubble) existingBubble.remove();

    const tableData = this.tables[tableNum];
    if (!tableData) return; // empty table

    const { order, state, avatar, recipe } = tableData;

    // Customer seated
    if (state === "ordering" || state === "crafting") {
      el.classList.add("has-customer");
      seatA.className = "seat seat-a occupied";
      seatA.textContent = avatar;

      if (state === "ordering") {
        // Show speech bubble outside the table
        const bubble = document.createElement("div");
        bubble.className = "table-order-bubble";
        bubble.innerHTML = recipe
          ? `<span class="bubble-icon">${recipe.icon}</span> ${recipe.name}`
          : `<span class="bubble-dialogue">${order.dialogue}</span>`;
        el.appendChild(bubble);
      }
    }

    if (state === "served") {
      el.classList.add("served");
      seatA.className = "seat seat-a occupied";
      seatA.textContent = avatar;
      foodSlot.className = "food-slot has-food";
      foodSlot.textContent = recipe ? recipe.icon : "\uD83C\uDF7D";
      overlay.className = "table-overlay glow";
    }

    if (state === "eating") {
      seatA.className = "seat seat-a occupied";
      seatA.textContent = avatar;
      foodSlot.className = "food-slot has-food";
      foodSlot.textContent = recipe ? recipe.icon : "\uD83C\uDF7D";
      overlay.className = "table-overlay hearts";
    }

    if (state === "messy") {
      el.classList.add("messy");
      foodSlot.className = "food-slot has-food clickable";
      foodSlot.textContent = "\uD83E\uDDFD";  // sponge emoji — click to clean
    }
  }

  onTableClick(tableNum) {
    const tableData = this.tables[tableNum];
    if (!tableData) return;

    if (tableData.state === "messy") {
      this.cleanTable(tableNum);
      return;
    }

    if (tableData.state === "ordering") {
      // Take this order -> go to craft view
      this._activeTableNum = tableNum;
      tableData.state = "crafting";
      this.currentOrder = tableData.order;
      this.selectedRecipe = tableData.recipe;

      // Set up craft view
      if (this.selectedRecipe) {
        this.slots = this.selectedRecipe.ingredients.map(() => ({ ingredientId: null }));
      } else {
        this.slots = [];
      }
      this.usedCardEls = new Set();
      this._deckCardUsage = {};
      this.activeDeckTab = "all";
      this._deckCache = this.selectedRecipe ? this.buildDeck() : [];

      this.renderCustomerOrder();
      this.renderSlots();
      this.renderDeckTabs();
      this.renderDeck();
      this.updateFuseButton();

      // Transition to craft view
      this.showCraftView();
    }
  }

  async deliverFood(tableNum, success) {
    const tableData = this.tables[tableNum];
    if (!tableData) return;

    if (success) {
      // Barista slide animation
      this.baristaSprite.classList.add("sliding");
      await this.sleep(600);
      this.baristaSprite.classList.remove("sliding");

      // Food placed
      tableData.state = "served";
      this.renderTable(tableNum);
      await this.sleep(800);

      // Customer eating
      tableData.state = "eating";
      this.renderTable(tableNum);
      await this.sleep(1200);

      // Customer leaves, table messy
      tableData.state = "messy";
      this.renderTable(tableNum);
    } else {
      // Failed dish — customer leaves disappointed, table goes messy
      tableData.state = "messy";
      this.renderTable(tableNum);
    }
  }

  cleanTable(tableNum) {
    delete this.tables[tableNum];
    this.renderTable(tableNum);

    // Seat more customers at any empty tables
    this.seatNextCustomers();
  }

  /* ══════════════════════════════════
     Back to Tables / Quit Shift
     ══════════════════════════════════ */

  backToTables() {
    // Return to table zone, cancel current crafting
    if (this._activeTableNum && this.tables[this._activeTableNum]) {
      this.tables[this._activeTableNum].state = "ordering"; // reset to waiting
    }
    this._activeTableNum = null;
    this.currentOrder = null;
    this.selectedRecipe = null;
    this.showTableZone();
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

    if (window.journal) {
      const journalScreen = document.getElementById("journal-screen");
      if (journalScreen) journalScreen.classList.remove("hidden-screen");
    }
  }

  endShiftEarly() {
    if (this.successCount >= this.shiftData.ordersRequired) {
      this.completeShift();
    }
  }

  completeShift() {
    // Rating per mistake meter spec
    let ratingIcon, ratingLabel;
    if (this.mistakeCount === 0) {
      ratingIcon = "\u2728\u2728\u2728";
      ratingLabel = "Perfect shift!";
    } else if (this.mistakeCount <= 2) {
      ratingIcon = "\u2728\u2728";
      ratingLabel = "Great work!";
    } else if (this.mistakeCount <= 4) {
      ratingIcon = "\u2728";
      ratingLabel = "Not bad!";
    } else {
      ratingIcon = "\uD83D\uDCA5";
      ratingLabel = "Rough shift...";
    }

    document.getElementById("shift-dishes-served").textContent = `Dishes served: ${this.successCount}`;
    document.getElementById("shift-streak-final").textContent  = `Best streak: ${this.bestStreak}`;
    document.getElementById("shift-rating").textContent        = `${ratingIcon} ${ratingLabel}`;

    this.shiftComplete.classList.remove("hidden");
  }

  exitShift() {
    this.cafeScreen.classList.add("hidden-screen");

    if (window.journal) {
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

    // Mistake meter per spec: sparkles at 0, faded ? at 1-4, explosion at 5+
    if (this.mistakeCount === 0) {
      this.hudMistakes.textContent = "\u2728";
    } else if (this.mistakeCount < 5) {
      this.hudMistakes.textContent = "\u2753".repeat(this.mistakeCount);
      this.hudMistakes.style.opacity = `${0.4 + this.mistakeCount * 0.15}`;
    } else {
      this.hudMistakes.textContent = "\uD83D\uDCA5";
      this.hudMistakes.style.opacity = "1";
    }

    this.endShiftBtn.disabled = this.successCount < req;
  }

  /* ══════════════════════════════════
     Customer Order (craft view banner)
     ══════════════════════════════════ */

  renderCustomerOrder() {
    if (!this.currentOrder) return;
    const recipe = RECIPES[this.currentOrder.recipeId];
    const tableData = this.tables[this._activeTableNum];
    this.orderAvatar.textContent = tableData ? tableData.avatar : "\uD83D\uDC64";
    this.orderName.textContent    = this.currentOrder.customer;
    this.orderDialogue.textContent = `\u201C${this.currentOrder.dialogue}\u201D`;
    this.orderRecipeIcon.textContent = recipe ? recipe.icon : "";
    this.orderRecipeName.textContent = recipe ? recipe.name : "";

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
    this._bookPage = 0;
    this.recipeBookModal.classList.remove("hidden");
    this.renderRecipeBookModal();
  }

  closeRecipeBook() {
    this.recipeBookModal.classList.add("hidden");
  }

  /**
   * Renders the recipe book using ALL recipes from the RECIPES global,
   * filtered by the active category tab. 4 recipes per spread (2 per page),
   * with prev/next pagination.
   */
  renderRecipeBookModal() {
    // Update tab highlights
    this.recipeBookTabs.querySelectorAll(".recipe-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.category === this.activeBookTab);
    });

    // Gather ALL recipes matching the active tab from the global RECIPES dict
    // Sort by subcategory then name for grouping
    this._bookRecipes = Object.values(RECIPES)
      .filter(r => r && r.category && r.category.startsWith(this.activeBookTab))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    const recipes = this._bookRecipes;
    const perSpread = 4; // 2 per page, 2 pages
    const totalPages = Math.max(1, Math.ceil(recipes.length / perSpread));

    // Clamp page
    if (this._bookPage >= totalPages) this._bookPage = totalPages - 1;
    if (this._bookPage < 0) this._bookPage = 0;

    const start = this._bookPage * perSpread;
    const pageRecipes = recipes.slice(start, start + perSpread);
    const leftRecipes = pageRecipes.slice(0, 2);
    const rightRecipes = pageRecipes.slice(2, 4);

    // Get tab display name
    const tabNames = { drink: "Drinks", food: "Food", dessert: "Desserts", specials: "Specials" };
    const tabName = tabNames[this.activeBookTab] || this.activeBookTab;

    // Collect subcategories for each page's recipes
    const getSubcats = (arr) => [...new Set(arr.map(r => {
      if (!r.category.includes("-")) return tabName;
      return r.category.split("-").slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }))];

    // Render left page
    this._renderBookPage(this.recipePageLeft, leftRecipes, tabName, getSubcats(leftRecipes));
    // Render right page
    this._renderBookPage(this.recipePageRight, rightRecipes, tabName, getSubcats(rightRecipes));

    // Pagination controls
    this.recipePagePrev.disabled = this._bookPage <= 0;
    this.recipePageNext.disabled = this._bookPage >= totalPages - 1;
    this.recipePageIndicator.textContent = `${this._bookPage + 1} / ${totalPages}`;
  }

  _renderBookPage(pageEl, recipes, tabName, subcategories) {
    // Keep the page-texture div, remove everything else
    const texture = pageEl.querySelector(".page-texture");
    pageEl.innerHTML = "";
    if (texture) pageEl.appendChild(texture);

    // Add category header (subcategories only, main category is on the tab)
    if (recipes.length > 0 && subcategories.length > 0) {
      const header = document.createElement("div");
      header.className = "recipe-page-header";
      header.textContent = subcategories.join(", ");
      pageEl.appendChild(header);
    }

    if (recipes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "recipe-page-empty";
      empty.textContent = "No recipes here yet...";
      pageEl.appendChild(empty);
      return;
    }

    recipes.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      // Format subcategory label (e.g. "drink-coffee" -> "Coffee")
      const subcat = recipe.category.includes("-")
        ? recipe.category.split("-").slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "";

      const ingredientIcons = recipe.ingredients
        .map(ingId => {
          const ing = INGREDIENTS[ingId];
          return ing ? `<span class="recipe-ingredient-icon"><span class="ri-icon">${ing.icon}</span><span class="ri-name">${ing.name}</span></span>` : "";
        })
        .join("");

      card.innerHTML = `
        <div class="recipe-card-icon">${recipe.icon}</div>
        <div class="recipe-card-name">${recipe.name}</div>
        ${subcat ? `<div class="recipe-card-subcategory">${subcat}</div>` : ""}
        <div class="recipe-card-ingredients">${ingredientIcons}</div>
      `;

      pageEl.appendChild(card);
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

        // Check if this ingredient is in the recipe (order doesn't matter)
        const isCorrect = slot.ingredientId === "wild" ||
          this.selectedRecipe.ingredients.includes(slot.ingredientId);
        if (isCorrect) slotEl.classList.add("correct");

        slotEl.innerHTML = `<div class="slot-ingredient">
          <span class="slot-icon">${ing ? ing.icon : "?"}</span>
          <span class="slot-name">${ing ? ing.name : ""}</span>
        </div>`;

        slotEl.addEventListener("click", () => this.removeFromSlot(idx));
      } else {
        slotEl.textContent = "+";

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
          const cardEl = this.deckScroll.querySelector(`.ingredient-card[data-ingredient-id="${ingId}"]:not(.used)`);
          this.placeInSlot(idx, ingId, cardEl);
        }
      });

      this.cardSlotsEl.appendChild(slotEl);
    });
  }

  placeInSlot(slotIdx, ingredientId, cardEl) {
    if (this.slots[slotIdx].ingredientId) return;

    this.slots[slotIdx].ingredientId = ingredientId;

    const ing = INGREDIENTS[ingredientId];
    const isMultiUse = ing && !ing.isSpecial && ing.group !== "temp";

    if (cardEl) {
      if (isMultiUse) {
        this._deckCardUsage[ingredientId] = (this._deckCardUsage[ingredientId] || 0) + 1;
        this.renderDeck();
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

  revertAllSlots() {
    if (!this.selectedRecipe) return;
    this.slots = this.selectedRecipe.ingredients.map(() => ({ ingredientId: null }));
    this.usedCardEls = new Set();
    this._deckCardUsage = {};
    this.renderSlots();
    this.renderDeck();
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

      if (!isMultiUse) {
        const isUsed = [...this.usedCardEls].some(
          el => el.dataset.ingredientId === ingId
        );
        if (isUsed) card.classList.add("used");
      }

      // Click to place
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

    // Include ALL non-special ingredients plus required specials
    const allIngIds = Object.keys(INGREDIENTS).filter(id => {
      const ing = INGREDIENTS[id];
      if (required.includes(id)) return true;
      if (!ing.isSpecial) return true;
      return false;
    });

    // Add wild card, sort alphabetically by ingredient name
    const deck = [...new Set([...allIngIds, "wild"])];
    deck.sort((a, b) => {
      const na = INGREDIENTS[a] ? INGREDIENTS[a].name : a;
      const nb = INGREDIENTS[b] ? INGREDIENTS[b].name : b;
      return na.localeCompare(nb);
    });
    return deck;
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

    const isCorrect = this.checkRecipeCorrect();
    const isTargetRecipe = this.selectedRecipe.id === this.currentOrder.recipeId;

    await this.playFuseAnimation(this.selectedRecipe);

    this.totalServed++;
    this._lastFuseSuccess = isCorrect && isTargetRecipe;

    if (this._lastFuseSuccess) {
      this.successCount++;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      this.showServeResult(true, this.selectedRecipe);
    } else {
      this.mistakeCount++;
      this.streak = 0;
      let reason = !isTargetRecipe
        ? `Wrong recipe! ${this.currentOrder.customer} ordered ${RECIPES[this.currentOrder.recipeId].name}.`
        : "Wrong ingredients! The recipe didn\u2019t turn out right.";

      // Barista quip on every failure
      const baristaQuips = [
        `Edward: "\u2026our budget, boss\u2026 \uD83D\uDE12"`,
        `Edward: "That\u2019s coming out of our supplies\u2026"`,
        `Edward: "I\u2019m not cleaning that up."`,
        `Edward: "Maybe check the recipe book?"`,
        `Edward: "\u2026you sure about that one?"`,
        `Edward: "The customers can see us, you know."`,
        `Edward: "I\u2019ll pretend I didn\u2019t see that."`,
        `Edward: "We\u2019re running low on ingredients\u2026"`,
        `Edward: "Deep breaths. Try again."`,
        `Edward: "\u2026that was creative, at least."`,
      ];

      // At 5+ mistakes, show only the special dialogue and force end shift
      if (this.mistakeCount >= 5) {
        reason += `\nEdward: "Uh boss\u2026 more practice?"\nKit: "Why?!"`;
        this.showServeResult(false, this.selectedRecipe, reason, true);
      } else {
        reason += "\n" + baristaQuips[Math.floor(Math.random() * baristaQuips.length)];
        this.showServeResult(false, this.selectedRecipe, reason, false);
      }
    }

    this.updateHud();
  }

  checkRecipeCorrect() {
    if (!this.selectedRecipe) return false;

    // Order doesn't matter — just check all required ingredients are present
    const placed = this.slots.map(s => s.ingredientId);
    const required = [...this.selectedRecipe.ingredients];

    // For each required ingredient, find a matching placed ingredient
    // Wild cards can substitute for any ingredient
    const used = new Array(placed.length).fill(false);

    for (const reqId of required) {
      // First try to find an exact match
      let matched = false;
      for (let i = 0; i < placed.length; i++) {
        if (!used[i] && placed[i] === reqId) {
          used[i] = true;
          matched = true;
          break;
        }
      }
      // If no exact match, try a wild card
      if (!matched) {
        for (let i = 0; i < placed.length; i++) {
          if (!used[i] && placed[i] === "wild") {
            used[i] = true;
            matched = true;
            break;
          }
        }
      }
      if (!matched) return false;
    }
    return true;
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

  showServeResult(success, recipe, reason, forceEnd) {
    this.serveResultIcon.textContent = success ? "\u2728" : "\uD83D\uDE1E";

    if (success) {
      this.serveResultText.textContent = `${recipe.name} served successfully!`;
    } else {
      // Render with line breaks for barista dialogue
      const text = reason || "Something went wrong...";
      this.serveResultText.innerHTML = text.split("\n")
        .map(line => {
          const el = document.createElement("span");
          el.textContent = line;
          return el.outerHTML;
        })
        .join("<br>");
    }

    if (forceEnd) {
      // 5+ mistakes — force player to end the shift
      this.serveNextBtn.textContent = "End Shift";
      this._forceEndShift = true;
    } else {
      const shiftDone = this.successCount >= this.shiftData.ordersRequired && this.orderQueue.length === 0;
      this.serveNextBtn.textContent = shiftDone ? "Finish Shift" : "Back to Tables";
      this._forceEndShift = false;
    }

    this.serveResult.classList.remove("hidden");
  }

  /**
   * Called when player clicks the serve result button.
   * Returns to table zone with food delivery animation.
   */
  async afterServeResult() {
    this.serveResult.classList.add("hidden");

    // Forced end shift at 5+ mistakes
    if (this._forceEndShift) {
      this._forceEndShift = false;
      this.completeShift();
      return;
    }

    const tableNum = this._activeTableNum;
    this._activeTableNum = null;

    // Switch to table zone for the delivery animation
    this.showTableZone();

    // Play delivery animation on the table
    if (tableNum && this.tables[tableNum]) {
      await this.deliverFood(tableNum, this._lastFuseSuccess);
    }

    // Check if shift is complete
    const hasOrdering = Object.values(this.tables).some(t => t && (t.state === "ordering" || t.state === "crafting"));
    const hasMessy = Object.values(this.tables).some(t => t && t.state === "messy");

    if (this.successCount >= this.shiftData.ordersRequired && !hasOrdering && !hasMessy && this.orderQueue.length === 0) {
      await this.sleep(400);
      this.completeShift();
    }
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

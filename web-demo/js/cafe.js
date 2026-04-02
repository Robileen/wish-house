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
    this.serveRetryBtn   = document.getElementById("serve-retry-btn");
    this.serveReturnBtn  = document.getElementById("serve-return-btn");
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

    // DOM — decoration screen
    this.decoScreen      = document.getElementById("decoration-screen");
    this.decoSwatches    = document.getElementById("deco-swatches");
    this.decoShapes      = document.getElementById("deco-shapes");
    this.decoPreview     = document.querySelector(".deco-preview-table");
    this.decoBeginBtn    = document.getElementById("deco-begin-btn");
    this._selectedTheme  = localStorage.getItem("wishhouse_table_theme") || "wood";
    this._selectedShape  = localStorage.getItem("wishhouse_table_shape") || "circle";
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

    // Table state: tracks which table has which customers & orders
    // { tableNum: { customers: [{ avatar, orders: [{ order, recipe, completed }] }], state } }
    this.tables          = {};
    this._activeTableNum = null;  // which table the player is crafting for
    this._activeOrderIdx = null;  // which order index within the table's orders
    this._activeCustomerIdx = null; // which customer at the table

    // Seat positions: { tableNum: [ { angle, left, top }, ... ] }
    // Cached so seats don't jump around on re-render
    this._seatPositions  = {};

    // DOM — order picker
    this.orderPicker     = document.getElementById("order-picker");
    this.orderPickerList = document.getElementById("order-picker-list");

    // DOM — customer chat / tip
    this.customerChat    = document.getElementById("customer-chat");
    this.chatCustomerLine = document.getElementById("chat-customer-line");
    this.chatChoices     = document.getElementById("chat-choices");
    this.hudButtonCount  = document.getElementById("hud-button-count");

    // Avatars for customers
    this._avatarEmojis = ["\uD83D\uDC64", "\uD83E\uDDD1", "\uD83D\uDC69", "\uD83D\uDC68", "\uD83D\uDC66", "\uD83D\uDC67", "\uD83E\uDDD3"];

    // Customer dialogue pool — loaded from CUSTOMER_DIALOGUES (cafe-data.js)
    // Falls back to empty array if JSON not loaded yet
    this._dialoguePool = [];

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
    this.shiftStartBtn.addEventListener("click", () => this.showDecorationScreen());
    this.decoBeginBtn.addEventListener("click", () => this.confirmDecoration());
    this.decoSwatches.addEventListener("click", (e) => {
      const swatch = e.target.closest(".deco-swatch");
      if (swatch) this.selectTheme(swatch.dataset.theme);
    });
    this.decoShapes.addEventListener("click", (e) => {
      const btn = e.target.closest(".deco-shape");
      if (btn) this.selectShape(btn.dataset.shape);
    });
    this.fuseBtn.addEventListener("click", () => this.fuse());
    this.revertBtn.addEventListener("click", () => this.revertAllSlots());
    this.serveNextBtn.addEventListener("click", () => this.afterServeResult("continue"));
    this.serveRetryBtn.addEventListener("click", () => this.afterServeResult("retry"));
    this.serveReturnBtn.addEventListener("click", () => this.afterServeResult("return"));
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

    // Chat choice clicks
    this.chatChoices.addEventListener("click", (e) => {
      const btn = e.target.closest(".chat-choice");
      if (btn) this.onChatChoice(parseInt(btn.dataset.choice));
    });

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

  async openShift(shiftId, chapter, episode) {
    // Ensure cafe data (ingredients, recipes, shifts) is loaded
    await cafeDataReady;

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
    this._activeOrderIdx = null;
    this._activeCustomerIdx = null;
    this._seatPositions  = {};
    this._shiftTips      = 0;  // tips earned this shift, saved only on completion
    this._forceEndShift  = false;
    this._lastFuseSuccess = false;

    // Load customer dialogue pool from data-driven JSON
    this._dialoguePool = CUSTOMER_DIALOGUES.length > 0 ? [...CUSTOMER_DIALOGUES] : [];

    // Show intro
    this.shiftIntroTitle.textContent = this.shiftData.name;
    this.shiftIntroDesc.textContent  = this.shiftData.description;
    this.shiftIntroGoal.innerHTML    = `Serve <strong>${this.shiftData.ordersRequired}</strong> successful dishes to complete the shift.`;
    this.shiftIntro.classList.remove("hidden");
    this.shiftComplete.classList.add("hidden");
    this.serveResult.classList.add("hidden");
    this.quitConfirm.classList.add("hidden");
    this.recipeBookModal.classList.add("hidden");
    this.decoScreen.classList.add("hidden");

    // Show cafe screen
    this.cafeScreen.classList.remove("hidden-screen");
  }

  /* ══════════════════════════════════
     Decoration Screen
     ══════════════════════════════════ */

  showDecorationScreen() {
    this.shiftIntro.classList.add("hidden");
    this.decoScreen.classList.remove("hidden");

    // Restore last-used selections
    this.selectTheme(this._selectedTheme);
    this.selectShape(this._selectedShape);
  }

  selectTheme(theme) {
    this._selectedTheme = theme;

    // Update swatch active state
    this.decoSwatches.querySelectorAll(".deco-swatch").forEach(s => {
      s.classList.toggle("active", s.dataset.theme === theme);
    });

    // Update preview table: swap theme class, keep shape class
    const p = this.decoPreview;
    p.className = p.className.replace(/\btable-theme-\S+/g, "").trim();
    p.classList.add(`table-theme-${theme}`);

    // Rebuild heart layers if active (border color changes with theme)
    if (this._selectedShape === "heart") {
      requestAnimationFrame(() => this._updatePreviewHeartLayers("heart"));
    }
  }

  selectShape(shape) {
    this._selectedShape = shape;

    // Update shape button active state
    this.decoShapes.querySelectorAll(".deco-shape").forEach(s => {
      s.classList.toggle("active", s.dataset.shape === shape);
    });

    // Update preview table: swap shape class, keep theme class
    const p = this.decoPreview;
    p.className = p.className.replace(/\btable-shape-\S+/g, "").trim();
    if (shape !== "circle") p.classList.add(`table-shape-${shape}`);

    // Inject/remove heart edge layers on the preview (use rAF so CSS is applied first)
    requestAnimationFrame(() => this._updatePreviewHeartLayers(shape));
  }

  _updatePreviewHeartLayers(shape) {
    const p = this.decoPreview;
    p.querySelectorAll(".heart-edge-layer").forEach(el => el.remove());
    if (shape !== "heart") return;

    const borderColor = this._getThemeBorderColor();
    const clip = "path('M65 18 C65 0, 0 0, 0 38 C0 72, 32 92, 65 110 C98 92, 130 72, 130 38 C130 0, 65 0, 65 18 Z')";
    // Same positioning as cafe tables (150x150 container, centered)
    const baseTop = "calc(50% - 52px)";
    const baseLeft = "calc(50% - 65px)";

    const makeLayer = (opts) => {
      const el = document.createElement("div");
      el.className = "heart-edge-layer";
      Object.assign(el.style, {
        position: "absolute",
        top: baseTop, left: baseLeft,
        width: "130px", height: "120px",
        clipPath: clip,
        zIndex: "0",
        pointerEvents: "none",
        transformOrigin: "center center",
        ...opts,
      });
      p.appendChild(el);
    };

    makeLayer({ background: borderColor, transform: "scale(1.05)" });
    makeLayer({ background: borderColor, transform: "scale(1.05) translateY(2px)", filter: "brightness(0.85)" });
    makeLayer({ background: borderColor, transform: "scale(1.05) translateY(4px)", opacity: "0.7" });
    makeLayer({ background: borderColor, transform: "scale(1.05) translateY(6px)", opacity: "0.5" });
    makeLayer({ background: borderColor, transform: "scale(1.05) translateY(8px)", opacity: "0.3" });
    makeLayer({
      background: borderColor,
      transform: "scale(1.05) translateY(10px)",
      opacity: "0.25",
      filter: "blur(10px)",
      zIndex: "-1",
    });
  }

  confirmDecoration() {
    // Persist choices
    localStorage.setItem("wishhouse_table_theme", this._selectedTheme);
    localStorage.setItem("wishhouse_table_shape", this._selectedShape);

    // Apply theme and shape to the cafe room
    this.applyTableTheme(this._selectedTheme);
    this.applyTableShape(this._selectedShape);

    // Hide deco screen and start the shift
    this.decoScreen.classList.add("hidden");
    this.beginShift();
  }

  applyTableTheme(theme) {
    // Remove any existing theme class from cafe-room, add the new one
    const room = this.cafeRoom;
    room.className = room.className.replace(/\btable-theme-\S+/g, "").trim();
    room.classList.add(`table-theme-${theme}`);
  }

  applyTableShape(shape) {
    const room = this.cafeRoom;
    room.className = room.className.replace(/\btable-shape-\S+/g, "").trim();
    if (shape !== "circle") room.classList.add(`table-shape-${shape}`);
    // Clear cached seat positions so they regenerate for the new shape
    this._seatPositions = {};
    // Inject/remove heart edge layers
    this._updateHeartEdgeLayers(shape);
  }

  /**
   * For heart shape, inject layers behind each table to replicate
   * the circle's border + box-shadow + drop-shadow appearance.
   * Uses theme-matched border colors so the heart rim matches
   * whatever material is selected.
   */
  _updateHeartEdgeLayers(shape) {
    this.cafeRoom.querySelectorAll(".heart-edge-layer").forEach(el => el.remove());
    if (shape !== "heart") return;

    const clip = "path('M65 18 C65 0, 0 0, 0 38 C0 72, 32 92, 65 110 C98 92, 130 72, 130 38 C130 0, 65 0, 65 18 Z')";
    const W = 130, H = 120;
    const borderColor = this._getThemeBorderColor();

    this.cafeRoom.querySelectorAll(".cafe-table").forEach(table => {
      const baseTop = "calc(50% - 52px)";
      const baseLeft = "calc(50% - 65px)";

      const makeLayer = (opts) => {
        const el = document.createElement("div");
        el.className = "heart-edge-layer";
        Object.assign(el.style, {
          position: "absolute",
          top: baseTop,
          left: baseLeft,
          width: W + "px",
          height: H + "px",
          clipPath: clip,
          zIndex: "0",
          pointerEvents: "none",
          transformOrigin: "center center",
          ...opts,
        });
        table.appendChild(el);
      };

      makeLayer({ background: borderColor, transform: "scale(1.05)" });
      makeLayer({ background: borderColor, transform: "scale(1.05) translateY(2px)", filter: "brightness(0.85)" });
      makeLayer({ background: borderColor, transform: "scale(1.05) translateY(4px)", opacity: "0.7" });
      makeLayer({ background: borderColor, transform: "scale(1.05) translateY(6px)", opacity: "0.5" });
      makeLayer({ background: borderColor, transform: "scale(1.05) translateY(8px)", opacity: "0.3" });
      makeLayer({
        background: borderColor,
        transform: "scale(1.05) translateY(10px)",
        opacity: "0.25",
        filter: "blur(10px)",
        zIndex: "-1",
      });
    });
  }

  /** Border color lookup per theme — matches each theme's CSS border-color */
  _getThemeBorderColor() {
    const colors = {
      wood:     "rgba(160, 112, 64, 0.5)",
      rose:     "rgba(196, 139, 159, 0.45)",
      sage:     "rgba(140, 175, 148, 0.5)",
      lavender: "rgba(149, 132, 173, 0.45)",
      ocean:    "rgba(140, 185, 210, 0.5)",
      honey:    "rgba(212, 184, 126, 0.5)",
      peach:    "rgba(196, 144, 128, 0.5)",
    };
    return colors[this._selectedTheme] || colors.wood;
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
   * Each table gets 1-2 customers, each customer gets 1-3 orders.
   */
  seatNextCustomers() {
    if (this.orderQueue.length === 0) {
      const hasActive = Object.values(this.tables).some(t => t);
      if (!hasActive && this.successCount >= this.shiftData.ordersRequired) {
        this.completeShift();
      }
      return;
    }

    const emptyTables = [1, 2, 3, 4, 5, 6].filter(n => !this.tables[n]);
    const shuffledEmpty = this.shuffle([...emptyTables]);
    const toFill = Math.min(3, shuffledEmpty.length);
    const seatedTables = [];

    for (let i = 0; i < toFill && this.orderQueue.length > 0; i++) {
      const tableNum = shuffledEmpty[i];
      const numCustomers = this.orderQueue.length >= 2 ? (Math.random() < 0.4 ? 2 : 1) : 1;
      const customers = [];

      for (let c = 0; c < numCustomers && this.orderQueue.length > 0; c++) {
        const maxOrders = Math.min(3, this.orderQueue.length);
        const numOrders = maxOrders === 1 ? 1 : (Math.random() < 0.3 ? Math.min(maxOrders, Math.random() < 0.5 ? 3 : 2) : 1);
        const avatarIdx = (this.totalServed + Object.keys(this.tables).length + customers.length) % this._avatarEmojis.length;
        const orders = [];

        for (let o = 0; o < numOrders; o++) {
          const order = this.orderQueue.shift();
          orders.push({ order, recipe: RECIPES[order.recipeId] || null, completed: false });
        }

        customers.push({ avatar: this._avatarEmojis[avatarIdx], orders });
      }

      this.tables[tableNum] = { customers, state: "ordering" };
      seatedTables.push(tableNum);
    }

    seatedTables.forEach(n => this.renderTable(n, true));
  }

  renderAllTables() {
    for (let n = 1; n <= 6; n++) {
      this.renderTable(n);
    }
  }

  renderTable(tableNum, isNewSeating = false) {
    const el = this.cafeRoom.querySelector(`.cafe-table[data-table="${tableNum}"]`);
    if (!el) return;

    const foodSlot = el.querySelector(".food-slot");
    const overlay = el.querySelector(".table-overlay");

    // Clear dynamic seat elements
    el.querySelectorAll(".seat").forEach(s => s.remove());
    el.classList.remove("has-customer", "served", "messy");
    foodSlot.className = "food-slot";
    foodSlot.textContent = "";
    overlay.className = "table-overlay";
    overlay.textContent = "";

    // Remove any speech bubble
    const surface = el.querySelector(".table-surface");
    const existingBubble = el.querySelector(".table-order-bubble");
    if (existingBubble) existingBubble.remove();

    const tableData = this.tables[tableNum];
    if (!tableData) {
      delete this._seatPositions[tableNum];
      return;
    }

    const { customers, state } = tableData;

    // Generate seat positions if not cached for this customer count
    if (!this._seatPositions[tableNum] || this._seatPositions[tableNum].length !== customers.length) {
      this._seatPositions[tableNum] = this._generateSeatPositions(tableNum, customers.length);
    }

    const showCustomers = ["ordering", "crafting", "served", "eating"].includes(state);

    if (showCustomers) {
      if (state === "ordering" || state === "crafting") el.classList.add("has-customer");
      if (state === "served") el.classList.add("served");

      // Create seat elements at random positions
      customers.forEach((cust, idx) => {
        const pos = this._seatPositions[tableNum][idx];
        if (!pos) return;
        const seat = document.createElement("div");
        seat.className = "seat occupied";
        seat.textContent = cust.avatar;
        seat.style.left = `${pos.left}px`;
        seat.style.top = `${pos.top}px`;
        el.appendChild(seat);
      });

      // Order bubble (ordering state only)
      if (state === "ordering") {
        const pendingOrders = [];
        customers.forEach(c => {
          c.orders.forEach(o => {
            if (!o.completed && o.recipe) pendingOrders.push(o.recipe);
          });
        });
        if (pendingOrders.length > 0) {
          const bubble = document.createElement("div");
          bubble.className = isNewSeating ? "table-order-bubble" : "table-order-bubble no-anim";
          bubble.innerHTML = pendingOrders
            .map(r => `<span class="bubble-icon">${r.icon}</span>`)
            .join(" ");
          if (pendingOrders.length === 1) {
            bubble.innerHTML += ` ${pendingOrders[0].name}`;
          } else {
            bubble.innerHTML += ` <span class="bubble-count">${pendingOrders.length} orders</span>`;
          }
          el.appendChild(bubble);
        }
      }

      // Food on table
      if (state === "served" || state === "eating") {
        const lastRecipe = this._lastDeliveredRecipe;
        foodSlot.className = "food-slot has-food";
        foodSlot.textContent = lastRecipe ? lastRecipe.icon : "\uD83C\uDF7D";
        if (state === "served") {
          overlay.className = "table-overlay glow";
        } else {
          overlay.className = "table-overlay hearts";
          this._spawnHearts(overlay);
        }
      }
    }

    if (state === "messy") {
      el.classList.add("messy");
      foodSlot.className = "food-slot has-food clickable";
      foodSlot.textContent = "\uD83E\uDDFD";
    }
  }

  /**
   * Spawn a single big red heart that pulses and fades on the overlay.
   */
  _spawnHearts(overlay) {
    const span = document.createElement("span");
    span.className = "heart-particle";
    span.textContent = "\u2764\uFE0F";
    span.style.left = "50%";
    overlay.appendChild(span);
  }

  /**
   * Generate random seat positions around the table edge.
   * Positions are in px relative to the .cafe-table element.
   * Ensures no overlap with seats on the same table.
   */
  _generateSeatPositions(tableNum, count) {
    // Table & seat dimensions (must match CSS)
    const shape = this._selectedShape;
    const isRect = shape === "rectangle";
    const isHeart = shape === "heart";
    const tableW = isRect ? 170 : isHeart ? 150 : 140;
    const tableH = isRect ? 120 : isHeart ? 130 : 140;
    const surfaceW = isRect ? 150 : isHeart ? 130 : 120;
    const surfaceH = isRect ? 100 : isHeart ? 110 : 120;
    const seatSize = 52;

    // Center of the table surface within .cafe-table
    const cx = tableW / 2;
    const cy = tableH / 2;

    // Radius from center to seat center (just outside the table edge)
    const rx = (surfaceW / 2) + (seatSize * 0.15);
    const ry = (surfaceH / 2) + (seatSize * 0.15);

    const positions = [];
    const minAngleSep = Math.PI / 3; // ~60 degrees min between seats on same table

    for (let i = 0; i < count; i++) {
      let bestAngle = null;
      let attempts = 0;

      while (attempts < 30) {
        // Random angle around the circle
        const angle = Math.random() * Math.PI * 2;
        attempts++;

        // Avoid the top zone (~270° ± 40°) so seats don't overlap the centered order bubble
        const deg = ((angle * 180 / Math.PI) + 360) % 360;
        if (deg > 230 && deg < 310) continue;

        // Check distance from other seats on this table
        let tooClose = false;
        for (const existing of positions) {
          let diff = Math.abs(angle - existing.angle);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;
          if (diff < minAngleSep) { tooClose = true; break; }
        }
        if (!tooClose) { bestAngle = angle; break; }
      }

      if (bestAngle === null) bestAngle = (Math.PI * 2 / count) * i; // fallback: evenly spaced

      const left = cx + Math.cos(bestAngle) * rx - seatSize / 2;
      const top  = cy + Math.sin(bestAngle) * ry - seatSize / 2;
      positions.push({ angle: bestAngle, left: Math.round(left), top: Math.round(top) });
    }

    return positions;
  }

  onTableClick(tableNum) {
    const tableData = this.tables[tableNum];
    if (!tableData) return;

    if (tableData.state === "messy") {
      this.cleanTable(tableNum);
      return;
    }

    if (tableData.state === "ordering") {
      this._activeTableNum = tableNum;
      tableData.state = "crafting";

      // Collect all pending orders across customers
      const allOrders = [];
      tableData.customers.forEach((c, ci) => {
        c.orders.forEach((o, oi) => {
          if (!o.completed) allOrders.push({ customerIdx: ci, orderIdx: oi, ...o });
        });
      });

      if (allOrders.length === 1) {
        // Single order — go straight to crafting
        this._selectOrder(tableNum, allOrders[0].customerIdx, allOrders[0].orderIdx);
      } else {
        // Multiple orders — show order picker
        this._showOrderPicker(tableNum, allOrders);
      }

      this.showCraftView();
    }
  }

  _showOrderPicker(tableNum, allOrders) {
    const tableData = this.tables[tableNum];

    // Show picker, hide craft elements
    this.orderPicker.classList.remove("hidden");
    document.getElementById("card-slots-row").style.display = "none";
    document.getElementById("ingredient-deck").style.display = "none";
    this.fuseBtn.style.display = "none";

    // Show first customer info in order banner
    const firstCustomer = tableData.customers[0];
    this.orderAvatar.textContent = firstCustomer.avatar;
    this.orderName.textContent = `Table ${tableNum}`;
    this.orderDialogue.textContent = `${allOrders.length} orders to fill`;
    this.orderRecipeIcon.textContent = "";
    this.orderRecipeName.textContent = "";

    // Render order cards
    this.orderPickerList.innerHTML = "";
    allOrders.forEach(({ customerIdx, orderIdx, order, recipe, completed }) => {
      const card = document.createElement("div");
      card.className = "order-pick-card" + (completed ? " completed" : "");

      const customer = tableData.customers[customerIdx];
      card.innerHTML = `
        <span class="order-pick-icon">${recipe ? recipe.icon : "\uD83C\uDF7D"}</span>
        <div class="order-pick-info">
          <span class="order-pick-name">${recipe ? recipe.name : "Unknown"}</span>
          <span class="order-pick-customer">${customer.avatar} ${order.customer}</span>
        </div>
      `;

      if (!completed) {
        card.addEventListener("click", () => {
          this._selectOrder(tableNum, customerIdx, orderIdx);
        });
      }

      this.orderPickerList.appendChild(card);
    });
  }

  _selectOrder(tableNum, customerIdx, orderIdx) {
    const tableData = this.tables[tableNum];
    const customer = tableData.customers[customerIdx];
    const orderEntry = customer.orders[orderIdx];

    this._activeTableNum = tableNum;
    this._activeCustomerIdx = customerIdx;
    this._activeOrderIdx = orderIdx;
    this.currentOrder = orderEntry.order;
    this.selectedRecipe = orderEntry.recipe;

    // Hide picker, show craft elements
    this.orderPicker.classList.add("hidden");
    document.getElementById("card-slots-row").style.display = "";
    document.getElementById("ingredient-deck").style.display = "";
    this.fuseBtn.style.display = "";

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

    // Maybe trigger customer chat dialogue
    this.maybeShowChat();
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

      // Customer eating (hearts float up in waves)
      tableData.state = "eating";
      this.renderTable(tableNum);
      await this.sleep(8000);

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
      this.tables[this._activeTableNum].state = "ordering";
      this.renderTable(this._activeTableNum);
    }
    this._activeTableNum = null;
    this._activeOrderIdx = null;
    this._activeCustomerIdx = null;
    this.currentOrder = null;
    this.selectedRecipe = null;
    this.orderPicker.classList.add("hidden");
    this.customerChat.classList.add("hidden");
    document.getElementById("card-slots-row").style.display = "";
    document.getElementById("ingredient-deck").style.display = "";
    this.fuseBtn.style.display = "";
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

    // Show tips earned
    let tipsEl = document.getElementById("shift-tips-earned");
    if (!tipsEl) {
      tipsEl = document.createElement("p");
      tipsEl.id = "shift-tips-earned";
      document.getElementById("shift-summary").appendChild(tipsEl);
    }
    tipsEl.textContent = this._shiftTips > 0
      ? `Tips earned: ${this._shiftTips} \uD83E\uDEA3`
      : "No tips this shift";

    this.shiftComplete.classList.remove("hidden");
  }

  exitShift() {
    this.cafeScreen.classList.add("hidden-screen");

    // Save earned tips only on successful shift completion
    if (window.journal && this._shiftTips > 0) {
      window.journal.addButtons(this._shiftTips);
    }

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

    // Update button counter — show saved + pending shift tips
    if (this.hudButtonCount && window.journal) {
      const saved = window.journal.getButtons();
      this.hudButtonCount.textContent = saved + this._shiftTips;
    }
  }

  /* ══════════════════════════════════
     Customer Chat / Tip System
     ══════════════════════════════════ */

  /**
   * Maybe show a customer dialogue interaction.
   * ~60% chance per order. Uses data-driven dialogues from JSON.
   * Correct answer = tip + generates a recommended order added to the table.
   */
  maybeShowChat() {
    if (this._dialoguePool.length === 0 || Math.random() > 0.6) {
      this.customerChat.classList.add("hidden");
      return;
    }

    const dialogue = this._dialoguePool[Math.floor(Math.random() * this._dialoguePool.length)];
    this._currentChat = dialogue;

    this.chatCustomerLine.textContent = `\u201C${dialogue.customer_line}\u201D`;

    // Hide response area from previous interaction
    const responseEl = document.getElementById("chat-response");
    if (responseEl) responseEl.classList.add("hidden");

    // Randomize choice order so the correct answer isn't always first
    const correctIdx = dialogue.choices.findIndex(c => c.is_correct);
    const flip = Math.random() < 0.5;
    const btns = this.chatChoices.querySelectorAll(".chat-choice");
    const order = flip ? [1, 0] : [0, 1];

    btns[0].textContent = dialogue.choices[order[0]].text;
    btns[0].dataset.choice = order[0];
    btns[0].className = "chat-choice";
    btns[0].style.pointerEvents = "";
    btns[1].textContent = dialogue.choices[order[1]].text;
    btns[1].dataset.choice = order[1];
    btns[1].className = "chat-choice";
    btns[1].style.pointerEvents = "";

    this.customerChat.classList.remove("hidden");
  }

  onChatChoice(choiceIdx) {
    const dialogue = this._currentChat;
    if (!dialogue) return;

    const chosen = dialogue.choices[choiceIdx];
    const correctIdx = dialogue.choices.findIndex(c => c.is_correct);

    const btns = this.chatChoices.querySelectorAll(".chat-choice");

    // Highlight correct/wrong
    btns.forEach(btn => {
      const idx = parseInt(btn.dataset.choice);
      if (idx === correctIdx) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("wrong");
      }
      btn.style.pointerEvents = "none";
    });

    // Show customer response
    const responseEl = document.getElementById("chat-response");
    const responseText = document.getElementById("chat-response-text");
    if (responseEl && responseText) {
      responseText.textContent = `\u201C${chosen.response}\u201D`;
      responseEl.classList.remove("hidden");
    }

    if (chosen.is_correct) {
      // Award tip buttons
      const tipAmount = (chosen.reward && chosen.reward.buttons) || 1;
      for (let i = 0; i < tipAmount; i++) {
        setTimeout(() => this.awardTip(), i * 200);
      }
      // Try to generate a recommended order from tags
      this._addRecommendedOrder(chosen.order_tags || dialogue.tags || []);
    }

    // Auto-hide after longer delay to let player read the response
    setTimeout(() => {
      this.customerChat.classList.add("hidden");
      if (responseEl) responseEl.classList.add("hidden");
    }, 2400);

    this._currentChat = null;
  }

  /**
   * Find a recipe matching the given tags from the current shift's available recipes.
   * Returns a recipe object or null.
   */
  _findMatchingRecipe(tags) {
    if (!tags || tags.length === 0 || !this.shiftData) return null;

    const available = this.shiftData.availableRecipes || [];
    const candidates = [];

    for (const recipeId of available) {
      const recipe = RECIPES[recipeId];
      if (!recipe || !recipe.tags) continue;

      // Count how many requested tags this recipe matches
      const matchCount = tags.filter(t => recipe.tags.includes(t)).length;
      if (matchCount > 0) {
        candidates.push({ recipe, matchCount });
      }
    }

    if (candidates.length === 0) return null;

    // Sort by match count descending, pick randomly among top matches
    candidates.sort((a, b) => b.matchCount - a.matchCount);
    const bestScore = candidates[0].matchCount;
    const topCandidates = candidates.filter(c => c.matchCount === bestScore);
    return topCandidates[Math.floor(Math.random() * topCandidates.length)].recipe;
  }

  /**
   * Add a recommended order to the current customer's table based on tag matching.
   * This is the reward for a correct chat answer — the customer orders something extra.
   */
  _addRecommendedOrder(tags) {
    const recipe = this._findMatchingRecipe(tags);
    if (!recipe) return;

    const tableNum = this._activeTableNum;
    const customerIdx = this._activeCustomerIdx;
    if (tableNum == null || customerIdx == null) return;

    const tableData = this.tables[tableNum];
    if (!tableData) return;

    const customer = tableData.customers[customerIdx];
    if (!customer) return;

    // Build the order object matching the shift customerOrders format
    const newOrder = {
      order: {
        customer: this.currentOrder ? this.currentOrder.customer : "Customer",
        recipeId: recipe.id,
        dialogue: `I\u2019ll also have the ${recipe.name}, please!`
      },
      recipe: recipe,
      completed: false
    };

    customer.orders.push(newOrder);

    // Re-render the table to show the new order bubble
    this.renderTable(tableNum);
  }

  awardTip() {
    this._shiftTips++;
    this.updateHud();

    // Floating +1 animation
    const float = document.createElement("div");
    float.className = "tip-float";
    float.textContent = "+1 \uD83E\uDEA3";

    // Position near the HUD button counter
    const hudBtn = document.getElementById("hud-buttons");
    if (hudBtn) {
      const rect = hudBtn.getBoundingClientRect();
      float.style.left = `${rect.left + rect.width / 2}px`;
      float.style.top = `${rect.top}px`;

      // Bounce the counter
      hudBtn.classList.add("tip-earned");
      setTimeout(() => hudBtn.classList.remove("tip-earned"), 600);
    } else {
      float.style.left = "50%";
      float.style.top = "50px";
    }

    document.body.appendChild(float);
    setTimeout(() => float.remove(), 1200);
  }

  /* ══════════════════════════════════
     Customer Order (craft view banner)
     ══════════════════════════════════ */

  renderCustomerOrder() {
    if (!this.currentOrder) return;
    const recipe = RECIPES[this.currentOrder.recipeId];
    const tableData = this.tables[this._activeTableNum];
    const customer = tableData && this._activeCustomerIdx != null
      ? tableData.customers[this._activeCustomerIdx]
      : null;
    this.orderAvatar.textContent = customer ? customer.avatar : "\uD83D\uDC64";
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
          const cardEl = this.deckScroll.querySelector(`.ingredient-card[data-ingredient-id="${ingId}"]`);
          this.placeInSlot(idx, ingId, cardEl);
        }
      });

      this.cardSlotsEl.appendChild(slotEl);
    });
  }

  placeInSlot(slotIdx, ingredientId, cardEl) {
    if (this.slots[slotIdx].ingredientId) return;

    this.slots[slotIdx].ingredientId = ingredientId;

    if (cardEl) {
      this._deckCardUsage[ingredientId] = (this._deckCardUsage[ingredientId] || 0) + 1;
      this.renderDeck();
    }

    this.renderSlots();
    this.updateFuseButton();
  }

  removeFromSlot(slotIdx) {
    const removed = this.slots[slotIdx].ingredientId;
    this.slots[slotIdx].ingredientId = null;

    if (removed) {
      if (this._deckCardUsage[removed]) {
        this._deckCardUsage[removed]--;
        if (this._deckCardUsage[removed] <= 0) delete this._deckCardUsage[removed];
      }
      this.renderDeck();
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

    // Temperature exclusion: if one temp card is in a slot, hide the other
    const placedTempIds = new Set(
      this.slots
        .map(s => s.ingredientId)
        .filter(id => id && INGREDIENTS[id] && INGREDIENTS[id].group === "temp")
    );

    filtered.forEach(ingId => {
      const ing = INGREDIENTS[ingId];
      if (!ing) return;

      const isSingleUse = ing.isSpecial || ing.group === "temp";
      const usageCount = this._deckCardUsage[ingId] || 0;

      // Special cards (non-temp) disappear from the deck when placed
      if (ing.isSpecial && usageCount > 0) return;

      // Temp cards stay visible but disabled when placed or when the other temp is placed
      const isTempDisabled = ing.group === "temp" && placedTempIds.size > 0;

      const card = document.createElement("div");
      card.className = "ingredient-card";
      card.dataset.ingredientId = ingId;
      if (ing.isSpecial) card.classList.add("special-card");
      if (isTempDisabled) card.classList.add("disabled");

      card.innerHTML = `
        <span class="card-icon">${ing.icon}</span>
        <span class="card-name">${ing.name}</span>
        ${usageCount > 0 ? `<span class="card-use-count">${usageCount}</span>` : ""}
      `;

      // Click to place
      card.addEventListener("click", () => {
        if (card.classList.contains("disabled")) return;
        const emptyIdx = this.slots.findIndex(s => s.ingredientId === null);
        if (emptyIdx !== -1) {
          this.placeInSlot(emptyIdx, ingId, card);
        }
      });

      // Drag support
      card.draggable = !isTempDisabled;
      card.addEventListener("dragstart", (e) => {
        if (card.classList.contains("disabled")) { e.preventDefault(); return; }
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
      this._shiftTips++;  // +1 button for correct order
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

    // Check if this table has more pending orders (beyond the current one)
    const tableData = this.tables[this._activeTableNum];
    let hasPending = false;
    if (tableData) {
      let pendingCount = 0;
      tableData.customers.forEach(c => {
        c.orders.forEach(o => { if (!o.completed) pendingCount++; });
      });
      // On success the current order will be marked complete in afterServeResult,
      // so "more pending" means > 1. On failure the current order stays pending,
      // so "other orders" also means > 1.
      hasPending = pendingCount > 1;
    }

    if (forceEnd) {
      this.serveNextBtn.textContent = "End Shift";
      this.serveNextBtn.classList.remove("hidden");
      this.serveRetryBtn.classList.add("hidden");
      this.serveReturnBtn.classList.add("hidden");
      this._forceEndShift = true;
    } else if (!success) {
      // Failed order — always offer retry and return to tables
      this.serveRetryBtn.classList.remove("hidden");
      this.serveReturnBtn.classList.remove("hidden");
      // If table has other orders, also offer picking a different order
      if (hasPending) {
        this.serveNextBtn.textContent = "Next Order";
        this.serveNextBtn.classList.remove("hidden");
      } else {
        this.serveNextBtn.classList.add("hidden");
      }
      this._forceEndShift = false;
    } else if (hasPending) {
      // Success with more orders — offer continue or return
      this.serveNextBtn.textContent = "Continue Next Order";
      this.serveNextBtn.classList.remove("hidden");
      this.serveRetryBtn.classList.add("hidden");
      this.serveReturnBtn.classList.remove("hidden");
      this._forceEndShift = false;
    } else {
      const shiftDone = this.successCount >= this.shiftData.ordersRequired && this.orderQueue.length === 0;
      this.serveNextBtn.textContent = shiftDone ? "Finish Shift" : "Back to Tables";
      this.serveNextBtn.classList.remove("hidden");
      this.serveRetryBtn.classList.add("hidden");
      this.serveReturnBtn.classList.add("hidden");
      this._forceEndShift = false;
    }

    this.serveResult.classList.remove("hidden");
  }

  /**
   * Called when player clicks a serve result button.
   * choice: "continue" (next order at same table), "retry" (same order again), or "return" (back to tables)
   */
  async afterServeResult(choice = "continue") {
    this.serveResult.classList.add("hidden");

    // Forced end shift at 5+ mistakes
    if (this._forceEndShift) {
      this._forceEndShift = false;
      this.completeShift();
      return;
    }

    // Retry — re-open the same order with fresh slots
    if (choice === "retry") {
      this._selectOrder(this._activeTableNum, this._activeCustomerIdx, this._activeOrderIdx);
      return;
    }

    const tableNum = this._activeTableNum;
    const tableData = this.tables[tableNum];

    // Mark the current order as completed only on success
    if (this._lastFuseSuccess && tableData && this._activeCustomerIdx != null && this._activeOrderIdx != null) {
      const customer = tableData.customers[this._activeCustomerIdx];
      if (customer && customer.orders[this._activeOrderIdx]) {
        customer.orders[this._activeOrderIdx].completed = true;
      }
    }

    // Check if the table has more pending orders
    const pendingOrders = [];
    if (tableData) {
      tableData.customers.forEach((c, ci) => {
        c.orders.forEach((o, oi) => {
          if (!o.completed) pendingOrders.push({ customerIdx: ci, orderIdx: oi, ...o });
        });
      });
    }

    // Player chose "Return to Tables" — go back, keep remaining/failed orders
    if (choice === "return" && tableData) {
      this._activeTableNum = null;
      this._activeOrderIdx = null;
      this._activeCustomerIdx = null;

      if (this._lastFuseSuccess && pendingOrders.length > 0) {
        // Quick serve animation without the full eat/messy cycle
        this._lastDeliveredRecipe = this.selectedRecipe;
        tableData.state = "served";
        this.showTableZone();
        await this.sleep(800);
        tableData.state = "ordering";
        this.renderTable(tableNum);
      } else {
        // Failed or no pending — just go back to ordering
        tableData.state = "ordering";
        this.showTableZone();
      }
      return;
    }

    if (pendingOrders.length > 0 && this._lastFuseSuccess) {
      // More orders at this table — quick served flash, then straight to next order
      this._lastDeliveredRecipe = this.selectedRecipe;
      tableData.state = "served";
      this.renderTable(tableNum);
      await this.sleep(600);
      tableData.state = "crafting";

      // Return to order picker for remaining orders
      if (pendingOrders.length === 1) {
        this._selectOrder(tableNum, pendingOrders[0].customerIdx, pendingOrders[0].orderIdx);
      } else {
        this._showOrderPicker(tableNum, pendingOrders);
        this.showCraftView();
      }
      return;
    }

    if (pendingOrders.length > 0 && !this._lastFuseSuccess) {
      // Failed but table has more orders — go straight to order picker (no delivery)
      tableData.state = "crafting";
      if (pendingOrders.length === 1) {
        this._selectOrder(tableNum, pendingOrders[0].customerIdx, pendingOrders[0].orderIdx);
      } else {
        this._showOrderPicker(tableNum, pendingOrders);
        this.showCraftView();
      }
      return;
    }

    // All orders done (or failed) — go to table zone with delivery animation
    this._activeTableNum = null;
    this._activeOrderIdx = null;
    this._activeCustomerIdx = null;

    this.showTableZone();

    if (tableNum && tableData) {
      this._lastDeliveredRecipe = this.selectedRecipe;
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

/* ══════════════════════════════════════════════════════════════
   Conveyor Belt Prototype — ConveyorBeltEngine
   A top-down 2D square-loop conveyor with wedge plates,
   surrounding tables, and random customer seating.
   Customers auto-grab plates and stack them into a
   3-tier high tea tower (4 plates per tier = 12 total).
   ══════════════════════════════════════════════════════════════ */

class ConveyorBeltEngine {

  /* ── Constructor ── */
  constructor() {
    // DOM
    this.screen       = document.getElementById("conveyor-screen");
    this.playArea     = document.getElementById("play-area");
    this.beltEl       = document.getElementById("conveyor-belt");
    this.trackEl      = document.getElementById("belt-track");
    this.hudDishCount = document.getElementById("hud-dish-count");
    this.hudProgressFill = document.getElementById("hud-progress-fill");
    this.hudStreak    = document.getElementById("hud-streak");
    this.hudMistakes  = document.getElementById("hud-mistakes");
    this.serveResult  = document.getElementById("serve-result");
    this.serveIcon    = document.getElementById("serve-result-icon");
    this.serveText    = document.getElementById("serve-result-text");
    this.shiftComplete = document.getElementById("shift-complete");
    this.shiftSummary = document.getElementById("shift-summary");

    // Table side containers
    this.tableSides = {
      top:    document.getElementById("tables-top"),
      right:  document.getElementById("tables-right"),
      bottom: document.getElementById("tables-bottom"),
      left:   document.getElementById("tables-left"),
    };

    // Avatar emoji pool (same as cafe.js)
    this._avatarEmojis = ["\uD83D\uDC64", "\uD83E\uDDD1", "\uD83D\uDC69", "\uD83D\uDC68", "\uD83D\uDC66", "\uD83D\uDC67", "\uD83E\uDDD3"];

    // ── Layout constants ──
    this.BELT_W       = 320;   // inner belt width
    this.BELT_H       = 240;   // inner belt height
    this.BELT_PAD     = 4;     // border thickness
    this.TABLE_MARGIN = 16;    // gap between belt edge and table row
    this.TABLES_PER_SIDE = 2;  // tables per side

    // ── Belt / plate constants ──
    this.PLATE_SIZE   = 40;
    this.PLATE_SPEED  = 60;    // pixels per second
    this.MAX_PLATES   = 14;    // max plates on belt at once
    this.SPAWN_INTERVAL = 2000; // ms between new plate spawns

    // ── Tower constants ──
    this.TOWER_TIERS      = 3;   // number of tiers
    this.PLATES_PER_TIER  = 4;   // wedge plates per tier
    this.PLATES_TO_COMPLETE = this.TOWER_TIERS * this.PLATES_PER_TIER; // 12

    // ── Game state ──
    this.tables       = {};    // { tableId: { side, index, customers, state, el, tower } }
    this.plates       = [];    // [ { id, el, recipe, progress, grabbed } ]
    this._plateIdSeq  = 0;
    this._seatPositions = {};
    this.successCount = 0;
    this.mistakeCount = 0;
    this.streak       = 0;
    this.bestStreak   = 0;
    this.totalCustomersServed = 0;
    this.ordersRequired = 12;
    this._running     = false;
    this._lastFrame   = 0;
    this._spawnTimer  = 0;
    this._animFrameId = null;

    // ── Build the scene ──
    this._layoutScene();
    this._buildTables();

    // Bind shift-continue
    document.getElementById("shift-continue-btn").addEventListener("click", () => {
      this.shiftComplete.classList.add("hidden");
    });
  }

  /* ══════════════════════════════════════════════════════════════
     LAYOUT — position belt & tables
     ══════════════════════════════════════════════════════════════ */

  _layoutScene() {
    const bw = this.BELT_W;
    const bh = this.BELT_H;

    // Size the belt track
    this.trackEl.style.width  = bw + "px";
    this.trackEl.style.height = bh + "px";

    // Centre the belt in the play area
    this.beltEl.style.width  = bw + this.BELT_PAD * 2 + "px";
    this.beltEl.style.height = bh + this.BELT_PAD * 2 + "px";

    this._perimeter = 2 * (bw + bh);

    // Position table containers around the belt
    const tm = this.TABLE_MARGIN;

    this.tableSides.top.style.left      = "50%";
    this.tableSides.top.style.transform = "translateX(-50%)";
    this.tableSides.top.style.bottom    = `calc(50% + ${bh / 2 + this.BELT_PAD + tm}px)`;

    this.tableSides.bottom.style.left      = "50%";
    this.tableSides.bottom.style.transform = "translateX(-50%)";
    this.tableSides.bottom.style.top       = `calc(50% + ${bh / 2 + this.BELT_PAD + tm}px)`;

    this.tableSides.left.style.top       = "50%";
    this.tableSides.left.style.transform = "translateY(-50%)";
    this.tableSides.left.style.right     = `calc(50% + ${bw / 2 + this.BELT_PAD + tm}px)`;

    this.tableSides.right.style.top       = "50%";
    this.tableSides.right.style.transform = "translateY(-50%)";
    this.tableSides.right.style.left      = `calc(50% + ${bw / 2 + this.BELT_PAD + tm}px)`;
  }

  /* ══════════════════════════════════════════════════════════════
     TABLES — create & manage
     ══════════════════════════════════════════════════════════════ */

  _buildTables() {
    const sides = ["top", "right", "bottom", "left"];
    let tableId = 1;

    sides.forEach(side => {
      const container = this.tableSides[side];
      container.innerHTML = "";

      for (let i = 0; i < this.TABLES_PER_SIDE; i++) {
        const tEl = document.createElement("div");
        tEl.className = "cb-table";
        tEl.dataset.tableId = tableId;
        tEl.dataset.side = side;

        tEl.innerHTML = `
          <div class="cb-table-surface">
            <div class="cb-tower"></div>
            <div class="cb-food-slot"></div>
            <div class="cb-table-overlay"></div>
          </div>
        `;

        tEl.addEventListener("click", () => this._onTableClick(tableId));
        container.appendChild(tEl);

        this.tables[tableId] = {
          side,
          index: i,
          customers: [],
          state: "empty",
          el: tEl,
          // Tower: array of 12 slots, each null or { recipe, categoryClass }
          tower: this._createEmptyTower(),
        };

        tableId++;
      }
    });
  }

  _createEmptyTower() {
    return new Array(this.PLATES_TO_COMPLETE).fill(null);
  }

  _towerFilledCount(tower) {
    return tower.filter(s => s !== null).length;
  }

  _isTowerComplete(tower) {
    return this._towerFilledCount(tower) >= this.PLATES_TO_COMPLETE;
  }

  /* ── Random seat positioning (adapted from cafe.js) ── */

  _generateSeatPositions(tableId, count) {
    const surfaceW = 80;
    const surfaceH = 80;
    const seatSize = 36;
    const tableW = 100;
    const tableH = 100;

    const cx = tableW / 2;
    const cy = tableH / 2;

    const rx = (surfaceW / 2) + (seatSize * 0.15);
    const ry = (surfaceH / 2) + (seatSize * 0.15);

    const positions = [];
    const minAngleSep = Math.PI / 3;

    for (let i = 0; i < count; i++) {
      let bestAngle = null;
      let attempts = 0;

      while (attempts < 30) {
        const angle = Math.random() * Math.PI * 2;
        attempts++;

        let tooClose = false;
        for (const existing of positions) {
          let diff = Math.abs(angle - existing.angle);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;
          if (diff < minAngleSep) { tooClose = true; break; }
        }
        if (!tooClose) { bestAngle = angle; break; }
      }

      if (bestAngle === null) bestAngle = (Math.PI * 2 / count) * i;

      const left = cx + Math.cos(bestAngle) * rx - seatSize / 2;
      const top  = cy + Math.sin(bestAngle) * ry - seatSize / 2;
      positions.push({ angle: bestAngle, left: Math.round(left), top: Math.round(top) });
    }

    return positions;
  }

  /* ── Render table ── */

  _renderTable(tableId) {
    const td = this.tables[tableId];
    if (!td) return;
    const el = td.el;

    // Clear dynamic children (seats, bubbles)
    el.querySelectorAll(".cb-seat, .cb-order-bubble").forEach(e => e.remove());
    el.classList.remove("has-customer", "served", "eating", "messy");

    const foodSlot = el.querySelector(".cb-food-slot");
    foodSlot.className = "cb-food-slot";
    foodSlot.textContent = "";

    const overlay = el.querySelector(".cb-table-overlay");
    overlay.className = "cb-table-overlay";
    overlay.innerHTML = "";

    // Always render the tower (even when empty it shows the stand)
    this._renderTower(tableId);

    if (td.state === "empty") {
      delete this._seatPositions[tableId];
      return;
    }

    const { customers, state } = td;

    // Generate seat positions
    if (!this._seatPositions[tableId] || this._seatPositions[tableId].length !== customers.length) {
      this._seatPositions[tableId] = this._generateSeatPositions(tableId, customers.length);
    }

    const showCustomers = ["ordering", "served", "eating"].includes(state);

    if (showCustomers) {
      if (state === "ordering") el.classList.add("has-customer");
      if (state === "served")   el.classList.add("served");
      if (state === "eating")   el.classList.add("eating");

      // Seats
      customers.forEach((cust, idx) => {
        const pos = this._seatPositions[tableId][idx];
        if (!pos) return;
        const seat = document.createElement("div");
        seat.className = "cb-seat occupied";
        seat.textContent = cust.avatar;
        seat.style.left = pos.left + "px";
        seat.style.top  = pos.top + "px";
        el.querySelector(".cb-table-surface").appendChild(seat);
      });

      // Order bubble — shows the next needed dish + tower progress
      if (state === "ordering" && td.pendingRecipes && td.pendingRecipes.length > 0) {
        const filled = this._towerFilledCount(td.tower);
        const bubble = document.createElement("div");
        bubble.className = "cb-order-bubble";

        // Cycle through unique pending recipes
        const uniquePending = [...new Map(td.pendingRecipes.map(r => [r.id, r])).values()];
        if (td._displayIdx === undefined) td._displayIdx = 0;
        const r = uniquePending[td._displayIdx % uniquePending.length];
        const request = r ? `<span>${r.icon}</span> ${r.name}` : "";

        bubble.innerHTML = `${request} <span class="bubble-count">${filled}/${this.PLATES_TO_COMPLETE}</span>`;
        el.appendChild(bubble);
      }

      // Completed tower — served/eating state
      if (state === "served" || state === "eating") {
        if (state === "served") {
          overlay.className = "cb-table-overlay glow";
        } else {
          overlay.className = "cb-table-overlay";
          this._spawnHeart(overlay);
        }
      }
    }

    if (state === "messy") {
      el.classList.add("messy");
      // Sponge goes on top of the tower, not in the food slot
      const towerEl = el.querySelector(".cb-tower");
      const sponge = document.createElement("div");
      sponge.className = "cb-tower-sponge";
      sponge.textContent = "\uD83E\uDDFD"; // 🧽
      towerEl.appendChild(sponge);
    }
  }

  /* ── Render the high tea tower ── */

  _renderTower(tableId, justFilledSlot) {
    const td = this.tables[tableId];
    const towerEl = td.el.querySelector(".cb-tower");
    towerEl.innerHTML = "";
    towerEl.classList.remove("complete");

    const tower = td.tower;
    const isComplete = this._isTowerComplete(tower);
    if (isComplete) towerEl.classList.add("complete");

    // Build tiers from top (tier 3) to bottom (tier 1)
    // column-reverse in CSS handles visual ordering
    for (let tier = 0; tier < this.TOWER_TIERS; tier++) {
      // Separator between tiers (not before the first)
      if (tier > 0) {
        const sep = document.createElement("div");
        sep.className = "cb-tower-separator";
        towerEl.appendChild(sep);
      }

      const tierEl = document.createElement("div");
      tierEl.className = "cb-tower-tier";

      for (let slot = 0; slot < this.PLATES_PER_TIER; slot++) {
        const idx = tier * this.PLATES_PER_TIER + slot;
        const plateData = tower[idx];

        const slotEl = document.createElement("div");
        slotEl.className = "cb-tower-slot";

        if (plateData) {
          slotEl.classList.add("filled", plateData.categoryClass);
          if (justFilledSlot === idx) {
            slotEl.classList.add("just-filled");
          }
          slotEl.innerHTML = `
            <div class="cb-tower-slot-inner"></div>
            <span class="slot-icon">${plateData.recipe.icon}</span>
          `;
        } else {
          slotEl.innerHTML = `<div class="cb-tower-slot-inner"></div>`;
        }

        tierEl.appendChild(slotEl);
      }

      towerEl.appendChild(tierEl);
    }

    // Stand at the bottom
    const pole = document.createElement("div");
    pole.className = "cb-tower-pole";
    towerEl.appendChild(pole);

    const stand = document.createElement("div");
    stand.className = "cb-tower-stand";
    towerEl.appendChild(stand);
  }

  _spawnHeart(overlay) {
    const heart = document.createElement("div");
    heart.className = "cb-heart-particle";
    heart.textContent = "\u2764\uFE0F";
    overlay.appendChild(heart);
    setTimeout(() => heart.remove(), 4000);
  }

  _onTableClick(tableId) {
    const td = this.tables[tableId];
    if (!td || td.state !== "messy") return;
    this._cleanTable(tableId);
  }

  _cleanTable(tableId) {
    const td = this.tables[tableId];
    td.state = "empty";
    td.customers = [];
    td.tower = this._createEmptyTower();
    td.wantedRecipes = [];
    td.pendingRecipes = [];
    td._displayIdx = 0;
    this._renderTable(tableId);
    this._seatNewCustomers();
  }

  /* ══════════════════════════════════════════════════════════════
     CUSTOMERS — seat at tables
     ══════════════════════════════════════════════════════════════ */

  _seatNewCustomers() {
    const emptyIds = Object.keys(this.tables)
      .map(Number)
      .filter(id => this.tables[id].state === "empty");

    if (emptyIds.length === 0) return;

    const shuffled = this._shuffle([...emptyIds]);
    // Randomise how many tables to fill: 1-3 (weighted towards 1-2)
    const maxFill = Math.min(shuffled.length, Math.random() < 0.3 ? 3 : Math.random() < 0.5 ? 2 : 1);

    const recipes = this._getAvailableRecipes();
    if (recipes.length === 0) return;

    for (let i = 0; i < maxFill; i++) {
      const tableId = shuffled[i];
      const td = this.tables[tableId];

      // 1-2 customers (30% chance of 2)
      const numCust = Math.random() < 0.3 ? 2 : 1;
      td.customers = [];
      for (let c = 0; c < numCust; c++) {
        const avatarIdx = Math.floor(Math.random() * this._avatarEmojis.length);
        td.customers.push({ avatar: this._avatarEmojis[avatarIdx] });
      }

      // Build the tower wish-list: 12 random recipes (mix of dishes)
      td.wantedRecipes = [];
      for (let s = 0; s < this.PLATES_TO_COMPLETE; s++) {
        td.wantedRecipes.push(recipes[Math.floor(Math.random() * recipes.length)]);
      }
      // Pending is a mutable copy — items removed as plates are grabbed
      td.pendingRecipes = [...td.wantedRecipes];

      td.tower = this._createEmptyTower();
      td._displayIdx = 0;
      td.state = "ordering";

      this._renderTable(tableId);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     PLATES — spawn, move, match
     ══════════════════════════════════════════════════════════════ */

  _spawnPlate() {
    if (this.plates.length >= this.MAX_PLATES) return;

    const recipes = this._getAvailableRecipes();
    if (recipes.length === 0) return;

    // Collect what ordering tables still need from their pending lists
    const neededRecipes = [];
    Object.values(this.tables).forEach(td => {
      if (td.state === "ordering" && td.pendingRecipes && td.pendingRecipes.length > 0) {
        td.pendingRecipes.forEach(r => neededRecipes.push(r));
      }
    });

    let recipe;
    if (neededRecipes.length > 0 && Math.random() < 0.7) {
      // 70% chance to spawn something a table actually needs
      recipe = neededRecipes[Math.floor(Math.random() * neededRecipes.length)];
    }
    if (!recipe) {
      recipe = recipes[Math.floor(Math.random() * recipes.length)];
    }
    if (!recipe) return;

    const id = ++this._plateIdSeq;

    const el = document.createElement("div");
    el.className = "wedge-plate " + this._plateCategoryClass(recipe);
    el.dataset.plateId = id;
    el.innerHTML = `
      <div class="wedge-plate-inner">
        <span class="plate-icon">${recipe.icon}</span>
      </div>
      <span class="plate-label">${recipe.name}</span>
    `;
    el.style.animation = "plate-spawn 0.3s ease";

    this.trackEl.appendChild(el);

    this.plates.push({
      id,
      el,
      recipe,
      progress: 0,
      grabbed: false,
    });
  }

  _plateCategoryClass(recipe) {
    if (!recipe || !recipe.category) return "plate-food";
    const cat = recipe.category.toLowerCase();
    if (cat.startsWith("drink")) return "plate-drink";
    if (cat.startsWith("dessert")) return "plate-dessert";
    if (cat.startsWith("special")) return "plate-special";
    return "plate-food";
  }

  _plateCategorySlotClass(recipe) {
    if (!recipe || !recipe.category) return "slot-food";
    const cat = recipe.category.toLowerCase();
    if (cat.startsWith("drink")) return "slot-drink";
    if (cat.startsWith("dessert")) return "slot-dessert";
    if (cat.startsWith("special")) return "slot-special";
    return "slot-food";
  }

  _movePlates(dt) {
    const speed = this.PLATE_SPEED / this._perimeter;

    for (let i = this.plates.length - 1; i >= 0; i--) {
      const plate = this.plates[i];
      if (plate.grabbed) continue;

      plate.progress += speed * dt;

      if (plate.progress >= 1) {
        plate.el.remove();
        this.plates.splice(i, 1);
        continue;
      }

      const pos = this._progressToPosition(plate.progress);
      plate.el.style.left = pos.x + "px";
      plate.el.style.top  = pos.y + "px";

      // Keep plate upright at all times
      plate.el.style.transform = `rotate(0deg)`;

      // Check if passing any ordering table that has room in its tower
      this._checkPlateNearTable(plate);
    }
  }

  _progressToPosition(progress) {
    const p = progress % 1;
    const bw = this.BELT_W;
    const bh = this.BELT_H;
    const totalLen = 2 * (bw + bh);
    const dist = p * totalLen;

    const halfPlate = this.PLATE_SIZE / 2;
    const offset = 6;

    let x, y, angle;

    if (dist < bw) {
      x = dist - halfPlate;
      y = -halfPlate - offset;
      angle = 0;
    } else if (dist < bw + bh) {
      const d = dist - bw;
      x = bw + offset;
      y = d - halfPlate;
      angle = 90;
    } else if (dist < 2 * bw + bh) {
      const d = dist - bw - bh;
      x = bw - d - halfPlate;
      y = bh + offset;
      angle = 180;
    } else {
      const d = dist - 2 * bw - bh;
      x = -halfPlate - offset;
      y = bh - d - halfPlate;
      angle = 270;
    }

    return { x, y, angle };
  }

  /* ── Check if a plate is near a table that still needs it ── */

  _checkPlateNearTable(plate) {
    const bw = this.BELT_W;
    const bh = this.BELT_H;
    const totalLen = 2 * (bw + bh);
    const dist = (plate.progress % 1) * totalLen;

    for (const [tableId, td] of Object.entries(this.tables)) {
      if (td.state !== "ordering") continue;
      if (this._isTowerComplete(td.tower)) continue;

      // Check if this table still needs this recipe
      const needsThis = td.pendingRecipes.some(r => r.id === plate.recipe.id);
      if (!needsThis) continue;

      const range = this._tableBeltRange(td);
      if (!range) continue;

      if (dist >= range.from && dist <= range.to) {
        this._grabPlate(plate, Number(tableId));
        return;
      }
    }
  }

  _tableBeltRange(td) {
    const bw = this.BELT_W;
    const bh = this.BELT_H;
    const grabWidth = 60;

    const n = this.TABLES_PER_SIDE;
    const idx = td.index;

    let center;
    switch (td.side) {
      case "top": {
        const spacing = bw / (n + 1);
        center = spacing * (idx + 1);
        break;
      }
      case "right": {
        const spacing = bh / (n + 1);
        center = bw + spacing * (idx + 1);
        break;
      }
      case "bottom": {
        const spacing = bw / (n + 1);
        center = bw + bh + spacing * (idx + 1);
        break;
      }
      case "left": {
        const spacing = bh / (n + 1);
        center = 2 * bw + bh + spacing * (idx + 1);
        break;
      }
      default: return null;
    }

    return { from: center - grabWidth / 2, to: center + grabWidth / 2 };
  }

  /* ── Plate gets grabbed — stack onto tower ── */

  _grabPlate(plate, tableId) {
    plate.grabbed = true;
    plate.el.classList.add("grabbed");

    const td = this.tables[tableId];

    setTimeout(() => {
      plate.el.remove();
      this.plates = this.plates.filter(p => p.id !== plate.id);

      // Remove this recipe from pending list (first match only)
      const pendIdx = td.pendingRecipes.findIndex(r => r.id === plate.recipe.id);
      if (pendIdx !== -1) td.pendingRecipes.splice(pendIdx, 1);

      // Find the next empty slot in the tower (fill bottom-up)
      const slotIdx = td.tower.findIndex(s => s === null);
      if (slotIdx === -1) return;

      // Place the plate into the tower
      td.tower[slotIdx] = {
        recipe: plate.recipe,
        categoryClass: this._plateCategorySlotClass(plate.recipe),
      };

      // Re-render the tower with the just-filled animation
      this._renderTower(tableId, slotIdx);

      // Update the order bubble
      this._updateBubble(tableId);

      // Check if tower is now complete
      if (this._isTowerComplete(td.tower)) {
        this._completeTower(tableId);
      }
    }, 300);
  }

  _updateBubble(tableId) {
    const td = this.tables[tableId];
    const el = td.el;
    const oldBubble = el.querySelector(".cb-order-bubble");
    if (oldBubble) oldBubble.remove();

    if (td.state !== "ordering" || !td.pendingRecipes || td.pendingRecipes.length === 0) return;

    // Cycle to next unique pending recipe
    const uniquePending = [...new Map(td.pendingRecipes.map(r => [r.id, r])).values()];
    if (td._displayIdx === undefined) td._displayIdx = 0;
    td._displayIdx = (td._displayIdx + 1) % uniquePending.length;

    const filled = this._towerFilledCount(td.tower);
    const bubble = document.createElement("div");
    bubble.className = "cb-order-bubble";

    const r = uniquePending[td._displayIdx];
    const request = r ? `<span>${r.icon}</span> ${r.name}` : "";

    bubble.innerHTML = `${request} <span class="bubble-count">${filled}/${this.PLATES_TO_COMPLETE}</span>`;
    el.appendChild(bubble);
  }

  /* ── Tower complete → success flow ── */

  _completeTower(tableId) {
    const td = this.tables[tableId];

    // Count as a success
    this.successCount++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    this.totalCustomersServed++;
    this._updateHud();

    // Tower complete → served state
    td.state = "served";
    this._renderTable(tableId);

    // served → eating → messy
    setTimeout(() => {
      if (td.state !== "served") return;
      td.state = "eating";
      this._renderTable(tableId);

      setTimeout(() => {
        if (td.state !== "eating") return;
        td.state = "messy";
        this._renderTable(tableId);

        this._checkShiftComplete();
      }, 1500);
    }, 1200);
  }

  /* ══════════════════════════════════════════════════════════════
     GAME LOOP
     ══════════════════════════════════════════════════════════════ */

  async start() {
    if (typeof cafeDataReady !== "undefined") {
      await cafeDataReady;
    }

    // Reset state
    this.successCount = 0;
    this.mistakeCount = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.totalCustomersServed = 0;
    this.plates.forEach(p => p.el.remove());
    this.plates = [];
    this._plateIdSeq = 0;
    this._spawnTimer = 0;
    this.serveResult.classList.add("hidden");
    this.shiftComplete.classList.add("hidden");

    // Reset all tables
    Object.keys(this.tables).forEach(id => {
      this.tables[id].state = "empty";
      this.tables[id].customers = [];
      this.tables[id].tower = this._createEmptyTower();
      this._renderTable(Number(id));
    });

    this._updateHud();
    this._seatNewCustomers();

    this._running = true;
    this._lastFrame = performance.now();
    this._tick(this._lastFrame);
  }

  stop() {
    this._running = false;
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = null;
    }
  }

  _tick(now) {
    if (!this._running) return;

    const dt = Math.min((now - this._lastFrame) / 1000, 0.1);
    this._lastFrame = now;

    this._spawnTimer += dt * 1000;
    if (this._spawnTimer >= this.SPAWN_INTERVAL) {
      this._spawnTimer -= this.SPAWN_INTERVAL;
      this._spawnPlate();
    }

    this._movePlates(dt);

    this._animFrameId = requestAnimationFrame(t => this._tick(t));
  }

  /* ══════════════════════════════════════════════════════════════
     HUD & RESULTS
     ══════════════════════════════════════════════════════════════ */

  _updateHud() {
    this.hudDishCount.textContent = `${this.successCount} / ${this.ordersRequired}`;
    const pct = Math.min(100, (this.successCount / this.ordersRequired) * 100);
    this.hudProgressFill.style.width = pct + "%";
    this.hudStreak.textContent = `Streak: ${this.streak}`;
    this.hudMistakes.textContent = `\u274C ${this.mistakeCount}`;
  }

  _checkShiftComplete() {
    if (this.successCount >= this.ordersRequired) {
      const hasActive = Object.values(this.tables).some(t => t.state !== "empty");
      if (!hasActive) {
        this._completeShift();
      }
    }
  }

  _completeShift() {
    this.stop();

    let rating, ratingEmoji;
    if (this.mistakeCount === 0) { rating = "Perfect"; ratingEmoji = "\u2728\u2728\u2728"; }
    else if (this.mistakeCount <= 2) { rating = "Great"; ratingEmoji = "\u2728\u2728"; }
    else if (this.mistakeCount <= 4) { rating = "Not bad"; ratingEmoji = "\u2728"; }
    else { rating = "Rough"; ratingEmoji = "\uD83D\uDCA5"; }

    this.shiftSummary.innerHTML = `
      <p>Towers completed: <strong>${this.successCount}</strong></p>
      <p>Best streak: <strong>${this.bestStreak}</strong></p>
      <p>Mistakes: <strong>${this.mistakeCount}</strong></p>
      <p style="font-size:1.3rem; margin-top:12px;">${ratingEmoji} ${rating}</p>
    `;
    this.shiftComplete.classList.remove("hidden");
  }

  /* ══════════════════════════════════════════════════════════════
     DATA HELPERS
     ══════════════════════════════════════════════════════════════ */

  _getRecipe(id) {
    if (typeof RECIPES !== "undefined" && RECIPES[id]) return RECIPES[id];
    const fb = this._fallbackRecipes();
    return fb.find(r => r.id === id) || null;
  }

  _getAvailableRecipes() {
    if (typeof RECIPES !== "undefined" && Object.keys(RECIPES).length > 0) {
      return Object.values(RECIPES);
    }
    return this._fallbackRecipes();
  }

  _fallbackRecipes() {
    return [
      { id: "coffee-espresso",   name: "Espresso",       icon: "\u2615",           category: "drink-coffee" },
      { id: "coffee-latte",      name: "Latte",          icon: "\uD83E\uDD5B",     category: "drink-coffee" },
      { id: "tea-chamomile",     name: "Chamomile Tea",  icon: "\uD83C\uDF75",     category: "drink-tea" },
      { id: "juice-orange",      name: "Orange Juice",   icon: "\uD83E\uDDC3",     category: "drink-juice" },
      { id: "cake-strawberry",   name: "Strawberry Cake",icon: "\uD83C\uDF70",     category: "dessert-cake" },
      { id: "pie-apple",         name: "Apple Pie",      icon: "\uD83E\uDD67",     category: "dessert-pie" },
      { id: "sandwich-club",     name: "Club Sandwich",  icon: "\uD83E\uDD6A",     category: "food-sandwich" },
      { id: "salad-garden",      name: "Garden Salad",   icon: "\uD83E\uDD57",     category: "food-salad" },
      { id: "soup-tomato",       name: "Tomato Soup",    icon: "\uD83C\uDF72",     category: "food-soup" },
      { id: "cookie-chocolate",  name: "Choc Cookie",    icon: "\uD83C\uDF6A",     category: "dessert-cookie" },
      { id: "muffin-blueberry",  name: "Blueberry Muffin",icon: "\uD83E\uDDC1",   category: "dessert-muffin" },
      { id: "pasta-carbonara",   name: "Carbonara",      icon: "\uD83C\uDF5D",     category: "food-pasta" },
    ];
  }

  /* ══════════════════════════════════════════════════════════════
     UTILITIES
     ══════════════════════════════════════════════════════════════ */

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

/* ── Initialize ── */
let conveyor;
document.addEventListener("DOMContentLoaded", () => {
  conveyor = new ConveyorBeltEngine();
  window.conveyor = conveyor;
  conveyor.start();
});

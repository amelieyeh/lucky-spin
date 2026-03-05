// --- DOM refs ---
const homeScreen = document.getElementById("homeScreen");
const spinScreen = document.getElementById("spinScreen");
const homeCards = document.getElementById("homeCards");
const spinBtn = document.getElementById("spinBtn");
const backBtn = document.getElementById("backBtn");
const spinTitle = document.getElementById("spinTitle");
const modal = document.getElementById("resultModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
const createModal = document.getElementById("createModal");
const createModalClose = document.getElementById("createModalClose");
const descriptionEl = document.getElementById("description");
const gridContainer = document.getElementById("gridContainer");

let wheelData = null;
let spinning = false;
let displayItems = [];
let BUILTIN_REGIONS = {};

// --- Map translations ---
const MAP_NAMES_ZH = {
  Taiwan: "台灣",
  Tokyo23: "東京23区",
  Japan: "日本",
  France: "法國",
  Italy: "義大利",
  Korea: "韓國",
  UK: "英國",
  USA: "美國",
  Germany: "德國",
  Spain: "西班牙",
  Thailand: "泰國",
};

// --- Region colors (8 regions of Japan) ---
const REGION_COLORS = {
  hokkaido: "#2D4A7A",
  tohoku:   "#1E97A0",
  kanto:    "#4CAF50",
  chubu:    "#FDB813",
  kinki:    "#F57C00",
  chugoku:  "#E53935",
  shikoku:  "#8E24AA",
  kyushu:   "#5C2D91",
};

// --- Preset spins ---
const presetSpins = [
  {
    name: "電車吃漢",
    map: "Taiwan",
    file: "data/taiwan-railway.json",
    icon: "train",
  },
  {
    name: "東京散步",
    map: "Tokyo23",
    file: "data/tokyo-23.json",
    icon: "tokyo",
  },
];

// --- Train SVG icon ---
const TRAIN_ICON_SVG = `<svg viewBox="0 0 100 120" class="train-icon">
  <!-- Body -->
  <rect x="15" y="10" width="70" height="75" rx="12" fill="#E8E8E8" stroke="#333" stroke-width="2"/>
  <!-- Window band -->
  <rect x="15" y="28" width="70" height="24" fill="#F5576C"/>
  <!-- Front windows -->
  <rect x="24" y="32" width="20" height="16" rx="3" fill="#1a1a2e"/>
  <rect x="56" y="32" width="20" height="16" rx="3" fill="#1a1a2e"/>
  <!-- Headlights -->
  <circle cx="30" cy="20" r="4" fill="#FFD93D"/>
  <circle cx="70" cy="20" r="4" fill="#FFD93D"/>
  <!-- Destination sign -->
  <rect x="35" y="14" width="30" height="10" rx="2" fill="#1a1a2e"/>
  <text x="50" y="22" text-anchor="middle" fill="#4ECDC4" font-size="7" font-weight="bold">自強</text>
  <!-- Door -->
  <rect x="40" y="56" width="20" height="26" rx="3" fill="#CCC" stroke="#999" stroke-width="1"/>
  <line x1="50" y1="56" x2="50" y2="82" stroke="#999" stroke-width="1"/>
  <!-- Orange stripe -->
  <rect x="15" y="52" width="70" height="4" fill="#FF8C42"/>
  <!-- Wheels -->
  <rect x="20" y="88" width="16" height="8" rx="4" fill="#555"/>
  <rect x="64" y="88" width="16" height="8" rx="4" fill="#555"/>
  <!-- Rails -->
  <rect x="10" y="98" width="80" height="3" rx="1" fill="#888"/>
</svg>`;

// --- Japan flag SVG icon ---
const JAPAN_ICON_SVG = `<svg viewBox="0 0 100 70" class="flag-icon">
  <rect width="100" height="70" rx="6" fill="#FFF"/>
  <circle cx="50" cy="35" r="16" fill="#BC002D"/>
</svg>`;

// --- Tokyo Tower SVG icon ---
const TOKYO_ICON_SVG = `<svg viewBox="0 0 100 120" class="tokyo-icon">
  <!-- Tower body -->
  <polygon points="50,5 35,95 65,95" fill="none" stroke="#FF4757" stroke-width="3"/>
  <!-- Cross beams -->
  <line x1="39" y1="40" x2="61" y2="40" stroke="#FF4757" stroke-width="2"/>
  <line x1="37" y1="55" x2="63" y2="55" stroke="#FF4757" stroke-width="2"/>
  <line x1="36" y1="70" x2="64" y2="70" stroke="#FF4757" stroke-width="2"/>
  <!-- Observation deck -->
  <rect x="42" y="30" width="16" height="8" rx="2" fill="#FFF" stroke="#FF4757" stroke-width="1.5"/>
  <!-- Antenna -->
  <line x1="50" y1="5" x2="50" y2="0" stroke="#FF4757" stroke-width="2"/>
  <!-- Base -->
  <line x1="28" y1="95" x2="72" y2="95" stroke="#FF4757" stroke-width="3" stroke-linecap="round"/>
  <!-- Legs spread -->
  <line x1="35" y1="95" x2="25" y2="108" stroke="#FF4757" stroke-width="2.5"/>
  <line x1="65" y1="95" x2="75" y2="108" stroke="#FF4757" stroke-width="2.5"/>
  <!-- Ground -->
  <line x1="15" y1="108" x2="85" y2="108" stroke="#888" stroke-width="2"/>
</svg>`;

const MAP_ICONS = { Japan: JAPAN_ICON_SVG, Tokyo23: TOKYO_ICON_SVG, Taiwan: TRAIN_ICON_SVG };

function getMapIcon(map, count) {
  return MAP_ICONS[map] || `<span class="custom-icon">${count}</span>`;
}

// --- Custom spin storage ---

function getSavedSpins() {
  try { return JSON.parse(localStorage.getItem("customSpins") || "[]"); }
  catch { return []; }
}

function saveCustomSpin(data) {
  const spins = getSavedSpins();
  data._id = Date.now();
  spins.push(data);
  localStorage.setItem("customSpins", JSON.stringify(spins));
}

function deleteCustomSpin(id) {
  const spins = getSavedSpins().filter((s) => s._id !== id);
  localStorage.setItem("customSpins", JSON.stringify(spins));
  renderHomeCards();
}

function downloadJson(data) {
  const { _id, ...clean } = data;
  const blob = new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = (clean.title || "spin").replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "-").toLowerCase();
  a.download = `${slug}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Init ---

async function init() {
  try {
    const resp = await fetch("data/builtin-regions.json");
    BUILTIN_REGIONS = await resp.json();
  } catch (e) { console.warn("Failed to load builtin regions:", e); }

  renderHomeCards();

  backBtn.addEventListener("click", goHome);
  spinBtn.addEventListener("click", startSpin);
  modalClose.addEventListener("click", () => modal.classList.remove("visible"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("visible"); });
  createModalClose.addEventListener("click", () => createModal.classList.remove("visible"));
  createModal.addEventListener("click", (e) => { if (e.target === createModal) createModal.classList.remove("visible"); });

  setupCreateForm();
}

function renderHomeCards() {
  homeCards.innerHTML = "";

  presetSpins.forEach((spin) => {
    const card = document.createElement("div");
    card.className = "home-card";
    const mapZh = MAP_NAMES_ZH[spin.map] || spin.map;
    const label = spin.map ? `${spin.name} - ${mapZh}` : spin.name;

    const ICONS = { train: TRAIN_ICON_SVG, tokyo: TOKYO_ICON_SVG };
    const iconHtml = ICONS[spin.icon] || "";

    card.innerHTML = `
      <div class="card-icon">${iconHtml}</div>
      <div class="card-label">${label}</div>
    `;
    card.addEventListener("click", () => loadPreset(spin));
    homeCards.appendChild(card);
  });

  // Saved custom spins
  getSavedSpins().forEach((spin) => {
    const card = document.createElement("div");
    card.className = "home-card home-card-custom";
    const mapZh = spin.map ? (MAP_NAMES_ZH[spin.map] || spin.map) : "";
    const label = mapZh ? `${spin.title} - ${mapZh}` : spin.title;
    card.innerHTML = `
      <button class="card-delete" title="Delete">&times;</button>
      <div class="card-icon">${getMapIcon(spin.map, spin.items.length)}</div>
      <div class="card-label">${label}</div>
    `;
    card.querySelector(".card-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCustomSpin(spin._id);
    });
    card.addEventListener("click", () => enterSpin(spin));
    homeCards.appendChild(card);
  });

  // Create card
  const createCard = document.createElement("div");
  createCard.className = "home-card home-card-create";
  createCard.innerHTML = `
    <div class="card-icon"><span class="create-plus">+</span></div>
    <div class="card-label">Create</div>
  `;
  createCard.addEventListener("click", openCreateModal);
  homeCards.appendChild(createCard);
}

async function loadPreset(spin) {
  const resp = await fetch(spin.file);
  const json = await resp.json();
  enterSpin(json);
}

function enterSpin(data) {
  wheelData = data;
  const mapZh = data.map ? (MAP_NAMES_ZH[data.map] || data.map) : "";
  const titleText = mapZh ? `${data.title} - ${mapZh}` : data.title;
  spinTitle.textContent = titleText;
  descriptionEl.textContent = data.description || "";
  spinBtn.textContent = data.spinText || "Spin!";
  spinBtn.disabled = false;

  displayItems = wheelData.items;
  renderGrid();

  homeScreen.hidden = true;
  spinScreen.hidden = false;
}

function goHome() {
  spinScreen.hidden = true;
  homeScreen.hidden = false;
  modal.classList.remove("visible");
  wheelData = null;
  spinning = false;
  renderHomeCards();
}

// --- Create flow ---

function setupCreateForm() {
  const fileInput = document.getElementById("createFileInput");
  const fileName = document.getElementById("createFileName");
  const submitBtn = document.getElementById("createSubmit");
  const mapSelect = document.getElementById("createMap");
  const builtinHint = document.getElementById("builtinHint");
  const jsonSection = document.getElementById("jsonFileSection");
  let importedJson = null;

  function updateFormState() {
    const region = mapSelect.value;
    const hasBuiltin = !!BUILTIN_REGIONS[region];
    if (hasBuiltin) {
      builtinHint.textContent = `${BUILTIN_REGIONS[region].items.length} items will be auto-loaded`;
      builtinHint.hidden = false;
      jsonSection.hidden = true;
      submitBtn.disabled = false;
    } else {
      builtinHint.hidden = true;
      jsonSection.hidden = false;
      submitBtn.disabled = !importedJson;
    }
  }

  mapSelect.addEventListener("change", updateFormState);

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importedJson = JSON.parse(ev.target.result);
      submitBtn.disabled = false;
    };
    reader.readAsText(file);
  });

  submitBtn.addEventListener("click", () => {
    const map = mapSelect.value;
    const builtin = BUILTIN_REGIONS[map];

    if (!builtin && !importedJson) return;

    const baseJson = importedJson || {};
    const builtinItems = builtin ? builtin.items : [];

    const title = document.getElementById("createTitle").value || baseJson.title || "My Spin";
    const description = document.getElementById("createDescription").value || baseJson.description || "";
    const origin = document.getElementById("createOrigin").value || baseJson.origin || "";
    const searchSuffix = document.getElementById("createSearchSuffix").value;
    const spinText = document.getElementById("createSpinText").value || baseJson.spinText || "Spin!";

    const data = {
      ...baseJson,
      title,
      description,
      origin,
      map,
      searchSuffix: searchSuffix !== "" ? searchSuffix : (builtin ? builtin.searchSuffix : (baseJson.searchSuffix || "")),
      spinText,
      items: baseJson.items || builtinItems,
    };

    saveCustomSpin(data);
    downloadJson(data);
    createModal.classList.remove("visible");
    enterSpin(data);
  });
}

function openCreateModal() {
  // Reset form
  document.getElementById("createTitle").value = "";
  document.getElementById("createDescription").value = "";
  document.getElementById("createOrigin").value = "";
  document.getElementById("createMap").value = "";
  document.getElementById("createSpinText").value = "";
  document.getElementById("createSearchSuffix").value = "";
  document.getElementById("createFileName").textContent = "";
  document.getElementById("createSubmit").disabled = true;
  document.getElementById("createFileInput").value = "";
  document.getElementById("builtinHint").hidden = true;
  document.getElementById("jsonFileSection").hidden = false;

  createModal.classList.add("visible");
}

// --- Shape maps ---

const SHAPE_MAPS = {
  Taiwan: {
    cols: 13,
    rows: [
      [10, 2],  [9, 3],   [8, 5],   [7, 6],   [6, 7],   [5, 8],
      [4, 9],   [3, 10],  [3, 10],  [2, 11],  [2, 11],  [1, 12],
      [1, 12],  [0, 13],  [0, 13],  [0, 13],  [1, 12],  [1, 12],
      [2, 11],  [2, 11],  [2, 10],  [3, 9],   [3, 8],   [4, 7],
      [4, 5],   [5, 4],   [6, 2],   [6, 2],
    ],
  },
  Japan: {
    cols: 9,
    totalRows: 17,
    // Each: [col, row]
    positions: [
      [8, 0],   // 0:  北海道
      [7, 1],   // 1:  青森
      [6, 2],   // 2:  秋田
      [7, 2],   // 3:  岩手
      [6, 3],   // 4:  山形
      [7, 3],   // 5:  宮城
      [5, 4],   // 6:  新潟
      [6, 5],   // 7:  群馬
      [7, 5],   // 8:  栃木
      [7, 4],   // 9:  福島
      [4, 5],   // 10: 富山
      [5, 5],   // 11: 長野
      [6, 6],   // 12: 埼玉
      [8, 5],   // 13: 茨城
      [8, 6],   // 14: 千葉
      [3, 6],   // 15: 石川
      [4, 6],   // 16: 岐阜
      [5, 6],   // 17: 山梨
      [7, 6],   // 18: 東京
      [7, 7],   // 19: 神奈川
      [3, 7],   // 20: 福井
      [4, 7],   // 21: 滋賀
      [5, 7],   // 22: 愛知
      [6, 7],   // 23: 静岡
      [4, 8],   // 24: 京都
      [5, 8],   // 25: 大阪
      [6, 8],   // 26: 三重
      [6, 9],   // 27: 奈良
      [2, 8],   // 28: 島根
      [3, 8],   // 29: 鳥取
      [5, 9],   // 30: 兵庫
      [2, 9],   // 31: 山口
      [3, 9],   // 32: 広島
      [4, 9],   // 33: 岡山
      [7, 9],   // 34: 和歌山
      [3, 10],  // 35: 愛媛
      [4, 10],  // 36: 香川
      [6, 10],  // 37: 徳島
      [4, 11],  // 38: 高知
      [0, 12],  // 39: 福岡
      [1, 12],  // 40: 大分
      [0, 13],  // 41: 佐賀
      [0, 14],  // 42: 長崎
      [1, 14],  // 43: 熊本
      [2, 14],  // 44: 宮崎
      [1, 15],  // 45: 鹿児島
      [7, 16],  // 46: 沖縄
    ],
  },
  Tokyo23: {
    cols: 6,
    rows: [
      [1, 4],   // row 0 - Nerima, Itabashi, Kita, Adachi
      [0, 6],   // row 1 - widest: Suginami~Katsushika
      [0, 6],   // row 2 - Setagaya~Sumida
      [1, 5],   // row 3 - Meguro~Koto
      [2, 2],   // row 4 - Ota, Edogawa
    ],
  },
};

// --- Grid rendering ---

function renderGrid() {
  gridContainer.innerHTML = "";
  gridContainer.classList.remove("grid-plain", "grid-shaped", "grid-map");
  gridContainer.style.gridTemplateColumns = "";
  gridContainer.style.gridTemplateRows = "";
  const mapKey = wheelData.map || "";
  const shape = SHAPE_MAPS[mapKey];
  if (shape && shape.type === "map") { renderMapLayout(shape); }
  else if (shape) { renderShapedGrid(shape); }
  else { renderPlainGrid(); }
}

function renderShapedGrid(shape) {
  gridContainer.classList.remove("grid-plain");
  gridContainer.classList.add("grid-shaped");
  gridContainer.style.gridTemplateColumns = `repeat(${shape.cols}, 1fr)`;

  if (shape.positions) {
    gridContainer.style.gridTemplateRows = `repeat(${shape.totalRows}, 1fr)`;
    // Render item cells at explicit positions
    shape.positions.forEach((pos, i) => {
      if (i >= displayItems.length) return;
      const [col, row, colSpan, rowSpan] = pos;
      const cell = createCell(displayItems[i], i);
      cell.style.gridColumn = `${col + 1} / span ${colSpan || 1}`;
      cell.style.gridRow = `${row + 1} / span ${rowSpan || 1}`;
      gridContainer.appendChild(cell);
    });
    // Render empty spacer cells
    (shape.emptyPositions || []).forEach((pos) => {
      const [col, row, colSpan, rowSpan] = pos;
      const spacer = document.createElement("div");
      spacer.className = "grid-cell grid-cell-empty";
      spacer.style.gridColumn = `${col + 1} / span ${colSpan || 1}`;
      spacer.style.gridRow = `${row + 1} / span ${rowSpan || 1}`;
      gridContainer.appendChild(spacer);
    });
  } else {
    gridContainer.style.gridTemplateRows = `repeat(${shape.rows.length}, 1fr)`;
    let itemIdx = 0;
    shape.rows.forEach((rowDef, row) => {
      const [startCol, count] = rowDef;
      for (let c = 0; c < count && itemIdx < displayItems.length; c++) {
        const cell = createCell(displayItems[itemIdx], itemIdx);
        cell.style.gridRow = row + 1;
        cell.style.gridColumn = startCol + c + 1;
        gridContainer.appendChild(cell);
        itemIdx++;
      }
    });
  }
}

function renderMapLayout(shape) {
  gridContainer.classList.add("grid-map");
  shape.layout.forEach((pos, i) => {
    if (i >= displayItems.length) return;
    const [x, y, w, h, clipPath] = pos;
    const cell = createCell(displayItems[i], i);
    cell.style.left = x + "%";
    cell.style.top = y + "%";
    cell.style.width = w + "%";
    cell.style.height = h + "%";
    if (clipPath) cell.style.clipPath = clipPath;
    gridContainer.appendChild(cell);
  });
}

function renderPlainGrid() {
  gridContainer.classList.remove("grid-shaped");
  gridContainer.classList.add("grid-plain");
  gridContainer.style.gridTemplateColumns = "";
  gridContainer.style.gridTemplateRows = "";
  displayItems.forEach((item, i) => gridContainer.appendChild(createCell(item, i)));
}

function createCell(item, index) {
  const cell = document.createElement("div");
  cell.className = "grid-cell";
  cell.dataset.index = index;
  cell.style.setProperty("--cell-color", item.color);
  if (item.region && REGION_COLORS[item.region]) {
    cell.style.setProperty("--region-color", REGION_COLORS[item.region]);
    cell.classList.add("grid-cell-region");
  }
  cell.innerHTML = `<span class="grid-label">${item.label}</span>`;
  return cell;
}

function highlightCell(index) {
  gridContainer.querySelectorAll(".grid-cell").forEach((cell, i) => {
    cell.classList.toggle("active", i === index);
  });
}

// --- Sound effects ---

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTick(pitch) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.value = 600 + pitch * 400;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

function playWin() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

// --- Spin animation ---

function startSpin() {
  if (spinning || !wheelData) return;
  spinning = true;
  spinBtn.disabled = true;
  spinBtn.classList.add("spinning");
  modal.classList.remove("visible");

  displayItems = wheelData.items;
  renderGrid();

  const duration = 5000;
  const startTime = performance.now();
  const finalIndex = Math.floor(Math.random() * displayItems.length);
  let lastSwitch = 0;
  let currentLit = -1;

  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const interval = 50 + 450 * (t * t);

    if (elapsed - lastSwitch >= interval) {
      lastSwitch = elapsed;
      if (t < 0.95) {
        let next;
        do { next = Math.floor(Math.random() * displayItems.length); }
        while (next === currentLit && displayItems.length > 1);
        currentLit = next;
      } else {
        currentLit = finalIndex;
      }
      highlightCell(currentLit);
      playTick(1 - t);
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      highlightCell(finalIndex);
      spinning = false;
      spinBtn.disabled = false;
      spinBtn.classList.remove("spinning");
      playWin();
      showResult(finalIndex);
    }
  }
  requestAnimationFrame(animate);
}

function showResult(index) {
  const selected = displayItems[index];
  const origin = wheelData.origin;
  const city = selected.city ? `<div class="result-city">${selected.city}</div>` : "";
  const suffix = wheelData.searchSuffix !== undefined ? wheelData.searchSuffix : "";
  const searchName = `${selected.label}${suffix}`;
  const mapQuery = encodeURIComponent(searchName);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&hl=zh-TW&output=embed`;
  const mapLinkUrl = `https://www.google.com/maps/search/${mapQuery}?hl=zh-TW`;
  const originHtml = origin ? `<div class="result-origin">From ${origin}</div>` : "";

  modalBody.innerHTML = `
    ${originHtml}
    <div class="result-destination">${selected.label}</div>
    ${city}
    <div class="result-cta">Let's go!</div>
    <div class="result-map">
      <a href="${mapLinkUrl}" target="_blank" rel="noopener">
        <iframe src="${mapEmbedUrl}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </a>
      <a href="${mapLinkUrl}" target="_blank" rel="noopener" class="map-link">在 Google Maps 中開啟</a>
    </div>
  `;
  modal.classList.add("visible");
}

// --- Start ---
init();

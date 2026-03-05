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

// --- Map translations ---
const MAP_NAMES_ZH = {
  Taiwan: "台灣",
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

// --- Preset spins ---
const presetSpins = [
  {
    name: "電車吃漢",
    map: "Taiwan",
    file: "data/taiwan-railway.json",
    icon: "train",
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

// --- Init ---

function init() {
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

    let iconHtml = "";
    if (spin.icon === "train") {
      iconHtml = TRAIN_ICON_SVG;
    }

    card.innerHTML = `
      <div class="card-icon">${iconHtml}</div>
      <div class="card-label">${label}</div>
    `;
    card.addEventListener("click", () => loadPreset(spin));
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
}

// --- Create flow ---

function setupCreateForm() {
  const fileInput = document.getElementById("createFileInput");
  const fileName = document.getElementById("createFileName");
  const submitBtn = document.getElementById("createSubmit");
  let importedJson = null;

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
    if (!importedJson) return;

    const title = document.getElementById("createTitle").value || importedJson.title || "My Spin";
    const description = document.getElementById("createDescription").value || importedJson.description || "";
    const origin = document.getElementById("createOrigin").value || importedJson.origin || "";
    const map = document.getElementById("createMap").value || importedJson.map || "";
    const spinText = document.getElementById("createSpinText").value || importedJson.spinText || "Spin!";

    const data = {
      ...importedJson,
      title,
      description,
      origin,
      map,
      spinText,
    };

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
  document.getElementById("createFileName").textContent = "";
  document.getElementById("createSubmit").disabled = true;
  document.getElementById("createFileInput").value = "";

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
};

// --- Grid rendering ---

function renderGrid() {
  gridContainer.innerHTML = "";
  const mapKey = wheelData.map || "";
  const shape = SHAPE_MAPS[mapKey];
  if (shape) { renderShapedGrid(shape); } else { renderPlainGrid(); }
}

function renderShapedGrid(shape) {
  gridContainer.classList.remove("grid-plain");
  gridContainer.classList.add("grid-shaped");
  gridContainer.style.gridTemplateColumns = `repeat(${shape.cols}, 1fr)`;
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
  const stationName = `${selected.label}車站`;
  const mapQuery = encodeURIComponent(stationName);
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

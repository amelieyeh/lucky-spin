const spinBtn = document.getElementById("spinBtn");
const modal = document.getElementById("resultModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
const dataSelect = document.getElementById("dataSelect");
const fileInput = document.getElementById("fileInput");
const descriptionEl = document.getElementById("description");
const gridContainer = document.getElementById("gridContainer");

let wheelData = null;
let spinning = false;
let displayItems = [];

// Available JSON files in data/ directory
const availableFiles = [
  { name: "Taiwan Railway Stations", file: "data/taiwan-railway.json" },
];

// --- Init ---

function init() {
  availableFiles.forEach((entry) => {
    const opt = document.createElement("option");
    opt.value = entry.file;
    opt.textContent = entry.name;
    dataSelect.appendChild(opt);
  });

  dataSelect.addEventListener("change", async () => {
    if (!dataSelect.value) return;
    const resp = await fetch(dataSelect.value);
    const json = await resp.json();
    loadData(json);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = JSON.parse(ev.target.result);
      loadData(json);
      const opt = document.createElement("option");
      opt.value = `imported:${file.name}`;
      opt.textContent = file.name;
      dataSelect.appendChild(opt);
      dataSelect.value = opt.value;
    };
    reader.readAsText(file);
  });

  spinBtn.addEventListener("click", startSpin);

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  modal.classList.remove("visible");
}

// --- Load data ---

function loadData(data) {
  wheelData = data;
  descriptionEl.textContent = data.description || "";
  modal.classList.remove("visible");
  spinBtn.disabled = false;
  pickDisplayItems();
  renderGrid();
}

function pickDisplayItems() {
  displayItems = wheelData.items;
}

// --- Grid rendering ---

function renderGrid() {
  gridContainer.innerHTML = "";
  displayItems.forEach((item, i) => {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = i;
    cell.style.setProperty("--cell-color", item.color);
    cell.innerHTML = `<span class="grid-label">${item.label}</span>`;
    gridContainer.appendChild(cell);
  });
}

function highlightCell(index) {
  const cells = gridContainer.querySelectorAll(".grid-cell");
  cells.forEach((cell, i) => {
    cell.classList.toggle("active", i === index);
  });
}

function clearHighlight() {
  gridContainer.querySelectorAll(".grid-cell").forEach((cell) => {
    cell.classList.remove("active");
  });
}

// --- Spin animation (random lighting, 5s ease-out) ---

function startSpin() {
  if (spinning || !wheelData) return;
  spinning = true;
  spinBtn.disabled = true;
  spinBtn.classList.add("spinning");
  modal.classList.remove("visible");

  // Re-shuffle displayed items each spin
  pickDisplayItems();
  renderGrid();

  const duration = 5000;
  const startTime = performance.now();
  // Pick final winner index ahead of time
  const finalIndex = Math.floor(Math.random() * displayItems.length);

  // Interval-based lighting: starts fast (~50ms), slows to ~500ms
  let lastSwitch = 0;
  let currentLit = -1;

  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);

    // Interval increases from 50ms to 500ms using ease-out
    const interval = 50 + 450 * easeIn(t);

    if (elapsed - lastSwitch >= interval) {
      lastSwitch = elapsed;

      if (t < 0.95) {
        // Random highlight
        let next;
        do {
          next = Math.floor(Math.random() * displayItems.length);
        } while (next === currentLit && displayItems.length > 1);
        currentLit = next;
      } else {
        // Final phase: lock to winner
        currentLit = finalIndex;
      }

      highlightCell(currentLit);
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Ensure final highlight
      highlightCell(finalIndex);
      spinning = false;
      spinBtn.disabled = false;
      spinBtn.classList.remove("spinning");
      showResult(finalIndex);
    }
  }

  requestAnimationFrame(animate);
}

function easeIn(t) {
  return t * t;
}

function showResult(index) {
  const selected = displayItems[index];
  const origin = wheelData.origin;
  const city = selected.city ? `<div class="result-city">${selected.city}</div>` : "";
  const stationName = `${selected.label}車站`;
  const mapQuery = encodeURIComponent(stationName);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapLinkUrl = `https://www.google.com/maps/search/${mapQuery}`;

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
      <a href="${mapLinkUrl}" target="_blank" rel="noopener" class="map-link">Open in Google Maps</a>
    </div>
  `;
  modal.classList.add("visible");
}

// --- Wheel drawing (preserved, not currently used) ---

/*
let currentAngle = 0;

function drawEmpty() {
  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 10;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#16213e";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Select data to load", cx, cy);
}

function drawWheel() {
  if (!wheelData) return;
  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const items = wheelData.items;
  const n = items.length;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 10;
  const sliceAngle = (Math.PI * 2) / n;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, i) => {
    const startAngle = currentAngle + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${labelFontSize(n)}px sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 3;
    ctx.fillText(item.label, r - 18, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a2e";
  ctx.fill();
  ctx.strokeStyle = "#f5576c";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function labelFontSize(n) {
  if (n <= 8) return 16;
  if (n <= 12) return 14;
  if (n <= 16) return 13;
  if (n <= 24) return 11;
  if (n <= 36) return 10;
  return 8;
}
*/

// --- Start ---
init();

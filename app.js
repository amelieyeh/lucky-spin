const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultDiv = document.getElementById("result");
const dataSelect = document.getElementById("dataSelect");
const fileInput = document.getElementById("fileInput");
const descriptionEl = document.getElementById("description");

let wheelData = null;
let currentAngle = 0;
let spinning = false;

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
    loadWheel(json);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = JSON.parse(ev.target.result);
      loadWheel(json);
      // Add to dropdown
      const opt = document.createElement("option");
      opt.value = `imported:${file.name}`;
      opt.textContent = file.name;
      dataSelect.appendChild(opt);
      dataSelect.value = opt.value;
    };
    reader.readAsText(file);
  });

  spinBtn.addEventListener("click", spin);

  drawEmpty();
}

// --- Load wheel data ---

function loadWheel(data) {
  wheelData = data;
  descriptionEl.textContent = data.description || "";
  currentAngle = 0;
  resultDiv.hidden = true;
  spinBtn.disabled = false;
  drawWheel();
}

// --- Drawing ---

function drawEmpty() {
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

    // Slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
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

  // Center circle
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
  if (n <= 16) return 13;
  if (n <= 24) return 11;
  return 9;
}

// --- Spin animation ---

function spin() {
  if (spinning || !wheelData) return;
  spinning = true;
  spinBtn.disabled = true;
  resultDiv.hidden = true;

  const duration = 5000;
  const totalRotation = Math.PI * 2 * (8 + Math.random() * 4); // 8-12 full rotations
  const startAngle = currentAngle;
  const startTime = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOut(t);

    currentAngle = startAngle + totalRotation * eased;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      spinBtn.disabled = false;
      showResult();
    }
  }

  requestAnimationFrame(animate);
}

function showResult() {
  const items = wheelData.items;
  const n = items.length;
  const sliceAngle = (Math.PI * 2) / n;

  // The arrow is at the top (angle = -PI/2 = 3PI/2)
  // Normalize current angle
  const normalized = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // Arrow points at -PI/2; the slice at position 0 starts at currentAngle
  // We need to find which slice the arrow (top) falls into
  const arrowAngle = (Math.PI * 2 - normalized + Math.PI * 1.5) % (Math.PI * 2);
  const index = Math.floor(arrowAngle / sliceAngle) % n;

  const selected = items[index];
  const origin = wheelData.origin;

  resultDiv.hidden = false;
  resultDiv.innerHTML = origin
    ? `From <strong>${origin}</strong> to <span class="label">${selected.label}</span>!`
    : `<span class="label">${selected.label}</span>`;
}

// --- Start ---
init();

let chart = null;
let functionCount = 0;

// Color palette
const colors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#f97316",
  "#a855f7",
];

// DOM Elements
const functionsList = document.getElementById("functionsList");
const addFunctionBtn = document.getElementById("addFunction");
const plotButton = document.getElementById("plotButton");
const xMinInput = document.getElementById("xMin");
const xMaxInput = document.getElementById("xMax");
const yMinInput = document.getElementById("yMin");
const yMaxInput = document.getElementById("yMax");
const gridLinesCheckbox = document.getElementById("gridLines");
const axisLinesCheckbox = document.getElementById("axisLines");
const smoothLineCheckbox = document.getElementById("smoothLine");
const functionInfo = document.getElementById("functionInfo");
const coordinates = document.getElementById("coordinates");
const errorToast = document.getElementById("errorToast");
const themeBtn = document.getElementById("themeBtn");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");
const presetButtons = document.querySelectorAll(".preset-pill");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const controlPanel = document.getElementById("controlPanel");
const panelCloseBtn = document.getElementById("panelCloseBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const presetDropdownToggle = document.getElementById("presetDropdownToggle");
const presetDropdownMenu = document.getElementById("presetDropdownMenu");

// Toggle dropdown
presetDropdownToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  presetDropdownMenu.classList.toggle("active");
  presetDropdownToggle.classList.toggle("active");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (
    !presetDropdownToggle.contains(e.target) &&
    !presetDropdownMenu.contains(e.target)
  ) {
    presetDropdownMenu.classList.remove("active");
    presetDropdownToggle.classList.remove("active");
  }
});

// Handle preset selection from dropdown
presetDropdownMenu.addEventListener("click", (e) => {
  if (e.target.classList.contains("preset-dropdown-item")) {
    const func = e.target.dataset.function;
    const card = createFunctionCard(func);
    functionsList.appendChild(card);
    plotFunction();

    // Update dropdown toggle text
    presetDropdownToggle.querySelector("span").textContent = `Added: ${func}`;

    // Close dropdown
    presetDropdownMenu.classList.remove("active");
    presetDropdownToggle.classList.remove("active");

    // Reset dropdown text after 2 seconds
    setTimeout(() => {
      presetDropdownToggle.querySelector("span").textContent =
        "Select a preset function";
    }, 2000);
  }
});

// Close dropdown on mobile panel close
panelCloseBtn.addEventListener("click", () => {
  presetDropdownMenu.classList.remove("active");
  presetDropdownToggle.classList.remove("active");
});

// Reset button functionality
resetBtn.addEventListener("click", resetAll);

function resetAll() {
  // Reset function inputs - keep only one function card with default value
  functionsList.innerHTML = "";
  functionCount = 0;
  const initialCard = createFunctionCard("x^2");
  functionsList.appendChild(initialCard);

  // Reset function info
  functionInfo.textContent = "Functions: ";
  coordinates.textContent = "Coordinates: (0, 0)";

  // Destroy existing chart and clear canvas
  if (chart) {
    chart.destroy();
    chart = null;
  }

  // Clear the canvas
  const canvas = document.getElementById("functionGraph");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Plot the default function
  plotFunction();

  // Show confirmation message
  showError("Function grafik have been reset");

  // Close mobile panel if needed
  closeMobilePanelIfNeeded();
}

// Download graph as image
downloadBtn.addEventListener("click", () => {
  if (!chart) {
    showError("Please plot a function first");
    return;
  }

  const canvas = document.getElementById("functionGraph");
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "function-graph.png";
  link.href = url;
  link.click();
});

// Mobile menu toggle
mobileMenuBtn.addEventListener("click", () => {
  controlPanel.classList.add("mobile-active");
});

panelCloseBtn.addEventListener("click", () => {
  controlPanel.classList.remove("mobile-active");
});

// Close mobile panel when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 768) {
    if (
      controlPanel.classList.contains("mobile-active") &&
      !controlPanel.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)
    ) {
      controlPanel.classList.remove("mobile-active");
    }
  }
});

// Close mobile panel after plotting
function closeMobilePanelIfNeeded() {
  if (
    window.innerWidth <= 768 &&
    controlPanel.classList.contains("mobile-active")
  ) {
    controlPanel.classList.remove("mobile-active");
  }
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
}

// Toggle theme
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  if (chart) plotFunction();
});

// Help modal
helpBtn.addEventListener("click", () => {
  helpModal.classList.add("active");
});

closeHelp.addEventListener("click", () => {
  helpModal.classList.remove("active");
});

helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.classList.remove("active");
  }
});

// Show error toast
function showError(message) {
  errorToast.textContent = message;
  errorToast.classList.add("show");
  setTimeout(() => {
    errorToast.classList.remove("show");
  }, 3000);
}

// Generate points for function
function generatePoints(func, xMin, xMax) {
  const points = [];
  const steps = 1000;
  const stepSize = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * stepSize;
    try {
      const scope = { x: x, pi: Math.PI, e: Math.E };
      const y = math.evaluate(func, scope);
      if (!isNaN(y) && isFinite(y)) {
        points.push({ x: x, y: y });
      }
    } catch (error) {
      return [];
    }
  }

  return points;
}

// Create function card
function createFunctionCard(func = "") {
  functionCount++;
  const id = functionCount;

  const card = document.createElement("div");
  card.className = "function-card";
  card.dataset.id = id;

  card.innerHTML = `
        <div class="function-card-header">
            <span class="function-label">f${id}(x) =</span>
            <button class="remove-btn" title="Remove">×</button>
        </div>
        <div class="function-input-row">
            <input type="text" class="function-input" id="function-${id}" 
                   value="${func}" placeholder="e.g., x^2, sin(x)">
            <input type="color" class="color-picker" id="color-${id}" 
                   value="${colors[(id - 1) % colors.length]}">
        </div>
    `;

  const removeBtn = card.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => {
    if (document.querySelectorAll(".function-card").length > 1) {
      card.remove();
      plotFunction();
    } else {
      showError("At least one function is required");
    }
  });

  const input = card.querySelector(".function-input");
  input.addEventListener("input", debounce(plotFunction, 500));

  const colorPicker = card.querySelector(".color-picker");
  colorPicker.addEventListener("change", plotFunction);

  return card;
}

// Add function
addFunctionBtn.addEventListener("click", () => {
  const card = createFunctionCard();
  functionsList.appendChild(card);
});

// Get all functions
function getAllFunctions() {
  const functions = [];
  document.querySelectorAll(".function-card").forEach((card) => {
    const id = card.dataset.id;
    const input = document.getElementById(`function-${id}`);
    const color = document.getElementById(`color-${id}`);
    const func = input.value.trim();
    if (func) {
      functions.push({ func, color: color.value, id });
    }
  });
  return functions;
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Plot function
function plotFunction() {
  const xMin = parseFloat(xMinInput.value);
  const xMax = parseFloat(xMaxInput.value);
  const yMin = parseFloat(yMinInput.value);
  const yMax = parseFloat(yMaxInput.value);

  if (xMin >= xMax) {
    showError("X Min must be less than X Max");
    return;
  }

  if (yMin >= yMax) {
    showError("Y Min must be less than Y Max");
    return;
  }

  const functions = getAllFunctions();
  if (functions.length === 0) {
    showError("Please enter at least one function");
    return;
  }

  if (chart) {
    chart.destroy();
  }

  const datasets = [];
  let hasError = false;

  functions.forEach(({ func, color }) => {
    const points = generatePoints(func, xMin, xMax);
    if (points.length === 0) {
      hasError = true;
      showError(`Error in function: ${func}`);
      return;
    }
    datasets.push({
      label: `f(x) = ${func}`,
      data: points,
      borderColor: color,
      backgroundColor: color + "30",
      borderWidth: 3,
      fill: false,
      pointRadius: 0,
      tension: smoothLineCheckbox.checked ? 0.4 : 0,
    });
  });

  if (hasError) return;

  const isLight = document.body.classList.contains("light-mode");
  const gridColor = isLight
    ? "rgba(15, 23, 42, 0.1)"
    : "rgba(139, 147, 184, 0.1)";
  const textColor = isLight ? "#475569" : "#8b93b8";

  // Responsive font sizes
  const isMobile = window.innerWidth <= 768;
  const fontSize = isMobile ? 10 : 12;
  const legendFontSize = isMobile ? 11 : 13;

  const ctx = document.getElementById("functionGraph").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: "center",
          min: xMin,
          max: xMax,
          grid: {
            display: gridLinesCheckbox.checked,
            color: gridColor,
            lineWidth: 1,
          },
          ticks: {
            display: axisLinesCheckbox.checked,
            color: textColor,
            font: {
              size: fontSize,
            },
          },
        },
        y: {
          type: "linear",
          position: "center",
          min: yMin,
          max: yMax,
          grid: {
            display: gridLinesCheckbox.checked,
            color: gridColor,
            lineWidth: 1,
          },
          ticks: {
            display: axisLinesCheckbox.checked,
            color: textColor,
            font: {
              size: fontSize,
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: textColor,
            font: {
              size: legendFontSize,
              family: "'Courier New', monospace",
            },
            padding: isMobile ? 10 : 15,
            usePointStyle: true,
            pointStyle: "line",
            boxWidth: isMobile ? 20 : 30,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: isLight
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(30, 36, 66, 0.95)",
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: isMobile ? 8 : 12,
          displayColors: true,
          titleFont: {
            size: fontSize,
          },
          bodyFont: {
            size: fontSize,
          },
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });

  const functionsList = functions.map((f) => f.func).join(", ");
  functionInfo.textContent = `Functions: ${functionsList}`;

  closeMobilePanelIfNeeded();
}

// Preset buttons
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const func = btn.dataset.function;
    const card = createFunctionCard(func);
    functionsList.appendChild(card);
    plotFunction();
  });
});

// Plot button
plotButton.addEventListener("click", plotFunction);

// Settings change handlers
gridLinesCheckbox.addEventListener("change", plotFunction);
axisLinesCheckbox.addEventListener("change", plotFunction);
smoothLineCheckbox.addEventListener("change", plotFunction);

// Range inputs
[xMinInput, xMaxInput, yMinInput, yMaxInput].forEach((input) => {
  input.addEventListener("change", plotFunction);
});

// Handle window resize to update chart
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (chart) {
      plotFunction();
    }
  }, 250);
});

// Initialize
initTheme();
const initialCard = createFunctionCard("x^2");
functionsList.appendChild(initialCard);
plotFunction();

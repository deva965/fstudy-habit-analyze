
  }
}

// ─── Boo/**
 * Study Habit Analyzer — API-connected script.js
 *
 * Replace YOUR_REPLIT_API_URL below with your actual Replit backend URL,
 * e.g. "https://your-repl-name.replit.app/api"
 *
 * If you serve this from the same Replit domain, you can leave it as "/api".
 */
const API_BASE = "/api";

// ─── Theme ────────────────────────────────────────────────────────────────────

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") document.body.classList.add("dark");

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// ─── Focus / Mood maps ────────────────────────────────────────────────────────

// Map the numeric focus select values (1–5) used in the original HTML to API enums
const FOCUS_TO_API = {
  5: "excellent",
  4: "good",
  3: "average",
  2: "low",
  1: "very_poor",
};

// Map API enum values back to display labels + emojis
const FOCUS_LABEL = {
  excellent: "🔥 Excellent Focus",
  good: "🙂 Good",
  average: "😐 Average",
  low: "😴 Low",
  very_poor: "😫 Very Poor",
};

// Map mood select values to API enums (original HTML values → API)
const MOOD_TO_API = {
  Happy: "happy",
  Normal: "normal",
  Stressed: "stressed",
};

const MOOD_LABEL = {
  happy: "😊 Happy",
  normal: "😐 Normal",
  stressed: "😖 Stressed",
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ─── State (filled on load and after mutations) ───────────────────────────────

let analyticsData = null;
let goalData = null;
let logsData = [];

// ─── Add Entry ────────────────────────────────────────────────────────────────

async function addLog() {
  const dateEl = document.getElementById("date");
  const subjectEl = document.getElementById("subject");
  const hoursEl = document.getElementById("hours");
  const focusEl = document.getElementById("focus");
  const moodEl = document.getElementById("mood");

  const dateVal = dateEl.value;
  const subjectVal = subjectEl.value.trim();
  const hoursVal = parseFloat(hoursEl.value);
  const focusVal = focusEl.value;   // numeric string "1"–"5"
  const moodVal = moodEl.value;     // "Happy" / "Normal" / "Stressed"

  if (!dateVal || !subjectVal || !hoursVal) {
    alert("Please fill in Date, Subject, and Hours Studied.");
    return;
  }

  const focusApiValue = FOCUS_TO_API[focusVal] || "average";
  const moodApiValue = MOOD_TO_API[moodVal] || "normal";

  try {
    await apiFetch("/study-logs", {
      method: "POST",
      body: JSON.stringify({
        date: dateVal,
        subject: subjectVal,
        hoursStudied: hoursVal,
        focusLevel: focusApiValue,
        mood: moodApiValue,
      }),
    });

    // Reset form
    dateEl.value = "";
    subjectEl.value = "";
    hoursEl.value = "";

    await refreshAll();
  } catch (e) {
    alert("Failed to save entry: " + e.message);
  }
}

// ─── Delete a single log ──────────────────────────────────────────────────────

async function deleteLog(id) {
  try {
    await apiFetch("/study-logs/" + id, { method: "DELETE" });
    await refreshAll();
  } catch (e) {
    alert("Failed to delete entry: " + e.message);
  }
}

// ─── Clear all data ───────────────────────────────────────────────────────────

async function clearData() {
  if (!confirm("Delete all study logs?")) return;
  try {
    await apiFetch("/study-logs", { method: "DELETE" });
    await refreshAll();
  } catch (e) {
    alert("Failed to clear data: " + e.message);
  }
}

// ─── Update daily goal ────────────────────────────────────────────────────────

async function updateGoal(newHours) {
  const hours = parseFloat(newHours);
  if (!hours || hours <= 0 || hours > 24) {
    alert("Please enter a goal between 0.5 and 24 hours.");
    return;
  }
  try {
    await apiFetch("/goals", {
      method: "PUT",
      body: JSON.stringify({ dailyGoalHours: hours }),
    });
    await refreshAll();
  } catch (e) {
    alert("Failed to update goal: " + e.message);
  }
}

// ─── Export PDF ───────────────────────────────────────────────────────────────

function exportPDF() {
  window.print();
}

// ─── Render analytics stats ───────────────────────────────────────────────────

function analyze() {
  if (!analyticsData) return;

  const a = analyticsData;

  // Productivity score
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.innerText = Math.round(a.productivityScore) + "/100";

  // Streak
  const streakEl = document.getElementById("streak");
  if (streakEl) streakEl.innerText = a.streakDays + " days";

  // Daily goal badge
  const goalBadgeEl = document.getElementById("goalBadge");
  if (goalBadgeEl) goalBadgeEl.innerText = a.dailyGoalMet ? "✅" : "❌";

  // Progress bar
  const progressBarEl = document.getElementById("progressBar");
  if (progressBarEl) {
    const pct = a.goalHours > 0
      ? Math.min(100, (a.todayHours / a.goalHours) * 100)
      : 0;
    progressBarEl.style.width = pct + "%";
  }

  // Daily goal label
  const dailyGoalEl = document.getElementById("dailyGoal");
  if (dailyGoalEl) dailyGoalEl.innerText = "Daily Goal: " + a.goalHours + " hrs";

  // Weak subject
  const weakEl = document.getElementById("weak");
  if (weakEl) weakEl.innerText = a.weakSubject || "-";

  // Burnout warning
  const burnoutEl = document.getElementById("burnout");
  if (burnoutEl) {
    const stressedCount = logsData.filter(
      (l) => l.mood === "stressed" || l.hoursStudied > 8
    ).length;
    burnoutEl.innerText =
      stressedCount >= 3 ? "⚠ Burnout Risk Detected" : "";
  }

  // Consistency suggestion
  const suggestionEl = document.getElementById("suggestion");
  if (suggestionEl) suggestionEl.innerText = a.consistencyMessage;
}

// ─── Render recent logs list ──────────────────────────────────────────────────

function render() {
  const logsListEl = document.getElementById("logs");
  if (!logsListEl) return;

  if (logsData.length === 0) {
    logsListEl.innerHTML = "<li>No entries yet. Add your first study log!</li>";
    return;
  }

  logsListEl.innerHTML = logsData
    .slice(0, 10)
    .map(
      (l) =>
        `<li data-id="${l.id}">
          <span>${l.date}</span> •
          <span>${l.subject}</span> •
          <span>${l.hoursStudied}h</span> •
          <span>${FOCUS_LABEL[l.focusLevel] || l.focusLevel}</span> •
          <span>${MOOD_LABEL[l.mood] || l.mood}</span>
          <button onclick="deleteLog(${l.id})" title="Delete" style="margin-left:8px;background:none;border:none;cursor:pointer;color:inherit;">🗑</button>
        </li>`
    )
    .join("");
}

// Also support the old "report" element name the original used
function report() {
  const reportListEl = document.getElementById("report");
  if (!reportListEl) return;

  reportListEl.innerHTML = logsData
    .slice(0, 5)
    .map(
      (l) =>
        `<li>${l.date} • ${l.subject} • ${l.hoursStudied}h</li>`
    )
    .join("");
}

// ─── Render charts (Chart.js) ─────────────────────────────────────────────────

let hChart = null;
let sChart = null;

function renderCharts() {
  if (!analyticsData) return;

  // ---- Line chart: daily hours (last 30 days) ----
  const hoursChartEl = document.getElementById("hoursChart");
  if (hoursChartEl && typeof Chart !== "undefined") {
    const dailyHours = (analyticsData.dailyHours || []).slice(-14); // last 14 days
    const labels = dailyHours.map((d) => {
      const [, m, day] = d.date.split("-");
      return m + "/" + day;
    });
    const data = dailyHours.map((d) => d.hours);

    if (hChart) hChart.destroy();
    hChart = new Chart(hoursChartEl, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Study Hours",
            data,
            borderColor: "#00d4ff",
            backgroundColor: "rgba(0,212,255,0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // ---- Pie/doughnut chart: hours by subject ----
  const subjectChartEl = document.getElementById("subjectChart");
  if (subjectChartEl && typeof Chart !== "undefined") {
    const breakdown = analyticsData.subjectBreakdown || [];
    const labels = breakdown.map((s) => s.subject);
    const data = breakdown.map((s) => s.totalHours);

    if (sChart) sChart.destroy();
    if (data.length > 0) {
      sChart = new Chart(subjectChartEl, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                "#00d4ff", "#7c5cbf", "#ff6b6b",
                "#ffd93d", "#6bcb77", "#4d96ff",
              ],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }
}

// ─── Load everything from the API ─────────────────────────────────────────────

async function refreshAll() {
  try {
    const [logs, analytics, goal] = await Promise.all([
      apiFetch("/study-logs"),
      apiFetch("/analytics"),
      apiFetch("/goals"),
    ]);

    logsData = logs || [];
    analyticsData = analytics || null;
    goalData = goal || null;

    // Merge goalHours into analyticsData so analyze() can use it
    if (analyticsData && goalData) {
      analyticsData.goalHours = goalData.dailyGoalHours;
    }

    analyze();
    render();
    report();
    renderCharts();
  } catch (e) {
    console.error("Failed to load data:", e);t ─────────────────────────────────────────────────────────────────────

refreshAll();

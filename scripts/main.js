// --- Theme Toggle ---
const themeToggle = document.getElementById("themeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
if (savedTheme === "dark") {
  sunIcon.style.display = "none";
  moonIcon.style.display = "block";
}

themeToggle.addEventListener("click", () => {
  const current = html.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  if (newTheme === "dark") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
});

// --- Set current month ---
const currentMonth = new Date().getMonth();
document.getElementById("monthFrom").value = currentMonth;
document.getElementById("monthTo").value = 11;

// --- Coordinates lookup ---
const coords = {
  Madeira: [32.6669, -16.9241],
  Santarém: [39.2369, -8.6868],
  Aveiro: [40.6405, -8.6538],
  Cacém: [38.7668, -9.2416],
  Carcavelos: [38.6831, -9.3356],
  Paredes: [41.2053, -8.3314],
  "Açores - São Miguel": [37.7833, -25.5833],
  Trofa: [41.3389, -8.5597],
  "Vila Real de Sto. António": [37.1944, -7.4147],
  Portimão: [37.1367, -8.5376],
  Lisboa: [38.7223, -9.1393],
  Mafra: [38.9378, -9.3265],
  Viseu: [40.661, -7.9097],
  Elvas: [38.881, -7.1629],
  Setúbal: [38.5244, -8.8882],
  Oeiras: [38.6969, -9.3147],
  Porto: [41.1579, -8.6291],
  Albufeira: [37.0889, -8.25],
  Leiria: [39.7437, -8.8071],
  Guimarães: [41.4425, -8.2918],
  Carregado: [39.0225, -8.9608],
  Vilamoura: [37.0769, -8.1137],
  Ericeira: [38.9625, -9.4156],
  Paiã: [38.7833, -9.2167],
  "Quinta da Marinha": [38.6989, -9.4547],
  Famalicão: [41.4089, -8.5197],
  Matosinhos: [41.1844, -8.6947],
  "Caldas da Rainha": [39.4036, -9.1372],
  "São João da Madeira": [40.9007, -8.4907],
  Almeirim: [39.2106, -8.6272],
  "Santo Tirso": [41.3437, -8.4775],
  Odivelas: [38.7939, -9.1853],
  "Vila Nova de Gaia": [41.1239, -8.6118],
  Barreiro: [38.6634, -9.0726],
  Norte: [41.15, -8.63],
  Sul: [37.02, -7.93],
  Sintra: [38.8029, -9.3817],
  Braga: [41.5454, -8.4265],
  Maia: [41.2353, -8.621],
  Coimbra: [40.2033, -8.4103],
};

const levelColors = {
  "fip-only": "#D4AF37",
  "fip-gold": "#D4AF37",
  "fip-silver": "#8C92AC",
  "fip-bronze": "#CD7F32",
  "fip-promises": "#7B1FA2",
  national: "#C62828",
  regional: "#E65100",
  c10k: "#1565C0",
  c5k: "#2E7D32",
  c2k: "#00838F",
  veterans: "#4E342E",
  masters: "#F57F17",
  international: "#AD1457",
  club: "#37474F",
};

const tournaments = Array.isArray(window.tournamentsData)
  ? window.tournamentsData
  : [];

const levelLabels = {
  all: "Todos",
  "fip-gold": "FIP Gold",
  "fip-silver": "FIP Silver",
  "fip-bronze": "FIP Bronze",
  "fip-promises": "FIP Promises / Jovens",
  national: "Camp. Nacional",
  regional: "Camp. Regional",
  c10k: "Circuito 10.000",
  c5k: "Circuito 5.000",
  c2k: "Circuito 2.000",
  masters: "Masters",
  international: "Internacional",
  veterans: "Veteranos",
  club: "Liga de Clubes",
};
const badgeClass = {
  "fip-only": "badge-fip-gold",
  "fip-gold": "badge-fip-gold",
  "fip-silver": "badge-fip-silver",
  "fip-bronze": "badge-fip-bronze",
  "fip-promises": "badge-fip-promises",
  national: "badge-national",
  regional: "badge-regional",
  c10k: "badge-c10k",
  c5k: "badge-c5k",
  c2k: "badge-c2k",
  masters: "badge-masters",
  international: "badge-international",
  club: "badge-club",
  veterans: "badge-veterans",
};
const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const monthShortPt = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const parseIsoDate = (value) => {
  if (!value || typeof value !== "string") return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getTournamentMonth = (tournament) => {
  const start = parseIsoDate(tournament.start_date);
  return start ? months[start.getMonth()] : "";
};

const getTournamentDate = (tournament) => {
  const start = parseIsoDate(tournament.start_date);
  const end = parseIsoDate(tournament.end_date);
  if (!start) return "";

  const startDay = start.getDate();
  if (!end) {
    return `${startDay} ${monthShortPt[start.getMonth()]}`;
  }

  const endDay = end.getDate();
  const endMonth = end.getMonth();
  if (start.getMonth() === endMonth) {
    return `${startDay} a ${endDay} ${monthShortPt[endMonth]}`;
  }
  return `${startDay} ${monthShortPt[start.getMonth()]} a ${endDay} ${monthShortPt[endMonth]}`;
};

const getTournamentTimeStatus = (tournament) => {
  const start = parseIsoDate(tournament.start_date);
  const end = parseIsoDate(tournament.end_date);
  if (!start || !end) return "";

  const now = new Date();
  const startTime = new Date(start);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(end);
  endTime.setHours(23, 59, 59, 999);

  if (now < startTime) return "";
  if (now > endTime) return "finished";
  return "live";
};

const getTournamentOrg = (tournament) => tournament.organization || "";

const getTournamentAgeGroup = (tournament) =>
  String(tournament.age_group || "").toLowerCase();

const getTournamentLevel = (tournament) => {
  const fipLevel = String(tournament?.fip_data?.level || "").trim();
  if (fipLevel) return fipLevel;

  const fppLevel = String(tournament?.fpp_data?.level || "").trim();
  if (fppLevel) return fppLevel;

  return "";
};

const getLevelLabel = (level) => levelLabels[level] || "Sem nível";
const getLevelBadgeClass = (level) => badgeClass[level] || "badge-club";

const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
};

const buildSourceInfo = (sourceLabel, sourceData) => {
  if (!sourceData || typeof sourceData !== "object") return "";

  const parts = [];
  if (hasValue(sourceData.level)) {
    const levelKey = String(sourceData.level).trim();
    parts.push(`Nível: ${getLevelLabel(levelKey)}`);
  }
  if (hasValue(sourceData.points)) {
    const points = typeof sourceData.points === "number"
      ? sourceData.points.toLocaleString("pt-PT")
      : sourceData.points;
    parts.push(`Pontos: ${points}`);
  }
  if (hasValue(sourceData.categories)) parts.push(`Categorias: ${sourceData.categories}`);
  const hasMainInfo = parts.length > 0;
  const hasLink = hasValue(sourceData.link);

  if (!hasMainInfo && !hasLink) return "";

  const mainInfoHtml = hasMainInfo
    ? `<div><strong>${sourceLabel}:</strong> ${parts.join(" · ")}</div>`
    : `<div><strong>${sourceLabel}:</strong></div>`;

  const linkHtml = hasLink
    ? `<div><a href="${sourceData.link}" target="_blank" rel="noopener noreferrer">Inscrições / Resultados</a></div>`
    : "";

  return `<div class="card-cats">${mainInfoHtml}${linkHtml}</div>`;
};

const filterMatchesByCats = (tournament, filterKey) => {
  const age = getTournamentAgeGroup(tournament);

  if (filterKey === "absolutos") {
    return age === "abs";
  }
  if (filterKey === "jovens") {
    return age === "jov";
  }
  if (filterKey === "veteranos") {
    return age === "vet";
  }
  if (filterKey === "fip-only") {
    return age === "none";
  }

  return false;
};

// --- Build filter buttons ---
const fc = document.getElementById("filterContainer");
const allBtn = document.createElement("button");
allBtn.className = "filter-btn active";
allBtn.dataset.level = "all";
allBtn.innerHTML = `Todos<span class="count-badge">${tournaments.length}</span>`;
fc.appendChild(allBtn);

// Add category filters
const absolutosCount = tournaments.filter((t) =>
  filterMatchesByCats(t, "absolutos"),
).length;
const veteranosCount = tournaments.filter((t) =>
  filterMatchesByCats(t, "veteranos"),
).length;
const jovensCount = tournaments.filter((t) =>
  filterMatchesByCats(t, "jovens"),
).length;
const onlyFIPCount = tournaments.filter((t) =>
  filterMatchesByCats(t, "fip-only"),
).length;

const absolutosBtn = document.createElement("button");
absolutosBtn.className = "filter-btn";
absolutosBtn.dataset.level = "absolutos";
absolutosBtn.innerHTML = `Absolutos<span class="count-badge">${absolutosCount}</span>`;
fc.appendChild(absolutosBtn);

const veteranosBtn = document.createElement("button");
veteranosBtn.className = "filter-btn";
veteranosBtn.dataset.level = "veteranos";
veteranosBtn.innerHTML = `Veteranos<span class="count-badge">${veteranosCount}</span>`;
fc.appendChild(veteranosBtn);

const jovensBtn = document.createElement("button");
jovensBtn.className = "filter-btn";
jovensBtn.dataset.level = "jovens";
jovensBtn.innerHTML = `Jovens<span class="count-badge">${jovensCount}</span>`;
fc.appendChild(jovensBtn);

const onlyFIPBtn = document.createElement("button");
onlyFIPBtn.className = "filter-btn";
onlyFIPBtn.dataset.level = "fip-only";
onlyFIPBtn.innerHTML = `Apenas FIP<span class="count-badge">${onlyFIPCount}</span>`;
fc.appendChild(onlyFIPBtn);


// --- SVGs ---
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgOrg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

// --- Build tournament cards ---
const tc = document.getElementById("tournamentsContainer");
months.forEach((month) => {
  const mt = tournaments.filter((t) => getTournamentMonth(t) === month);
  if (!mt.length) return;
  const section = document.createElement("div");
  section.className = "month-section";
  section.dataset.month = month;
  section.innerHTML = `<div class="month-header">${month}<span class="month-count">${mt.length}</span></div>`;
  const grid = document.createElement("div");
  grid.className = "tournament-grid";

  mt.forEach((t) => {
    const level = getTournamentLevel(t);
    const timeStatus = getTournamentTimeStatus(t);
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.level = level;
    card.dataset.month = getTournamentMonth(t);
    card.dataset.ageGroup = getTournamentAgeGroup(t);

    // Determine points (CLASSE) and prize money separately
    let pointsNum = null;
    let prizeMoney = null;
    const levelPts = { c2k: 2000, c5k: 5000, c10k: 10000 };

    if (t.fipPoints) {
      pointsNum = t.fipPoints;
      if (t.prize) prizeMoney = t.prize;
    } else if (t.points != null) {
      pointsNum = t.points;
      prizeMoney = t.prizeMoney || (t.prize && t.prize.includes("\u20AC") ? t.prize : null);
    } else if (t.prize) {
      if (t.prize.includes("\u20AC")) {
        prizeMoney = t.prize;
        if (levelPts[level]) pointsNum = levelPts[level];
      } else {
        const v = parseInt(t.prize.replace(/\./g, "").replace(/[^\d]/g, ""));
        if (!isNaN(v) && v > 0) pointsNum = v;
      }
    }

    const pointsHtml = pointsNum
      ? `<span class="fip-points">${pointsNum.toLocaleString("pt-PT")} pts</span>`
      : "";
    const prizeHtml = prizeMoney
      ? `<span class="prize">${prizeMoney}</span>`
      : "";
    const statusLabel = timeStatus === "live" ? "A decorrer" : "Finalizado";
    const statusBarHtml = timeStatus
      ? `<div class="card-status-bar card-status-${timeStatus}">${statusLabel}</div>`
      : "";
    const org = getTournamentOrg(t);
    const cardFooterHtml = `
<div class="card-footer-details">
  ${org ? `<div class="card-detail">${svgOrg}<span style="font-size:0.75rem">${org}</span></div>` : ""}
</div>`;

    card.innerHTML = `
<div class="card-top">
  <div class="card-name">${t.name}</div>
  <span class="badge ${getLevelBadgeClass(level)}">${getLevelLabel(level)}</span>
</div>
<div class="card-details">
  <div class="card-detail">${svgCalendar}<span>${getTournamentDate(t)}</span></div>
  <div class="card-detail">${svgPin}<span>${t.location}</span></div>
  ${prizeHtml ? `<div class="card-detail">${prizeHtml}</div>` : ""}</div>
${buildSourceInfo("FIP", t.fip_data)}
${buildSourceInfo("FPP", t.fpp_data)}
${cardFooterHtml}
${statusBarHtml}
    `;
    grid.appendChild(card);
  });
  section.appendChild(grid);
  tc.appendChild(section);
});

// --- Stats ---
document.getElementById("totalCount").textContent = tournaments.length;
document.getElementById("fipCount").textContent = tournaments.filter(
  (t) => getTournamentLevel(t).startsWith("fip-"),
).length;
document.getElementById("visibleCount").textContent = tournaments.length;

// ==========================================
//  MAP (Leaflet + OpenStreetMap)
// ==========================================
const map = L.map("mapContainer", { scrollWheelZoom: true }).setView(
[38.5, -15.5], // Centro aproximado entre o Continente e os Açores
  5              // Zoom reduzido para abranger a distância
);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 18,
}).addTo(map);

// Custom colored marker using SVG
function createMarkerIcon(color) {
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
<circle cx="14" cy="14" r="6" fill="#fff" opacity="0.9"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
  });
}

// Group tournaments by location
const locationGroups = {};
tournaments.forEach((t) => {
  const c = coords[t.location];
  if (!c) return;
  const key = t.location;
  if (!locationGroups[key])
    locationGroups[key] = { coords: c, tournaments: [] };
  locationGroups[key].tournaments.push(t);
});

// Create markers
const allMarkers = [];
Object.entries(locationGroups).forEach(([locName, group]) => {
  // Determine the "top" level color for this location (highest tier tournament)
  const tierOrder = [
    "fip-gold",
    "fip-silver",
    "fip-bronze",
    "international",
    "national",
    "regional",
    "c10k",
    "c5k",
    "c2k",
    "masters",
    "fip-promises",
    "club",
  ];
  let bestTier = "club";
  group.tournaments.forEach((t) => {
    const level = getTournamentLevel(t);
    if (tierOrder.indexOf(level) < tierOrder.indexOf(bestTier))
      bestTier = level;
  });
  const color = levelColors[bestTier] || "#1565C0";

  const marker = L.marker(group.coords, {
    icon: createMarkerIcon(color),
  });

  // Build popup
  const styles = getComputedStyle(document.documentElement);
  const bgMap = {
    "badge-fip-gold": styles.getPropertyValue("--gold-bg").trim(),
    "badge-fip-silver": styles.getPropertyValue("--silver-bg").trim(),
    "badge-fip-bronze": styles.getPropertyValue("--bronze-bg").trim(),
    "badge-fip-promises": styles.getPropertyValue("--promises-bg").trim(),
    "badge-national": styles.getPropertyValue("--national-bg").trim(),
    "badge-regional": styles.getPropertyValue("--regional-bg").trim(),
    "badge-c10k": styles.getPropertyValue("--c10k-bg").trim(),
    "badge-c5k": styles.getPropertyValue("--c5k-bg").trim(),
    "badge-c2k": styles.getPropertyValue("--c2k-bg").trim(),
    "badge-veterans": styles.getPropertyValue("--veterans-bg").trim(),
    "badge-masters": styles.getPropertyValue("--masters-bg").trim(),
    "badge-international": styles
      .getPropertyValue("--international-bg")
      .trim(),
    "badge-club": styles.getPropertyValue("--club-bg").trim(),
  };
  const colMap = {
    "badge-fip-gold": "#8B7000",
    "badge-fip-silver": "#4A4E69",
    "badge-fip-bronze": "#8B5E20",
    "badge-fip-promises": styles.getPropertyValue("--promises").trim(),
    "badge-national": styles.getPropertyValue("--national").trim(),
    "badge-regional": styles.getPropertyValue("--regional").trim(),
    "badge-c10k": styles.getPropertyValue("--c10k").trim(),
    "badge-c5k": styles.getPropertyValue("--c5k").trim(),
    "badge-c2k": styles.getPropertyValue("--c2k").trim(),
    "badge-veterans": styles.getPropertyValue("--veterans").trim(),
    "badge-masters": "#9E6D00",
    "badge-international": styles
      .getPropertyValue("--international")
      .trim(),
    "badge-club": styles.getPropertyValue("--club").trim(),
  };
  let popupHtml = `<div style="font-family:Inter,-apple-system,sans-serif"><strong style="font-size:1rem;display:block;margin-bottom:0.5rem;color:#1a1a2e">${locName}</strong><div class="popup-scroll">`;
  const popupLevelPts = { c2k: 2000, c5k: 5000, c10k: 10000 };
  group.tournaments.forEach((t) => {
    const level = getTournamentLevel(t);
    const bc = getLevelBadgeClass(level);
    let pPts = null, pPrize = null;
    if (t.fipPoints) { pPts = t.fipPoints; if (t.prize) pPrize = t.prize; }
    else if (t.points != null) { pPts = t.points; pPrize = t.prizeMoney || (t.prize && t.prize.includes("\u20AC") ? t.prize : null); }
    else if (t.prize) {
      if (t.prize.includes("\u20AC")) { pPrize = t.prize; if (popupLevelPts[level]) pPts = popupLevelPts[level]; }
      else { const v = parseInt(t.prize.replace(/\./g, "").replace(/[^\d]/g, "")); if (!isNaN(v) && v > 0) pPts = v; }
    }
    const pPtsStr = pPts ? ` &mdash; <strong>${pPts.toLocaleString("pt-PT")} pts</strong>` : "";
    const pPrizeStr = pPrize ? ` &mdash; <span class="popup-prize">${pPrize}</span>` : "";
    popupHtml += `<div class="popup-tournament">
<div class="popup-name">${t.name}</div>
    <span class="popup-badge" style="background:${bgMap[bc]};color:${colMap[bc]}">${getLevelLabel(level)}</span>
<div class="popup-detail">${getTournamentDate(t)}${pPtsStr}${pPrizeStr}</div>
${t.cats ? `<div class="popup-detail" style="font-size:0.68rem;opacity:0.8">${t.cats}</div>` : ""}
${getTournamentOrg(t) ? `<div class="popup-detail" style="font-size:0.68rem;opacity:0.8">${getTournamentOrg(t)}</div>` : ""}
    </div>`;
  });
  popupHtml += "</div></div>";

  marker.bindPopup(popupHtml, { maxWidth: 300, maxHeight: 320 });
  marker._tournamentLevels = group.tournaments.map((t) => getTournamentLevel(t));
  marker._locationName = locName;
  marker._tournaments = group.tournaments;
  marker.addTo(map);
  allMarkers.push(marker);
});

// --- Map toggle ---
const mapContainer = document.getElementById("mapContainer");
const mapToggleIcon = document.getElementById("mapToggleIcon");
document.getElementById("mapToggle").addEventListener("click", () => {
  mapContainer.classList.toggle("collapsed");
  mapToggleIcon.classList.toggle("collapsed");
  setTimeout(() => map.invalidateSize(), 350);
});

// ==========================================
//  MULTI-SELECT FILTER LOGIC
// ==========================================
let activeFilters = new Set();
let searchQuery = "";
const SEARCH_DEBOUNCE_MS = 100;
let searchDebounceTimer = null;
const clearBtn = document.getElementById("clearFilters");
const searchInput = document.getElementById("searchInput");
const monthFrom = document.getElementById("monthFrom");
const monthTo = document.getElementById("monthTo");
const displayMonths = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function applyFilters() {
  const isAll = activeFilters.size === 0;
  const from = parseInt(monthFrom.value);
  const to = parseInt(monthTo.value);

  // Update button states
  allBtn.classList.toggle("active", isAll);
  document
    .querySelectorAll('.filter-btn:not([data-level="all"])')
    .forEach((btn) => {
      btn.classList.toggle(
        "active",
        activeFilters.has(btn.dataset.level),
      );
    });
  clearBtn.classList.toggle("visible", !isAll);

  // Filter cards
  let visibleCount = 0;
  document.querySelectorAll(".card").forEach((card) => {
    const monthIdx = displayMonths.indexOf(card.dataset.month);
    const isInMonthRange = monthIdx >= from && monthIdx <= to;
    let show = isInMonthRange;

    // Apply level/category filters (always respecting month range)
    if (show && !isAll) {
      const ageGroup = card.dataset.ageGroup;
      const levelMatch = activeFilters.has(card.dataset.level);
      const categoryMatch =
        (activeFilters.has("absolutos") && ageGroup === "abs") ||
        (activeFilters.has("veteranos") && ageGroup === "vet") ||
        (activeFilters.has("jovens") && ageGroup === "jov") ||
        (activeFilters.has("fip-only") && ageGroup === "none");

      show = levelMatch || categoryMatch;
    }

    // Apply search filter
    if (show && searchQuery) {
      const cardName = card
        .querySelector(".card-name")
        .textContent.toLowerCase();
      show = cardName.includes(searchQuery.toLowerCase());
    }

    card.classList.toggle("hidden", !show);
    if (show) visibleCount++;
  });

  // Update month sections
  document.querySelectorAll(".month-section").forEach((section) => {
    const visible = section.querySelectorAll(".card:not(.hidden)").length;
    section.classList.toggle("hidden", visible === 0);
    const badge = section.querySelector(".month-count");
    if (badge) badge.textContent = visible;
  });

  document.getElementById("visibleCount").textContent = visibleCount;
  document.getElementById("noResults").style.display =
    visibleCount === 0 ? "block" : "none";

  // Update map markers
  allMarkers.forEach((marker) => {
    const locTournaments = marker._tournaments || [];
    const locTournamentsInRange = locTournaments.filter((t) => {
      const monthIdx = displayMonths.indexOf(getTournamentMonth(t));
      return monthIdx >= from && monthIdx <= to;
    });

    let hasMatch = locTournamentsInRange.length > 0;

    // Apply level/category filters
    if (hasMatch && !isAll) {
      hasMatch = locTournamentsInRange.some((t) => {
        if (activeFilters.has(getTournamentLevel(t))) return true;
        if (activeFilters.has("absolutos") && filterMatchesByCats(t, "absolutos")) return true;
        if (activeFilters.has("veteranos") && filterMatchesByCats(t, "veteranos")) return true;
        if (activeFilters.has("jovens") && filterMatchesByCats(t, "jovens")) return true;
        if (activeFilters.has("fip-only") && filterMatchesByCats(t, "fip-only")) return true;
        return false;
      });
    }

    // Apply search filter to markers
    if (hasMatch && searchQuery) {
      hasMatch = locTournamentsInRange.some((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (hasMatch && !map.hasLayer(marker)) marker.addTo(map);
    if (!hasMatch && map.hasLayer(marker)) map.removeLayer(marker);
  });
}

// "Todos" button
allBtn.addEventListener("click", () => {
  activeFilters.clear();
  applyFilters();
});

// Level buttons - toggle on/off
document
  .querySelectorAll('.filter-btn:not([data-level="all"])')
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const level = btn.dataset.level;
      if (activeFilters.has(level)) {
        activeFilters.delete(level);
      } else {
        activeFilters.add(level);
      }
      applyFilters();
    });
  });

// Clear button
clearBtn.addEventListener("click", () => {
  activeFilters.clear();
  applyFilters();
});

// Search input
searchInput.addEventListener("input", (e) => {
  const nextQuery = e.target.value.trim();
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    searchQuery = nextQuery;
    applyFilters();
  }, SEARCH_DEBOUNCE_MS);
});

// Month range filters
monthFrom.addEventListener("change", () => {
  if (parseInt(monthTo.value) < parseInt(monthFrom.value)) {
    monthTo.value = monthFrom.value;
  }
  applyFilters();
});
monthTo.addEventListener("change", () => {
  if (parseInt(monthTo.value) < parseInt(monthFrom.value)) {
    monthFrom.value = monthTo.value;
  }
  applyFilters();
});

// Apply default month range on first render
applyFilters();

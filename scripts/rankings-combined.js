const CACHE_TTL_MS = 60 * 60 * 1000;
const ROWS_PER_PAGE = 100;

const tbody = document.getElementById("rankingsBody");
const meta = document.getElementById("rankingsMeta");
const prevPageBtn = document.getElementById("rankingsPrevPage");
const nextPageBtn = document.getElementById("rankingsNextPage");
const pageInfo = document.getElementById("rankingsPageInfo");
const sourceSelect = document.getElementById("rankingsSource");
const searchInput = document.getElementById("rankingsSearch");
const levelFilter = document.getElementById("rankingsFilterLevel");
const ageFilter = document.getElementById("rankingsFilterAge");
const clubFilter = document.getElementById("rankingsFilterClub");

let currentPage = 1;
let sortedRows = [];
let filteredRows = [];

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const parseRankingNumber = (value) => {
  const asNumber = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(asNumber) ? asNumber : Number.MAX_SAFE_INTEGER;
};

const normalizeSearchText = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

const formatRankingChange = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";
  if (raw === "-") return raw;
  if (raw.startsWith("+") || raw.startsWith("-")) return raw;

  const numeric = Number(raw.replace(",", "."));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `+${raw}`;
  }

  return raw;
};

const getTiePlayerUrl = (playerId) => {
  const normalizedId = String(playerId ?? "").trim();
  if (!normalizedId) return "";
  return `https://www.tiepadel.com/Advanced-stats/${encodeURIComponent(normalizedId)}`;
};

const getTiePadelDashboardUrl = (playerId) => {
  const normalizedId = String(playerId ?? "").trim();
  if (!normalizedId) return "";
  return `https://www.tiepadel.com/Dashboard.aspx?id=${encodeURIComponent(normalizedId)}`;
};

const renderLicenceCell = (player) => {
  const licenceNumber = String(player?.LicenceNumber ?? "").trim();
  if (!licenceNumber) return "-";

  const url = getTiePadelDashboardUrl(player?.PlayerID);
  if (!url) return escapeHtml(licenceNumber);

  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(licenceNumber)}</a>`;
};

const isYouthAgeType = (value) => {
  const normalized = normalizeSearchText(value).replaceAll(" ", "");
  return normalized.startsWith("sub") || normalized.startsWith("jov");
};

const sortAgeTypes = (values) => [...values].sort((a, b) => {
  const aNorm = normalizeSearchText(a).replaceAll(" ", "");
  const bNorm = normalizeSearchText(b).replaceAll(" ", "");

  const aPriority = aNorm === "abs"
    ? 0
    : isYouthAgeType(a)
      ? 1
      : 2;
  const bPriority = bNorm === "abs"
    ? 0
    : isYouthAgeType(b)
      ? 1
      : 2;

  if (aPriority !== bPriority) return aPriority - bPriority;
  return a.localeCompare(b, "pt");
});

const uniqueSortedValues = (rows, key) => [...new Set(rows
  .map((row) => String(row?.[key] ?? "").trim())
  .filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, "pt"));

const fillSelectOptions = (selectElement, values, allLabel) => {
  if (!selectElement) return;
  const current = selectElement.value || "all";
  const optionsHtml = [
    `<option value="all">${allLabel}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
  ].join("");
  selectElement.innerHTML = optionsHtml;
  if (values.includes(current)) {
    selectElement.value = current;
  } else {
    selectElement.value = "all";
  }
};

const getSourceConfig = () => {
  const source = sourceSelect?.value === "female" ? "female" : "male";
  const embed = source === "female"
    ? window.FEMALE_RANKINGS_EMBED
    : window.MALE_RANKINGS_EMBED;
  const embedKey = source === "female"
    ? "FEMALE_RANKINGS_EMBED"
    : "MALE_RANKINGS_EMBED";

  return {
    source,
    embed,
    embedKey,
    cacheKey: `${source}-rankings-cache-v1`,
    newestFile: String(embed?.file || "latest.json"),
    label: source === "female" ? "Feminino" : "Masculino",
  };
};

const formatFileDate = (fileName) => {
  const match = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return fileName;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
};

const readCache = (config) => {
  try {
    const raw = localStorage.getItem(config.cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.file !== config.newestFile) return null;
    if (!Array.isArray(parsed.data)) return null;
    if (Date.now() - Number(parsed.timestamp || 0) > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (config, data) => {
  try {
    localStorage.setItem(config.cacheKey, JSON.stringify({
      file: config.newestFile,
      timestamp: Date.now(),
      data,
    }));
  } catch {
    return;
  }
};

const renderCurrentPage = () => {
  if (!filteredRows.length) {
    tbody.innerHTML = '<tr><td colspan="10">Sem dados disponíveis de momento.</td></tr>';
    if (pageInfo) pageInfo.textContent = "Página 0 de 0";
    if (prevPageBtn) prevPageBtn.disabled = true;
    if (nextPageBtn) nextPageBtn.disabled = true;
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = filteredRows.slice(start, start + ROWS_PER_PAGE);

  tbody.innerHTML = pageRows.map((player) => `
    <tr>
      <td>${escapeHtml(player.Ranking)}</td>
      <td>${escapeHtml(formatRankingChange(player.RankingChange))}</td>
      <td>${renderLicenceCell(player)}</td>
      <td>${escapeHtml(player.Name)}</td>
      <td>${escapeHtml(player.Points)}</td>
      <td>${escapeHtml(player.Club || "-")}</td>
      <td>${escapeHtml(player.Level)}</td>
      <td>${escapeHtml(player.AgeType)}</td>
      <td>${escapeHtml(player.NumberOfValidTournaments)}</td>
      <td>${getTiePlayerUrl(player.PlayerID)
        ? `<a href="${escapeHtml(getTiePlayerUrl(player.PlayerID))}" target="_blank" rel="noopener noreferrer">Ver</a>`
        : "-"}</td>
    </tr>
  `).join("");

  if (pageInfo) pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
};

const applyFilters = () => {
  const queryTerms = String(searchInput?.value || "")
    .split(",")
    .map((term) => normalizeSearchText(term.trim()))
    .filter(Boolean);
  const levelValue = levelFilter?.value || "all";
  const ageValue = ageFilter?.value || "all";
  const clubValue = clubFilter?.value || "all";

  filteredRows = sortedRows.filter((player) => {
    const name = String(player?.Name || "");
    const club = String(player?.Club || "");
    const licenceNumber = String(player?.LicenceNumber || "");
    const level = String(player?.Level || "");
    const age = String(player?.AgeType || "");
    const normalizedName = normalizeSearchText(name);
    const normalizedClub = normalizeSearchText(club);
    const normalizedLicenceNumber = normalizeSearchText(licenceNumber);

    const matchesSearch = queryTerms.length === 0 ||
      queryTerms.some((term) =>
        normalizedName.includes(term) ||
        normalizedClub.includes(term) ||
        normalizedLicenceNumber.includes(term)
      );
    const matchesLevel = levelValue === "all" || level === levelValue;
    const matchesAge = ageValue === "all" || age === ageValue;
    const matchesClub = clubValue === "all" || club === clubValue;

    return matchesSearch && matchesLevel && matchesAge && matchesClub;
  });

  currentPage = 1;
  renderCurrentPage();

  const config = getSourceConfig();
  const baseText = `Fonte: FPP (${formatFileDate(config.newestFile)})`;
  if (meta) {
    meta.textContent = `${baseText} · ${filteredRows.length} / ${sortedRows.length} atletas`;
  }
};

const renderRows = (rows) => {
  sortedRows = [...rows].sort(
    (a, b) => parseRankingNumber(a.Ranking) - parseRankingNumber(b.Ranking),
  );

  fillSelectOptions(levelFilter, uniqueSortedValues(sortedRows, "Level"), "Todos os níveis");
  fillSelectOptions(ageFilter, sortAgeTypes(uniqueSortedValues(sortedRows, "AgeType")), "Todos os escalões");
  fillSelectOptions(clubFilter, uniqueSortedValues(sortedRows, "Club"), "Todos os clubes");

  currentPage = 1;
  applyFilters();
};

if (prevPageBtn) prevPageBtn.addEventListener("click", () => {
  currentPage -= 1;
  renderCurrentPage();
});
if (nextPageBtn) nextPageBtn.addEventListener("click", () => {
  currentPage += 1;
  renderCurrentPage();
});
if (searchInput) searchInput.addEventListener("input", applyFilters);
if (levelFilter) levelFilter.addEventListener("change", applyFilters);
if (ageFilter) ageFilter.addEventListener("change", applyFilters);
if (clubFilter) clubFilter.addEventListener("change", applyFilters);

const loadRankings = async () => {
  const config = getSourceConfig();

  if (config.embed && Array.isArray(config.embed.data) && config.embed.file === config.newestFile) {
    writeCache(config, config.embed.data);
    renderRows(config.embed.data);
    return;
  }

  const cached = readCache(config);
  if (cached) {
    renderRows(cached);
    return;
  }

  if (window.location.protocol === "file:") {
    if (meta) {
      meta.textContent = `Sem dados carregados: verifica se ../data/rankings/${config.source}/latest.js existe e define window.${config.embedKey}.`;
    }
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="10">Modo estático ativo. Não foi encontrado dataset embebido.</td></tr>';
    }
    return;
  }

  try {
    const response = await fetch(`../data/rankings/${config.source}/${config.newestFile}`, {
      cache: "no-cache",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid rankings format");
    writeCache(config, data);
    renderRows(data);
  } catch {
    if (meta) meta.textContent = "Não foi possível carregar o ranking.";
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="10">Sem dados disponíveis de momento.</td></tr>';
    }
  }
};

if (sourceSelect) {
  sourceSelect.addEventListener("change", () => {
    searchInput.value = "";
    currentPage = 1;
    loadRankings();
  });
}

loadRankings();

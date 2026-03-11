const CACHE_TTL_MS = 60 * 60 * 1000;
const ROWS_PER_PAGE = 100;

const pageKey = document.body?.dataset?.page || "male-abs-rankings";
const isFemale = pageKey === "female-abs-rankings";
const prefix = isFemale ? "female" : "male";
const sourceDir = isFemale ? "female" : "male";
const cacheKey = `${prefix}-rankings-cache-v1`;
const embedKey = isFemale ? "FEMALE_RANKINGS_EMBED" : "MALE_RANKINGS_EMBED";

const tbody = document.getElementById(`${prefix}RankingsBody`);
const meta = document.getElementById(`${prefix}RankingsMeta`);
const prevPageBtn = document.getElementById(`${prefix}PrevPage`);
const nextPageBtn = document.getElementById(`${prefix}NextPage`);
const pageInfo = document.getElementById(`${prefix}PageInfo`);
const searchInput = document.getElementById(`${prefix}Search`);
const levelFilter = document.getElementById(`${prefix}FilterLevel`);
const ageFilter = document.getElementById(`${prefix}FilterAge`);
const clubFilter = document.getElementById(`${prefix}FilterClub`);

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

const embedded = window[embedKey];
const newestFile = String(embedded?.file || "latest.json");
const isFileProtocol = window.location.protocol === "file:";

const formatFileDate = (fileName) => {
  const match = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return fileName;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.file !== newestFile) return null;
    if (!Array.isArray(parsed.data)) return null;
    if (Date.now() - Number(parsed.timestamp || 0) > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      file: newestFile,
      timestamp: Date.now(),
      data,
    }));
  } catch {
    return;
  }
};

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

const renderCurrentPage = () => {
  if (!tbody) return;

  if (!filteredRows.length) {
    tbody.innerHTML = '<tr><td colspan="8">Sem dados disponíveis de momento.</td></tr>';
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
      <td>${escapeHtml(player.RankingChange)}</td>
      <td>${escapeHtml(player.Name)}</td>
      <td>${escapeHtml(player.Points)}</td>
      <td>${escapeHtml(player.Club || "-")}</td>
      <td>${escapeHtml(player.Level)}</td>
      <td>${escapeHtml(player.AgeType)}</td>
      <td>${escapeHtml(player.NumberOfValidTournaments)}</td>
    </tr>
  `).join("");

  if (pageInfo) pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
};

const applyFilters = () => {
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const levelValue = levelFilter?.value || "all";
  const ageValue = ageFilter?.value || "all";
  const clubValue = clubFilter?.value || "all";

  filteredRows = sortedRows.filter((player) => {
    const name = String(player?.Name || "");
    const club = String(player?.Club || "");
    const level = String(player?.Level || "");
    const age = String(player?.AgeType || "");

    const matchesSearch = !query ||
      name.toLowerCase().includes(query) ||
      club.toLowerCase().includes(query);
    const matchesLevel = levelValue === "all" || level === levelValue;
    const matchesAge = ageValue === "all" || age === ageValue;
    const matchesClub = clubValue === "all" || club === clubValue;

    return matchesSearch && matchesLevel && matchesAge && matchesClub;
  });

  currentPage = 1;
  renderCurrentPage();

  if (meta) {
    const baseText = `Fonte: FPP (${formatFileDate(newestFile)})`;
    meta.textContent = `${baseText} · ${filteredRows.length} / ${sortedRows.length} atletas`;
  }
};

const renderRows = (rows) => {
  sortedRows = [...rows].sort(
    (a, b) => parseRankingNumber(a.Ranking) - parseRankingNumber(b.Ranking),
  );

  fillSelectOptions(levelFilter, uniqueSortedValues(sortedRows, "Level"), "Todos os níveis");
  fillSelectOptions(ageFilter, uniqueSortedValues(sortedRows, "AgeType"), "Todos os escalões");
  fillSelectOptions(clubFilter, uniqueSortedValues(sortedRows, "Club"), "Todos os clubes");

  currentPage = 1;
  applyFilters();
};

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    currentPage -= 1;
    renderCurrentPage();
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    currentPage += 1;
    renderCurrentPage();
  });
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (levelFilter) levelFilter.addEventListener("change", applyFilters);
if (ageFilter) ageFilter.addEventListener("change", applyFilters);
if (clubFilter) clubFilter.addEventListener("change", applyFilters);

const loadRankings = async () => {
  if (embedded && Array.isArray(embedded.data) && embedded.file === newestFile) {
    writeCache(embedded.data);
    renderRows(embedded.data);
    return;
  }

  const cached = readCache();
  if (cached) {
    renderRows(cached);
    return;
  }

  if (isFileProtocol) {
    if (meta) {
      meta.textContent = `Sem dados carregados: verifica se ../data/rankings/${sourceDir}/latest.js existe e define window.${embedKey}.`;
    }
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="8">Modo estático ativo. Não foi encontrado dataset embebido.</td></tr>';
    }
    return;
  }

  try {
    const response = await fetch(`../data/rankings/${sourceDir}/${newestFile}`, {
      cache: "no-cache",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid rankings format");
    writeCache(data);
    renderRows(data);
  } catch {
    if (meta) meta.textContent = "Não foi possível carregar o ranking.";
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="8">Sem dados disponíveis de momento.</td></tr>';
    }
  }
};

loadRankings();

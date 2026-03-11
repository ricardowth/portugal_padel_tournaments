const tournamentLevel = document.getElementById("tournamentLevel");

const baseM1ByPhase = {
  Vencedor: 10000,
  Finalista: 7000,
  Meias: 5500,
  Quartos: 4250,
  Oitavos: 3250,
  "16Avos / 3º Lugar Grupo": 2250,
  "4º Lugar Grupo": 1000,
};

const multipliersByColumn = {
  m1: 1,
  m2: 0.35,
  m3: 0.1225,
  m4: 0.042875,
  m5: 0.015,
  m6: 0.00525,
};

const formatValue = (value) => {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
};

const refreshPointsTable = () => {
  if (!tournamentLevel) return;
  const selectedLevelPoints = Number(tournamentLevel.value);
  if (!Number.isFinite(selectedLevelPoints) || selectedLevelPoints <= 0) return;

  const levelFactor = selectedLevelPoints / 10000;

  document.querySelectorAll("tr[data-phase]").forEach((row) => {
    const phaseKey = row.dataset.phase;
    const baseM1 = baseM1ByPhase[phaseKey];
    if (!Number.isFinite(baseM1)) return;

    Object.entries(multipliersByColumn).forEach(([column, multiplier]) => {
      const cell = row.querySelector(`[data-col="${column}"]`);
      if (!cell) return;
      const value = baseM1 * levelFactor * multiplier;
      cell.textContent = formatValue(value);
    });
  });
};

if (tournamentLevel) {
  tournamentLevel.addEventListener("input", refreshPointsTable);
  tournamentLevel.addEventListener("change", refreshPointsTable);
  refreshPointsTable();
}

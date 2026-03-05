(() => {
  const headerRoot = document.getElementById("sharedHeader");
  if (!headerRoot) return;

  const page = document.body?.dataset?.page || "calendar";
  const isContentPage = /\/content\//i.test(window.location.pathname);

  const links = isContentPage
    ? [
        { key: "calendar", label: "Calendário", href: "../index.html" },
        {
          key: "points-calculator",
          label: "Calculadora de Pontos",
          href: "./points-calculator.html",
        },
      ]
    : [
        { key: "calendar", label: "Calendário", href: "./index.html" },
        {
          key: "points-calculator",
          label: "Calculadora de Pontos",
          href: "./content/points-calculator.html",
        },
      ];

  const subtitles = {
    calendar: "Calendário",
    "points-calculator": "Calculadora de Pontos",
  };

  const menuHtml = links
    .map((item) => {
      const isActive = item.key === page;
      return `<a class="header-menu-link${isActive ? " active" : ""}" href="${item.href}" ${isActive ? 'aria-current="page"' : ""}>${item.label}</a>`;
    })
    .join("");

  headerRoot.innerHTML = `
    <div class="header">
      <div class="header-content">
        <div class="header-text">
          <h1>Padel Portugal</h1>
          <div class="header-subtitle">${subtitles[page] || ""}</div>
          <nav class="header-menu" aria-label="Menu principal">${menuHtml}</nav>
        </div>
        <div class="header-year">2026</div>
      </div>
    </div>
  `;
})();

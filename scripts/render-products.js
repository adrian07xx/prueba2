import { loadProducts } from "./data/load-products.js";
import { productCardHTML } from "./product-card.js";

const CATEGORY_LABELS = {
  all: "Todas",
  seleccion: "Selecciones",
  club: "Clubes",
  retro: "Retro",
};

let products = [];
let activeCategory = "all";
let activeTeam = "all";

function uniqueTeams(list) {
  return [...new Set(list.map((p) => p.team))].sort((a, b) => a.localeCompare(b, "es"));
}

function applyFilters() {
  return products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchTeam = activeTeam === "all" || p.team === activeTeam;
    return matchCat && matchTeam;
  });
}

function render() {
  const grid = document.getElementById("productGrid");
  const count = document.getElementById("resultsCount");
  const filtered = applyFilters();

  grid.innerHTML = filtered.length
    ? filtered.map(productCardHTML).join("")
    : `<div class="empty-state">No hay camisetas para este filtro todavía.</div>`;

  if (count) {
    count.textContent = `${filtered.length} producto${filtered.length === 1 ? "" : "s"}`;
  }

  document.querySelectorAll(".filter-chip[data-category]").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.category === activeCategory));
  });

  const teamSelect = document.getElementById("teamFilter");
  if (teamSelect) teamSelect.value = activeTeam;
}

function initCategoryChips() {
  const bar = document.getElementById("categoryFilters");
  if (!bar) return;
  bar.innerHTML = Object.entries(CATEGORY_LABELS)
    .map(
      ([key, label]) =>
        `<button type="button" class="filter-chip" data-category="${key}" aria-pressed="${key === activeCategory}">${label}</button>`
    )
    .join("");

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    render();
  });
}

function initTeamFilter() {
  const select = document.getElementById("teamFilter");
  if (!select) return;
  const teams = uniqueTeams(products);
  select.innerHTML =
    `<option value="all">Todos los equipos</option>` +
    teams.map((t) => `<option value="${t}">${t}</option>`).join("");

  select.addEventListener("change", () => {
    activeTeam = select.value;
    render();
  });
}

async function init() {
  const grid = document.getElementById("productGrid");
  try {
    products = await loadProducts();
  } catch {
    grid.innerHTML = `<p class="text-muted">No se pudo cargar el catálogo. Inténtalo de nuevo más tarde.</p>`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const catParam = params.get("cat");
  if (catParam && CATEGORY_LABELS[catParam]) activeCategory = catParam;

  initCategoryChips();
  initTeamFilter();
  render();
}

init();

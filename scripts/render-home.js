import { loadProducts } from "./data/load-products.js";
import { productCardHTML } from "./product-card.js";

async function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  try {
    const products = await loadProducts();
    const featured = products.filter((p) => p.badge === "Nuevo").slice(0, 4);
    const list = featured.length ? featured : products.slice(0, 4);
    grid.innerHTML = list.map(productCardHTML).join("");
  } catch {
    grid.innerHTML = `<p class="text-muted">No se pudo cargar el catálogo. Inténtalo de nuevo más tarde.</p>`;
  }
}

renderFeatured();

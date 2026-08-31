const PRODUCTS_URL = new URL("./products.json", import.meta.url);

let cache = null;

export async function loadProducts() {
  if (cache) return cache;
  const res = await fetch(PRODUCTS_URL);
  if (!res.ok) throw new Error("No se pudo cargar el catálogo de productos.");
  cache = await res.json();
  return cache;
}

export async function getProductById(id) {
  const products = await loadProducts();
  return products.find((p) => p.id === id) || null;
}

export function formatPrice(amount, currency = "eur") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
}

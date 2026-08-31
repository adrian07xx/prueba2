import { formatPrice } from "./data/load-products.js";

export function productCardHTML(product) {
  const badgeClass = product.badge === "Retro" ? "badge badge-retro" : "badge";
  const badge = product.badge ? `<span class="${badgeClass}">${product.badge}</span>` : "";
  return `
    <a class="product-card" href="producto.html?id=${encodeURIComponent(product.id)}">
      <div class="product-card-media">
        ${badge}
        <img src="${product.images[0]}" alt="Camiseta ${product.name}" loading="lazy" width="400" height="400">
      </div>
      <div class="product-card-body">
        <span class="product-card-team">${product.team}</span>
        <span class="product-card-name">${product.name}</span>
        <span class="product-card-price">${formatPrice(product.price, product.currency)}</span>
      </div>
    </a>
  `;
}

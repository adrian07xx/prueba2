import { getProductById, formatPrice } from "./data/load-products.js";
import { getCart, updateQty, removeItem } from "./cart.js";

async function enrichCartItems() {
  const items = getCart();
  const enriched = [];
  for (const item of items) {
    const product = await getProductById(item.id);
    if (product) enriched.push({ ...item, product });
  }
  return enriched;
}

function cartItemHTML(item) {
  const { product, size, qty } = item;
  const lineTotal = product.price * qty;
  return `
    <div class="cart-item" data-id="${product.id}" data-size="${size}">
      <img src="${product.images[0]}" alt="Camiseta ${product.name}" width="88" height="88">
      <div>
        <p class="cart-item-name">${product.name}</p>
        <p class="cart-item-meta">Talla ${size} · ${formatPrice(product.price, product.currency)} / ud.</p>
        <div class="cart-item-row">
          <div class="qty-stepper">
            <button type="button" class="qty-minus" aria-label="Restar unidad de ${product.name}">−</button>
            <input type="number" class="qty-input" value="${qty}" min="1" max="10" inputmode="numeric" aria-label="Cantidad de ${product.name}, talla ${size}">
            <button type="button" class="qty-plus" aria-label="Sumar unidad de ${product.name}">+</button>
          </div>
          <span class="cart-item-price">${formatPrice(lineTotal, product.currency)}</span>
        </div>
        <button type="button" class="remove-btn">Eliminar</button>
      </div>
    </div>
  `;
}

function renderTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const currency = items[0]?.product.currency || "eur";
  document.getElementById("summarySubtotal").textContent = formatPrice(subtotal, currency);
  document.getElementById("summaryTotal").textContent = formatPrice(subtotal, currency);
  return subtotal;
}

async function render() {
  const listEl = document.getElementById("cartList");
  const emptyEl = document.getElementById("cartEmpty");
  const summaryEl = document.getElementById("cartSummary");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const items = await enrichCartItems();

  if (!items.length) {
    listEl.innerHTML = "";
    emptyEl.style.display = "block";
    summaryEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  summaryEl.style.display = "block";
  checkoutBtn.disabled = false;

  listEl.innerHTML = items.map(cartItemHTML).join("");
  renderTotals(items);

  listEl.querySelectorAll(".cart-item").forEach((row) => {
    const id = row.dataset.id;
    const size = row.dataset.size;
    const input = row.querySelector(".qty-input");

    row.querySelector(".qty-minus").addEventListener("click", () => {
      updateQty(id, size, Math.max(1, Number(input.value) - 1));
    });
    row.querySelector(".qty-plus").addEventListener("click", () => {
      updateQty(id, size, Math.min(10, Number(input.value) + 1));
    });
    input.addEventListener("change", () => {
      updateQty(id, size, Math.min(10, Math.max(1, Number(input.value) || 1)));
    });
    row.querySelector(".remove-btn").addEventListener("click", () => {
      removeItem(id, size);
    });
  });
}

render();
window.addEventListener("cart:change", render);

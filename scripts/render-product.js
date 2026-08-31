import { loadProducts, getProductById, formatPrice } from "./data/load-products.js";
import { productCardHTML } from "./product-card.js";
import { addItem } from "./cart.js";
import { showToast } from "./toast.js";

let selectedSize = null;

function renderNotFound() {
  document.getElementById("productDetail").innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <h1>Producto no encontrado</h1>
      <p>El producto que buscas no existe o ha sido retirado del catálogo.</p>
      <a href="tienda.html" class="btn btn-primary">Volver a la tienda</a>
    </div>`;
}

function renderProduct(product) {
  document.title = `${product.name} · Kickoff Shirts`;

  document.getElementById("productDetail").innerHTML = `
    <div class="product-gallery">
      <img id="mainImage" src="${product.images[0]}" alt="Camiseta ${product.name}" width="500" height="500">
    </div>
    <div class="product-info">
      <p class="product-team">${product.team} · ${categoryLabel(product.category)}</p>
      <h1>${product.name}</h1>
      <p class="product-price">${formatPrice(product.price, product.currency)}</p>
      <p class="product-description">${product.description}</p>

      <div class="field">
        <label id="sizeLabel">Talla</label>
        <div class="size-selector" id="sizeSelector" role="group" aria-labelledby="sizeLabel"></div>
      </div>

      <div class="product-purchase-row">
        <div class="field" style="margin-bottom:0;">
          <label for="qtyInput" class="visually-hidden">Cantidad</label>
          <div class="qty-stepper">
            <button type="button" id="qtyMinus" aria-label="Restar unidad">−</button>
            <input type="number" id="qtyInput" value="1" min="1" max="10" inputmode="numeric">
            <button type="button" id="qtyPlus" aria-label="Sumar unidad">+</button>
          </div>
        </div>
        <button type="button" class="btn btn-primary" id="addToCartBtn">Añadir al carrito</button>
      </div>
      <p class="text-muted" id="sizeError" role="alert" style="display:none; color: var(--color-danger);">Elige una talla antes de añadir al carrito.</p>

      <ul class="product-meta-list">
        <li><strong>Envío:</strong> 24/48h a toda la península</li>
        <li><strong>Devoluciones:</strong> gratuitas en 30 días</li>
        <li><strong>Pago:</strong> procesado de forma segura por Stripe</li>
      </ul>
    </div>
  `;

  const sizeSelector = document.getElementById("sizeSelector");
  sizeSelector.innerHTML = product.sizes
    .map((size) => `<button type="button" class="size-option" data-size="${size}" aria-pressed="false">${size}</button>`)
    .join("");

  sizeSelector.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-size]");
    if (!btn) return;
    selectedSize = btn.dataset.size;
    sizeSelector.querySelectorAll("[data-size]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    document.getElementById("sizeError").style.display = "none";
  });

  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qtyInput.value = Math.min(10, Number(qtyInput.value) + 1);
  });

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (!selectedSize) {
      document.getElementById("sizeError").style.display = "block";
      return;
    }
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    addItem(product.id, selectedSize, qty);
    showToast(`${product.name} (Talla ${selectedSize}) añadido al carrito`);
  });
}

function categoryLabel(category) {
  return { seleccion: "Selección", club: "Club", retro: "Retro" }[category] || category;
}

async function renderRelated(current, allProducts) {
  const container = document.getElementById("relatedGrid");
  if (!container) return;
  const related = allProducts.filter((p) => p.category === current.category && p.id !== current.id).slice(0, 4);
  if (!related.length) {
    document.getElementById("relatedSection").style.display = "none";
    return;
  }
  container.innerHTML = related.map(productCardHTML).join("");
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const allProducts = await loadProducts();
  const product = id ? await getProductById(id) : null;

  if (!product) {
    renderNotFound();
    return;
  }

  renderProduct(product);
  renderRelated(product, allProducts);
}

init();

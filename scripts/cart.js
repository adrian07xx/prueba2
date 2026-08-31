const STORAGE_KEY = "kickoff_cart_v1";

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart:change", { detail: { items } }));
}

export function getCart() {
  return readCart();
}

export function addItem(productId, size, qty = 1) {
  const items = readCart();
  const existing = items.find((i) => i.id === productId && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ id: productId, size, qty });
  }
  writeCart(items);
  return items;
}

export function updateQty(productId, size, qty) {
  let items = readCart();
  if (qty <= 0) {
    items = items.filter((i) => !(i.id === productId && i.size === size));
  } else {
    const existing = items.find((i) => i.id === productId && i.size === size);
    if (existing) existing.qty = qty;
  }
  writeCart(items);
  return items;
}

export function removeItem(productId, size) {
  const items = readCart().filter((i) => !(i.id === productId && i.size === size));
  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
}

export function getCount() {
  return readCart().reduce((sum, i) => sum + i.qty, 0);
}

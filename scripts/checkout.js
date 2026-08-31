import { getCart } from "./cart.js";

function setStatus(message, isError = false) {
  const el = document.getElementById("checkoutStatus");
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "var(--color-danger)" : "var(--color-text-muted)";
}

async function startCheckout() {
  const items = getCart();
  if (!items.length) return;

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  setStatus("Redirigiendo a Stripe Checkout…");

  try {
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "No se pudo iniciar el pago.");
    }

    const { url } = await res.json();
    if (!url) throw new Error("Respuesta de pago inválida.");
    window.location.href = url;
  } catch (err) {
    setStatus(err.message || "Ha ocurrido un error al iniciar el pago. Inténtalo de nuevo.", true);
    btn.disabled = false;
  }
}

document.getElementById("checkoutBtn")?.addEventListener("click", startCheckout);

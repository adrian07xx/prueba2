const Stripe = require("stripe");
const products = require("../../scripts/data/products.json");

const MAX_QTY_PER_LINE = 10;
const MAX_LINES = 20;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function resolveSiteUrl(event) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const origin = event.headers?.origin || event.headers?.Origin;
  if (origin) return origin.replace(/\/+$/, "");
  return "";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Método no permitido." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return jsonResponse(500, { error: "Stripe no está configurado en el servidor." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Cuerpo de la petición inválido." });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) {
    return jsonResponse(400, { error: "El carrito está vacío." });
  }
  if (items.length > MAX_LINES) {
    return jsonResponse(400, { error: "El carrito tiene demasiadas líneas distintas." });
  }

  const siteUrl = resolveSiteUrl(event);
  if (!siteUrl) {
    return jsonResponse(500, { error: "No se pudo determinar la URL del sitio." });
  }

  const lineItems = [];

  for (const rawItem of items) {
    const { id, size, qty } = rawItem || {};
    const product = products.find((p) => p.id === id);

    if (!product) {
      return jsonResponse(400, { error: `Producto no encontrado: ${String(id)}` });
    }
    if (!product.sizes.includes(size)) {
      return jsonResponse(400, { error: `Talla no disponible para ${product.name}: ${String(size)}` });
    }
    const quantity = Number.isInteger(qty) ? qty : parseInt(qty, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      return jsonResponse(400, { error: `Cantidad inválida para ${product.name}.` });
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: product.currency,
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: `${product.name} — Talla ${size}`,
          description: product.team,
          images: [`${siteUrl}/${product.images[0]}`],
        },
      },
    });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel.html`,
      shipping_address_collection: { allowed_countries: ["ES", "PT", "FR", "IT", "DE", "AD"] },
      automatic_tax: { enabled: false },
    });

    return jsonResponse(200, { url: session.url });
  } catch (err) {
    console.error("Error creando la sesión de Stripe Checkout:", err);
    return jsonResponse(500, { error: "No se pudo iniciar el pago. Inténtalo de nuevo." });
  }
};

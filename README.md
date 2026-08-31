# Kickoff Shirts — tienda de camisetas de fútbol

Tienda estática (HTML/CSS/JS puro, sin frameworks) con carrito en el cliente y
pago real mediante **Stripe Checkout**, servido por una función serverless de
**Netlify Functions**.

## Por qué Netlify Functions

El sitio es 100% estático y sin build. Netlify sirve el HTML/CSS/JS y la
función serverless bajo el mismo dominio (`/.netlify/functions/...`), lo que
evita configurar CORS, y su plan gratuito cubre de sobra un catálogo de menos
de 20 productos. `netlify dev` permite probar la función de Stripe en local
sin infraestructura adicional.

## Estructura del proyecto

```
index.html                 Home
tienda.html                Catálogo con filtros
producto.html               Ficha de producto (?id=slug)
carrito.html                Carrito
success.html / cancel.html  Confirmación / cancelación de Stripe
styles/                     variables.css, base.css, components.css, pages.css
scripts/
  data/products.json         Catálogo (fuente única de verdad, cliente y servidor)
  data/load-products.js       Carga y cachea el catálogo (fetch)
  cart.js                     Carrito en localStorage
  product-card.js              Plantilla de tarjeta de producto
  render-home.js / render-products.js / render-product.js / render-cart.js
  checkout.js                 Llama a la función serverless y redirige a Stripe
  nav.js / toast.js           Menú móvil, contador de carrito, notificaciones
assets/products/             Imágenes de las camisetas (SVG)
netlify/functions/create-checkout-session.js   Función Stripe
netlify.toml, package.json, .env.example
```

## 1. Configurar Stripe (modo test)

1. Crea una cuenta en https://dashboard.stripe.com/register (o usa una existente).
2. Asegúrate de estar en **modo Test** (interruptor arriba a la derecha del dashboard).
3. Ve a **Developers → API keys** y copia la **Secret key** (empieza por `sk_test_...`).
4. Copia `.env.example` a `.env` (para desarrollo local con `netlify dev`) y
   rellena:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   SITE_URL=http://localhost:8888
   ```
5. **Nunca** subas `.env` ni la clave real a git (ya está en `.gitignore`).
6. Para pagar en modo test usa una tarjeta de prueba de Stripe, por ejemplo
   `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

No hace falta clave pública (`pk_test_...`) porque el frontend nunca carga
Stripe.js: la función serverless crea la sesión de Checkout y el navegador
simplemente redirige a la URL que Stripe devuelve.

## 2. Probar en local

```bash
npm install -g netlify-cli   # si no lo tienes
npm install                  # instala la dependencia "stripe" de la función
netlify dev
```

`netlify dev` sirve el sitio estático y las funciones juntos (por defecto en
`http://localhost:8888`), leyendo las variables de tu `.env`.

> Abrir `index.html` con doble clic (`file://`) no funciona: el catálogo se
> carga con `fetch('scripts/data/products.json')`, que requiere servirse por
> HTTP. Usa `netlify dev` o cualquier servidor estático simple.

## 3. Desplegar en Netlify

1. Sube el proyecto a un repositorio Git (GitHub/GitLab/Bitbucket).
2. En Netlify: **Add new site → Import an existing project** y selecciona el repo.
3. Build settings: **Build command** vacío, **Publish directory** `.` (ya vienen
   preconfigurados en `netlify.toml`).
4. En **Site settings → Environment variables** añade:
   - `STRIPE_SECRET_KEY` = tu clave secreta de Stripe (test o, cuando lances a
     producción, `sk_live_...`).
   - `SITE_URL` = la URL de tu sitio en Netlify (p. ej. `https://tu-tienda.netlify.app`).
5. Despliega. Netlify instalará la dependencia `stripe` del `package.json` y
   empaquetará automáticamente `netlify/functions/create-checkout-session.js`.
6. Cuando quieras cobrar de verdad, cambia `STRIPE_SECRET_KEY` por tu clave
   `sk_live_...` y activa tu cuenta de Stripe para pagos reales.

## 4. Qué archivos editar

| Quiero... | Archivo |
|---|---|
| Añadir, quitar o editar productos, precios o tallas | `scripts/data/products.json` (es la única fuente: la usan el catálogo del cliente **y** la función de Stripe, así el precio cobrado siempre coincide con el mostrado) |
| Añadir imágenes de un producto | `assets/products/` + referenciarlas en `images` dentro de `products.json` |
| Cambiar colores, tipografía o "marca" | `styles/variables.css` (variables `--color-*`, `--font-*`) |
| Cambiar textos de envíos/devoluciones/contacto | Bloque `<footer>` en cada página HTML |
| Cambiar el nombre de la tienda o el logo | Buscar "Kickoff Shirts" y el `brand-mark` (`K`) en las páginas HTML |
| Cambiar países de envío admitidos por Stripe | `shipping_address_collection.allowed_countries` en `netlify/functions/create-checkout-session.js` |

## Seguridad del pago

- El frontend nunca ve ni maneja datos de tarjeta: solo llama a la función
  serverless y redirige a la URL de Stripe Checkout que esta devuelve.
- La función valida cada `id`, `talla` y `cantidad` recibidos contra
  `products.json` y calcula el precio **en el servidor** — el precio final
  cobrado nunca depende de lo que envíe el navegador.
- La clave `STRIPE_SECRET_KEY` solo existe como variable de entorno del
  servidor (Netlify Functions), nunca en el código del cliente.

## Limitaciones conocidas (a propósito, para mantenerlo simple)

- No hay base de datos ni gestión de stock en tiempo real: los productos son
  datos estáticos.
- No hay verificación server-side del `session_id` en `success.html` ni
  webhooks de Stripe para automatizar el cumplimiento de pedidos (fulfillment).
  Para un negocio en producción, añade un webhook de Stripe
  (`checkout.session.completed`) que registre el pedido en tu sistema.

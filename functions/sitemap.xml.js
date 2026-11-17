/* Mapa del sitio automático: páginas fijas + casas activas en venta y alquiler. */
const WEB = "https://evolvrealestate.com";
const FIJAS = [
  "/", "/comprar", "/alquilar", "/vender", "/valorar", "/reservar",
  "/inmobiliaria-los-molinos", "/inmobiliaria-guadarrama", "/inmobiliaria-cercedilla", "/inmobiliaria-collado-mediano",
  "/inmobiliaria-alpedrete", "/inmobiliaria-moralzarzal", "/inmobiliaria-becerril-de-la-sierra", "/inmobiliaria-navacerrada",
  "/inmobiliaria-collado-villalba", "/inmobiliaria-el-escorial", "/inmobiliaria-san-lorenzo-de-el-escorial",
  "/blog", "/blog/precio-vivienda-sierra-de-madrid-2026", "/blog/impuestos-vender-casa", "/blog/preparar-casa-para-vender",
  "/privacidad", "/aviso-legal",
];
const slug = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
function ids(lista) {
  const vistos = {};
  return (Array.isArray(lista) ? lista : []).filter((p) => p && p.visible !== false).map((p) => {
    let id = slug(p.nombre + " " + p.zona) || "casa";
    vistos[id] = (vistos[id] || 0) + 1;
    if (vistos[id] > 1) id += "-" + vistos[id];
    return id;
  });
}
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const leer = (t) => env.ASSETS.fetch(new URL(`/data/${t}.json`, url)).then((r) => r.json()).catch(() => []);
  const [venta, alquiler] = await Promise.all([leer("venta"), leer("alquiler")]);
  const urls = [...FIJAS, ...ids(venta).map((i) => `/venta/${i}`), ...ids(alquiler).map((i) => `/alquiler/${i}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${WEB}${u}</loc></url>\n`).join("") + `</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

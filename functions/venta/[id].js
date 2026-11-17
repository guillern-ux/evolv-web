/* Ficha de casa con dirección propia (/TIPO/<id>).
   Devuelve casa.html con título, descripción, vista previa y datos para Google
   ya puestos, para que los buscadores los lean sin ejecutar JavaScript. */
const TIPO = "venta";
const WEB = "https://evolvrealestate.com";
const slug = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const euros = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";

// Mismo identificador que usa la web (js/datos.js)
function preparar(lista) {
  const vistos = {};
  return (Array.isArray(lista) ? lista : []).filter((p) => p && p.visible !== false).map((p) => {
    let id = slug(p.nombre + " " + p.zona) || "casa";
    vistos[id] = (vistos[id] || 0) + 1;
    if (vistos[id] > 1) id += "-" + vistos[id];
    return { ...p, id };
  });
}

export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const [htmlRes, datosRes] = await Promise.all([
    env.ASSETS.fetch(new URL("/casa", url)),
    env.ASSETS.fetch(new URL(`/data/${TIPO}.json`, url)),
  ]);
  let html = await htmlRes.text();
  const lista = preparar(await datosRes.json().catch(() => []));
  const id = String(params.id || "");
  const p = lista.find((x) => x.id === id);
  const cabeceras = { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" };

  if (!p) {
    html = html.replace("<title>", '<meta name="robots" content="noindex">\n<title>');
    return new Response(html, { status: 404, headers: cabeceras });
  }

  const alq = TIPO === "alquiler";
  const precio = euros(p.precio) + (alq ? "/mes" : "");
  const datos = [p.hab ? `${p.hab} habitaciones` : "", p.banos ? `${p.banos} baños` : "", p.m2 ? `${p.m2} m²` : ""].filter(Boolean).join(", ");
  const titulo = `${p.nombre} en ${alq ? "alquiler" : "venta"} en ${p.zona} · ${precio} | Evolv Real Estate`;
  const texto = String(p.descripcion || "").replace(/\s+/g, " ").trim();
  let desc = `${p.nombre} en ${alq ? "alquiler" : "venta"} en ${p.zona} (Sierra de Madrid)${datos ? ": " + datos : ""}. ${precio}.` + (texto ? " " + texto : "");
  if (desc.length > 160) desc = desc.slice(0, 157).replace(/\s\S*$/, "") + "…";
  const canonica = `${WEB}/${TIPO}/${p.id}`;
  const foto = p.img ? (p.img.startsWith("http") ? p.img : WEB + p.img) : `${WEB}/img/og-evolv.jpg`;
  const ld = [
    {
      "@context": "https://schema.org", "@type": "RealEstateListing", name: `${p.nombre} en ${p.zona}`, url: canonica, image: foto, description: desc,
      offers: { "@type": "Offer", price: Number(p.precio) || 0, priceCurrency: "EUR", businessFunction: alq ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: WEB + "/" },
        { "@type": "ListItem", position: 2, name: alq ? "Alquilar" : "Comprar", item: `${WEB}/${alq ? "alquilar" : "comprar"}` },
        { "@type": "ListItem", position: 3, name: `${p.nombre} en ${p.zona}`, item: canonica },
      ],
    },
  ];
  const meta = [
    `<link rel="canonical" href="${canonica}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(titulo)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${canonica}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
  ].join("\n");
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">\n${meta}`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(foto)}">`);
  return new Response(html, { headers: cabeceras });
}

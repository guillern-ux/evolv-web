/* =========================================================
   Carga de datos de la web.
   Los datos se editan desde el panel (Pages CMS) o en la carpeta /data:
     data/ajustes.json   → teléfono, email, redes, fotos generales, opiniones, datos legales
     data/venta.json     → casas en venta
     data/alquiler.json  → casas en alquiler
   ========================================================= */

let CONFIG = {}, IMAGENES = {}, VENTA = [], ALQUILER = [], TESTIMONIOS = [];

const leer = (ruta) =>
  fetch(ruta, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

/* "Chalet" + "Los Molinos" → "chalet-los-molinos" */
const slug = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* Escapa texto para meterlo en HTML */
const esc = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const listo = Promise.all([leer("/data/ajustes.json"), leer("/data/venta.json"), leer("/data/alquiler.json")]).then(
  ([ajustes, venta, alquiler]) => {
    CONFIG = ajustes || {};
    IMAGENES = { portada: CONFIG.portada, comprar: CONFIG.imagenComprar };
    TESTIMONIOS = (CONFIG.testimonios || []).filter((t) => t && t.texto);
    const preparar = (l, tipo) => {
      const vistos = {};
      return (Array.isArray(l) ? l : [])
        .filter((p) => p && p.visible !== false)
        .map((p) => {
          let id = slug(p.nombre + " " + p.zona) || "casa";
          vistos[id] = (vistos[id] || 0) + 1;
          if (vistos[id] > 1) id += "-" + vistos[id];
          return { ...p, id, tipo, estado: p.estado || "Disponible", fotos: [p.img, ...(p.galeria || [])].filter(Boolean) };
        });
    };
    VENTA = preparar(venta, "venta");
    ALQUILER = preparar(alquiler, "alquiler");
  }
);

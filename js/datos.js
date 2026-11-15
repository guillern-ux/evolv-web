/* =========================================================
   Carga de datos de la web.
   Los datos se editan desde el panel (Pages CMS) o en la carpeta /data:
     data/ajustes.json   → teléfono, email, redes, fotos generales, opiniones
     data/venta.json     → casas en venta
     data/alquiler.json  → casas en alquiler
   ========================================================= */

let CONFIG = {}, IMAGENES = {}, VENTA = [], ALQUILER = [], TESTIMONIOS = [];

const leer = (ruta) =>
  fetch(ruta, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

const listo = Promise.all([leer("/data/ajustes.json"), leer("/data/venta.json"), leer("/data/alquiler.json")]).then(
  ([ajustes, venta, alquiler]) => {
    CONFIG = ajustes || {};
    IMAGENES = { portada: CONFIG.portada, comprar: CONFIG.imagenComprar };
    TESTIMONIOS = (CONFIG.testimonios || []).filter((t) => t && t.texto);
    const visibles = (l) => (Array.isArray(l) ? l.filter((p) => p && p.visible !== false) : []);
    VENTA = visibles(venta);
    ALQUILER = visibles(alquiler);
  }
);

/* Sugerencias de direcciones mientras escribes (como en Google Maps).
   Sirve para cualquier campo con el atributo data-direccion:
     data-direccion         → al elegir, escribe la dirección completa
     data-direccion="calle" → al elegir, escribe solo calle y número (el municipio va aparte)
   Al elegir una opción, el campo lanza el evento "direccion" con
   { texto, calle, numero, municipio, cp, provincia }.
   Datos: Photon (OpenStreetMap), gratis y sin clave. */
(() => {
  const URL_API = "https://photon.komoot.io/api/";
  // Zona de búsqueda: Comunidad de Madrid y alrededores, dando prioridad a la Sierra (Los Molinos)
  const CAJA = "-4.75,39.85,-3.0,41.25";
  const CENTRO = { lat: 40.7, lon: -4.07 };

  const css = `
  .dir-lista{position:absolute;z-index:9999;background:#fff;border-radius:14px;box-shadow:0 12px 36px rgba(40,26,57,.18);
    padding:.35rem;margin:0;list-style:none;max-height:320px;overflow-y:auto;font-family:inherit;text-align:left}
  .dir-lista li{display:flex;gap:.7rem;align-items:flex-start;padding:.6rem .7rem;border-radius:10px;cursor:pointer;color:#1d1724;line-height:1.3}
  .dir-lista li.activa,.dir-lista li:hover{background:#e6e3ef}
  .dir-lista svg{flex:0 0 18px;width:18px;height:18px;margin-top:.1rem;fill:#5c5168}
  .dir-lista b{display:block;font-weight:700;font-size:.97rem}
  .dir-lista small{display:block;color:#5c5168;font-size:.84rem}
  .dir-lista .dir-pie{display:block;cursor:default;padding:.3rem .7rem .2rem;font-size:.72rem;color:#8a8294;background:none!important}`;
  const estilo = document.createElement("style");
  estilo.textContent = css;
  document.head.appendChild(estilo);

  const PIN = '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>';
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let campo = null, lista = null, opciones = [], activa = -1, temporizador = null, ultima = "", peticion = 0;
  const cache = new Map();

  function convertir(f) {
    const p = f.properties || {};
    const municipio = p.city || p.town || p.village || (["city", "town", "village"].includes(p.type) || p.osm_value === "village" || p.osm_value === "town" ? p.name : "") || p.county || "";
    const esCalle = p.type === "street" || p.osm_key === "highway";
    const calle = p.street || (esCalle ? p.name : "");
    const numero = p.housenumber || "";
    const lugar = !calle && p.name && p.name !== municipio ? p.name : "";
    const principal = calle ? `${calle}${numero ? ", " + numero : ""}` : lugar || municipio || p.name || "";
    const secundaria = [lugar && calle ? lugar : "", [p.postcode, municipio !== principal ? municipio : ""].filter(Boolean).join(" "), p.state].filter(Boolean).join(", ");
    const texto = [principal, [p.postcode, municipio !== principal ? municipio : ""].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    return { texto, principal, secundaria, calle, numero, municipio, cp: p.postcode || "", provincia: p.state || "" };
  }

  async function buscar(q) {
    if (cache.has(q)) return cache.get(q);
    const u = `${URL_API}?q=${encodeURIComponent(q)}&limit=8&bbox=${CAJA}&lat=${CENTRO.lat}&lon=${CENTRO.lon}&location_bias_scale=0.4`;
    const r = await fetch(u);
    if (!r.ok) throw new Error("Sin respuesta");
    const j = await r.json();
    const vistos = new Set();
    const res = (j.features || [])
      .filter((f) => { const p = f.properties || {}; return (!p.countrycode || p.countrycode === "ES") && (p.type !== "house" || p.housenumber); })
      .map(convertir)
      .filter((o) => o.principal && !vistos.has(o.texto) && vistos.add(o.texto))
      .slice(0, 6);
    cache.set(q, res);
    return res;
  }

  function colocar() {
    if (!lista || !campo) return;
    const r = campo.getBoundingClientRect();
    lista.style.left = `${r.left + scrollX}px`;
    lista.style.top = `${r.bottom + scrollY + 6}px`;
    lista.style.width = `${Math.max(r.width, 260)}px`;
  }
  function cerrar() {
    if (lista) lista.remove();
    lista = null; opciones = []; activa = -1;
    if (campo) campo.setAttribute("aria-expanded", "false");
  }
  function pintar() {
    if (!opciones.length) return cerrar();
    if (!lista) {
      lista = document.createElement("ul");
      lista.className = "dir-lista";
      lista.id = "dir-lista";
      lista.setAttribute("role", "listbox");
      document.body.appendChild(lista);
      lista.addEventListener("mousedown", (e) => {
        const li = e.target.closest("li[data-i]");
        e.preventDefault();
        if (li) elegir(Number(li.dataset.i));
      });
    }
    lista.innerHTML = opciones.map((o, k) => `<li role="option" data-i="${k}" class="${k === activa ? "activa" : ""}">${PIN}<span><b>${esc(o.principal)}</b>${o.secundaria ? `<small>${esc(o.secundaria)}</small>` : ""}</span></li>`).join("")
      + '<li class="dir-pie">Direcciones: © OpenStreetMap</li>';
    campo.setAttribute("aria-expanded", "true");
    colocar();
  }
  function elegir(k) {
    const o = opciones[k];
    if (!o || !campo) return;
    const soloCalle = campo.dataset.direccion === "calle" && o.calle;
    campo.value = soloCalle ? `${o.calle}${o.numero ? ", " + o.numero : ""}` : o.texto;
    ultima = campo.value;
    cerrar();
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    campo.dispatchEvent(new CustomEvent("direccion", { bubbles: true, detail: o }));
  }

  document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || !el.hasAttribute("data-direccion")) return;
    if (campo !== el) { cerrar(); campo = el; }
    el.setAttribute("autocomplete", "off");
    el.setAttribute("aria-autocomplete", "list");
    el.setAttribute("aria-controls", "dir-lista");
  });
  document.addEventListener("focusout", (e) => { if (e.target === campo) setTimeout(cerrar, 120); });
  document.addEventListener("input", (e) => {
    if (e.target !== campo || !e.isTrusted) return;
    const q = campo.value.trim();
    clearTimeout(temporizador);
    if (q.length < 3) { ultima = q; return cerrar(); }
    if (q === ultima) return;
    temporizador = setTimeout(async () => {
      ultima = q;
      const n = ++peticion;
      try {
        const res = await buscar(q);
        if (n !== peticion || document.activeElement !== campo) return;
        opciones = res; activa = -1; pintar();
      } catch (_) { cerrar(); }
    }, 250);
  });
  // En fase de captura, para que Intro elija la sugerencia y no envíe el formulario
  document.addEventListener("keydown", (e) => {
    if (e.target !== campo || !lista) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      activa = (activa + (e.key === "ArrowDown" ? 1 : -1) + opciones.length) % opciones.length;
      pintar();
    } else if (e.key === "Enter" && activa >= 0) {
      e.preventDefault(); e.stopPropagation(); elegir(activa);
    } else if (e.key === "Escape") {
      e.stopPropagation(); cerrar();
    }
  }, true);
  addEventListener("resize", colocar);
  addEventListener("scroll", colocar, true);
})();

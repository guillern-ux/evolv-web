/* =========================================================
   Panel de Evolv Real Estate
   Habla con el script de Google (API) usando la clave del panel.
   ========================================================= */
const API = "https://script.google.com/macros/s/AKfycbwGR2L7koNY9z5eOSg63YuxVTuKIkSATXEIQ0PBzcdvedY35DwqhAYNIMNclJunNoVx/exec";
const WEB = "https://evolvrealestate.com";
const HOJA = "https://docs.google.com/spreadsheets/d/17b0-6ltLGZWfjZG61VU3JgmShSVv9Y1QJdEYLxN6CDU/edit";
const ESTADOS_MSJ = ["Nuevo", "Respondido", "Visita confirmada", "Cerrado"];

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const euros = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
const slug = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const clase = (t) => slug(t || "");
const pad = (n) => String(n).padStart(2, "0");
const claveDia = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const aLocalInput = (d) => `${claveDia(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmtFechaHora = (d) => d.toLocaleString("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtDia = (d) => d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const guardarLocal = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
const leerLocal = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
const borrarLocal = (k) => { try { localStorage.removeItem(k); } catch (_) {} };
const linea = (txt, campo) => ((String(txt || "").match(new RegExp("^" + campo + ":\\s*(.*)$", "mi")) || [])[1] || "").trim();
const telWa = (t) => {
  let d = String(t || "").replace(/\D/g, "");
  if (d.length === 9) d = "34" + d;
  return d;
};
/* Mismo identificador que usa la web para cada casa (/venta/<id> o /alquiler/<id>) */
function idsWeb(lista) {
  const vistos = {};
  return lista.map((p) => {
    if (p.visible === false) return null;
    let id = slug(p.nombre + " " + p.zona) || "casa";
    vistos[id] = (vistos[id] || 0) + 1;
    if (vistos[id] > 1) id += "-" + vistos[id];
    return id;
  });
}
const urlCasaWeb = (tipo, i) => { const id = idsWeb(tipo === "venta" ? S.venta : S.alquiler)[i]; return id ? `${WEB}/${tipo}/${id}` : ""; };
const ICO = {
  cama: '<svg viewBox="0 0 24 24"><path d="M3 18v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6M3 14h18M3 18v2M21 18v2M7 9V6h4v3"/></svg>',
  bano: '<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  m2: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 9h5M15 20v-5M9 4v5M20 15h-5"/></svg>',
};
const datosCasa = (p) => `<span class="datos-ico">
  <span title="Habitaciones">${ICO.cama}${p.hab ?? "–"}</span><span title="Baños">${ICO.bano}${p.banos ?? "–"}</span><span title="Superficie">${ICO.m2}${p.m2 ?? "–"} m²</span></span>`;
/* Casa a la que se refiere un mensaje (por el enlace de la ficha o por el nombre) */
function casaDeMensaje(m) {
  const enl = m["Enlace del inmueble"] || "";
  const q = enl.match(/\/(venta|alquiler)\/([^/?&#\s]+)/) || enl.match(/tipo=(venta|alquiler)&id=([^&#\s]+)/);
  for (const tipo of ["venta", "alquiler"]) {
    const lista = tipo === "venta" ? S.venta : S.alquiler;
    const ids = idsWeb(lista);
    if (q && q[1] === tipo) { const i = ids.indexOf(decodeURIComponent(q[2])); if (i >= 0) return { tipo, i, p: lista[i] }; }
  }
  const inm = String(m.Inmueble || "");
  if (!inm || /^Aún no lo sé/i.test(inm)) return null;
  const alq = /alquil/i.test(m["Operación"] || "") || /\/mes/.test(inm);
  for (const tipo of alq ? ["alquiler", "venta"] : ["venta", "alquiler"]) {
    const lista = tipo === "venta" ? S.venta : S.alquiler;
    const i = lista.findIndex((p) => inm.startsWith(`${p.nombre} (${p.zona})`));
    if (i >= 0) return { tipo, i, p: lista[i] };
  }
  return null;
}
const nombreInmueble = (m) => String(m.Inmueble || "").split(" · ")[0];
/* Artículos del blog (foto por defecto si no se ha cambiado en Ajustes) */
const BLOG = [
  ["vivir-en-los-molinos", "Vivir en Los Molinos: guía para comprar casa", "/img/portada.jpg"],
  ["comprar-casa-el-escorial-san-lorenzo", "Comprar casa en El Escorial o San Lorenzo", "/img/centro-colon.jpg"],
  ["gastos-vender-casa", "Cuánto cuesta vender una casa", "/img/plaza-loreto.jpg"],
  ["precio-vivienda-sierra-de-madrid-2026", "Cuánto cuesta una casa en la Sierra de Madrid", "/img/comprar-vivienda.jpg"],
  ["impuestos-vender-casa", "Qué impuestos pagas al vender tu casa", "/img/la-perla.jpg"],
  ["preparar-casa-para-vender", "Cómo preparar tu casa para venderla", "/img/chalet-los-molinos.jpg"],
];
const fotoURL = (p) => (!p ? "" : p.startsWith("http") || p.startsWith("data:") ? p : S.previews[p] || WEB + p);

/* ---------- Estado ---------- */
const S = {
  clave: leerLocal("evolvClave"),
  mensajes: [], visitas: [], venta: [], alquiler: [], shaV: null, shaA: null,
  ajustes: null, shaAj: null, github: false, casasEditables: false,
  vista: "inicio", filtro: "todos", busca: "", sel: null, tab: "venta", buscaCasa: "",
  mes: new Date(new Date().getFullYear(), new Date().getMonth(), 1), dia: claveDia(new Date()),
  previews: {}, ultimaFila: Number(leerLocal("evolvUltimaFila") || 0),
};

/* ---------- Comunicación con el script ---------- */
async function api(accion, datos = {}) {
  const r = await fetch(API, { method: "POST", body: JSON.stringify({ clave: S.clave, accion, datos }) });
  const j = await r.json();
  if (!j.ok) {
    if (j.auth === false) { salir(j.error); throw new Error(j.error); }
    throw new Error(j.error || "Error desconocido");
  }
  return j.datos;
}

/* ---------- Avisos visuales ---------- */
function toast(msg, tipo = "") {
  const t = document.createElement("div");
  t.className = "toast " + tipo;
  t.textContent = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), tipo === "error" ? 7000 : 4000);
}
function abrirModal(html) {
  $("#modal-caja").innerHTML = html;
  $("#modal").classList.remove("oculto");
}
function cerrarModal() { $("#modal").classList.add("oculto"); $("#modal-caja").innerHTML = ""; }
function confirmar(texto, boton = "Confirmar", peligro = false) {
  return new Promise((res) => {
    abrirModal(`<div class="modal-cab"><h2>¿Seguro?</h2></div><div class="modal-cuerpo"><p>${texto}</p></div>
      <div class="modal-pie"><button class="btn" id="c-no">Cancelar</button><button class="btn ${peligro ? "rojo" : "primario"}" id="c-si">${boton}</button></div>`);
    $("#c-no").onclick = () => { cerrarModal(); res(false); };
    $("#c-si").onclick = () => { cerrarModal(); res(true); };
  });
}
async function conBoton(btn, fn) {
  const txt = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Un momento…";
  try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = txt; }
}

/* ---------- Acceso ---------- */
function salir(msg) {
  S.clave = null;
  borrarLocal("evolvClave");
  $("#app").classList.add("oculto");
  $("#login").classList.remove("oculto");
  $("#login-error").textContent = msg || "";
}
$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter || $("#form-login button");
  S.clave = $("#clave").value.trim();
  $("#login-error").textContent = "";
  await conBoton(btn, async () => {
    try {
      await api("estadoToken");
      guardarLocal("evolvClave", S.clave);
      arrancar();
    } catch (err) {
      $("#login").classList.remove("oculto");
      $("#login-error").textContent = err.message;
    }
  });
});

/* ---------- Carga de datos ---------- */
async function cargarTodo(silencioso) {
  const r = await api("resumen");
  detectarNuevos(r.mensajes);
  S.mensajes = r.mensajes;
  S.visitas = r.visitas;
  S.github = r.github;
  if (!S.casasEditables) { S.venta = r.venta || []; S.alquiler = r.alquiler || []; }
  actualizarInsignias();
  if (!silencioso) pintar();
}
async function cargarCasas() {
  if (!S.github) return;
  const r = await api("casas");
  S.venta = r.venta.datos; S.shaV = r.venta.sha;
  S.alquiler = r.alquiler.datos; S.shaA = r.alquiler.sha;
  S.casasEditables = true;
}
async function cargarVisitasMes() {
  const ini = new Date(S.mes.getFullYear(), S.mes.getMonth(), 1 - 7);
  const fin = new Date(S.mes.getFullYear(), S.mes.getMonth() + 1, 7);
  const lista = await api("visitas", { desde: ini.toISOString(), hasta: fin.toISOString() });
  const ids = new Set(lista.map((v) => v.id));
  S.visitas = S.visitas.filter((v) => !ids.has(v.id) && (new Date(v.inicio) < ini || new Date(v.inicio) > fin)).concat(lista);
}

/* ---------- Avisos de mensajes nuevos ---------- */
function detectarNuevos(lista) {
  const max = Math.max(0, ...lista.map((m) => m._fila));
  if (S.ultimaFila && max > S.ultimaFila) {
    const nuevos = lista.filter((m) => m._fila > S.ultimaFila);
    nuevos.forEach((m) => {
      const t = `${tipoMsj(m)}: ${nombreMsj(m)}`;
      toast("Nuevo · " + t, "ok");
      try { if (window.Notification && Notification.permission === "granted") new Notification("Evolv · Nuevo mensaje", { body: t }); } catch (_) {}
    });
  }
  S.ultimaFila = max;
  guardarLocal("evolvUltimaFila", String(max));
}
function actualizarInsignias() {
  const nuevos = S.mensajes.filter((m) => m.Estado === "Nuevo").length;
  const pend = visitasFuturas().filter((v) => v.estado === "Pendiente").length;
  $("#ins-mensajes").textContent = nuevos || "";
  $("#ins-visitas").textContent = pend || "";
  $("#ins-avisos").textContent = nuevos + pend || "";
  document.title = (nuevos ? `(${nuevos}) ` : "") + "Panel · Evolv Real Estate";
}
function pintarAvisos() {
  const nuevos = S.mensajes.filter((m) => m.Estado === "Nuevo").slice(0, 8);
  const pend = visitasFuturas().filter((v) => v.estado === "Pendiente").slice(0, 6);
  $("#avisos").innerHTML = `<h3>Mensajes sin atender (${nuevos.length})</h3>
    ${nuevos.map(itemMensaje).join("") || '<p class="vacio">Todo al día ✓</p>'}
    <h3>Visitas por confirmar (${pend.length})</h3>
    ${pend.map(itemVisita).join("") || '<p class="vacio">Ninguna pendiente ✓</p>'}`;
}

/* ---------- Navegación ---------- */
const TITULOS = { inicio: "Inicio", mensajes: "Mensajes y solicitudes", visitas: "Visitas", casas: "Casas", ajustes: "Ajustes" };
function irA(v) { location.hash = v; }
window.addEventListener("hashchange", () => { S.vista = (location.hash.slice(1) || "inicio").split("/")[0]; pintar(); });
async function pintar() {
  S.vista = TITULOS[S.vista] ? S.vista : "inicio";
  $$("#nav a").forEach((a) => a.classList.toggle("activo", a.dataset.v === S.vista));
  $("#titulo-vista").textContent = TITULOS[S.vista];
  $("#avisos").classList.add("oculto");
  const vista = $("#vista");
  try {
    if (S.vista === "inicio") vista.innerHTML = vInicio();
    if (S.vista === "mensajes") vista.innerHTML = vMensajes();
    if (S.vista === "visitas") vista.innerHTML = vVisitas();
    if (S.vista === "casas") {
      if (S.github && !S.casasEditables) { vista.innerHTML = '<div class="cargando">Cargando casas…</div>'; await cargarCasas(); }
      if (S.vista === "casas") vista.innerHTML = vCasas();
    }
    if (S.vista === "ajustes") {
      if (S.github && !S.ajustes) { vista.innerHTML = '<div class="cargando">Cargando ajustes…</div>'; const r = await api("ajustes"); S.ajustes = r.datos; S.shaAj = r.sha; }
      if (S.vista === "ajustes") vista.innerHTML = vAjustes();
    }
  } catch (err) {
    vista.innerHTML = `<div class="aviso-info amarillo">No se ha podido cargar: ${esc(err.message)}</div>`;
  }
}

/* =========================================================
   INICIO
   ========================================================= */
const visitasFuturas = () => S.visitas
  .filter((v) => v.estado !== "Cancelada" && new Date(v.fin) >= new Date())
  .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
const publicadas = (l) => l.filter((p) => p.visible !== false && !["Vendida", "Alquilada"].includes(p.estado));

function vInicio() {
  const nuevos = S.mensajes.filter((m) => m.Estado === "Nuevo").length;
  const fut = visitasFuturas();
  const semana = fut.filter((v) => new Date(v.inicio) - new Date() < 7 * 864e5).length;
  const pend = fut.filter((v) => v.estado === "Pendiente").length;
  const pubV = publicadas(S.venta).length, pubA = publicadas(S.alquiler).length;
  return `
  <div class="kpis">
    <a class="kpi ${nuevos ? "alerta" : ""}" href="#mensajes"><small>Mensajes sin atender</small><strong>${nuevos}</strong><span>${S.mensajes.length} en total</span></a>
    <a class="kpi" href="#visitas"><small>Visitas esta semana</small><strong>${semana}</strong><span>${fut.length} próximas</span></a>
    <a class="kpi ${pend ? "alerta" : ""}" href="#visitas"><small>Por confirmar</small><strong>${pend}</strong><span>visitas pendientes</span></a>
    <a class="kpi" href="#casas"><small>Casas activas en la web</small><strong>${pubV + pubA}</strong><span>${pubV} venta · ${pubA} alquiler</span></a>
  </div>
  ${S.github ? "" : `<div class="aviso-info">Para crear y editar casas desde aquí, conecta GitHub en <a href="#ajustes"><b>Ajustes</b></a>.</div>`}
  <div class="rejilla2">
    <section class="caja"><h2>Próximas visitas <a href="#visitas">Ver calendario →</a></h2>
      <div class="lista-simple">${fut.slice(0, 6).map(itemVisita).join("") || '<p class="vacio">No hay visitas próximas</p>'}</div>
      <div class="acciones" style="margin-top:1rem"><button class="btn" data-acc="nuevaVisita">+ Nueva visita</button></div>
    </section>
    <section class="caja"><h2>Últimos mensajes <a href="#mensajes">Ver todos →</a></h2>
      <div class="lista-simple">${S.mensajes.slice(0, 6).map(itemMensaje).join("") || '<p class="vacio">Aún no hay mensajes</p>'}</div>
    </section>
  </div>
  <section class="caja" style="margin-top:1.5rem"><h2>Accesos rápidos</h2>
    <div class="acciones">
      <button class="btn primario" data-acc="nuevaCasa">+ Nueva casa</button>
      <a class="btn" href="${WEB}" target="_blank" rel="noopener">Ver la web</a>
      <a class="btn" href="${HOJA}" target="_blank" rel="noopener">Hoja de contactos</a>
      <a class="btn" href="https://calendar.google.com" target="_blank" rel="noopener">Google Calendar</a>
    </div>
  </section>`;
}

function itemVisita(v) {
  const d = new Date(v.inicio);
  return `<div class="fila-item" data-acc="verVisita" data-id="${esc(v.id)}">
    <div class="fecha-chip"><b>${d.getDate()}</b><small>${MESES[d.getMonth()]}</small></div>
    <div class="principal"><b>${esc(v.titulo)}</b><span>${v.todoElDia ? "Todo el día" : d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · ${esc(linea(v.descripcion, "Teléfono") || "")}</span></div>
    <span class="chip ${clase(v.estado)}">${esc(v.estado)}</span></div>`;
}

/* =========================================================
   MENSAJES
   ========================================================= */
const OCULTOS = ["_fila", "Estado", "Notas", "Fecha", "Formulario", "Página", "Cita", "Enlace del inmueble", "Valoración enviada"];
const nombreMsj = (m) => [m.Nombre, m.Apellido].filter(Boolean).join(" ") || m.email || "Sin nombre";
function tipoMsj(m) {
  const f = (m.Formulario || "").toLowerCase();
  if (f.includes("visita")) return "Visita";
  if (f.includes("valoraci")) return "Valoración";
  if (f.includes("propiedad") || f.includes("vender")) return "Propietario";
  if (f.includes("prueba")) return "Prueba";
  return "Contacto";
}
const resumenMsj = (m) => tipoMsj(m) === "Visita" && m.Inmueble
  ? [m["Operación"], nombreInmueble(m)].filter(Boolean).join(" · ")
  : m.Mensaje || m.Comentarios || m.Inmueble || m.Dirección || m.Servicio || "";

function itemMensaje(m) {
  return `<div class="fila-item" data-acc="abrirMensaje" data-fila="${m._fila}">
    <div class="principal"><b>${esc(nombreMsj(m))}</b><span>${esc(tipoMsj(m))} · ${esc(resumenMsj(m))}</span></div>
    <span class="chip ${clase(m.Estado || "Nuevo")}">${esc(m.Estado || "Nuevo")}</span></div>`;
}

function filtrarMensajes() {
  const q = S.busca.toLowerCase();
  return S.mensajes.filter((m) => {
    const t = tipoMsj(m), e = m.Estado || "Nuevo";
    const okF = S.filtro === "todos" || (S.filtro === "nuevos" && e === "Nuevo") || (S.filtro === "cerrados" && e === "Cerrado") ||
      (S.filtro === "visitas" && t === "Visita") || (S.filtro === "valoraciones" && t === "Valoración") || (S.filtro === "propietarios" && (t === "Propietario" || t === "Valoración")) || (S.filtro === "contacto" && t === "Contacto");
    return okF && (!q || Object.values(m).join(" ").toLowerCase().includes(q));
  });
}

function vMensajes() {
  const lista = filtrarMensajes();
  if (S.sel == null && lista.length) S.sel = lista[0]._fila;
  const m = S.mensajes.find((x) => x._fila === S.sel);
  const cuenta = (id) => { const g = S.filtro; S.filtro = id; const q = S.busca; S.busca = ""; const n = filtrarMensajes().length; S.filtro = g; S.busca = q; return n; };
  const f = (id, txt) => `<button class="filtro ${S.filtro === id ? "activo" : ""}" data-acc="filtroMsj" data-f="${id}">${txt} <small>${cuenta(id)}</small></button>`;
  return `
  <div class="filtros">
    ${f("todos", "Todos")}${f("nuevos", "Sin atender")}${f("visitas", "Visitas")}${f("valoraciones", "Valoraciones")}${f("propietarios", "Propietarios")}${f("contacto", "Contacto")}${f("cerrados", "Cerrados")}
    <input type="search" id="busca-msj" placeholder="Buscar nombre, email, casa…" value="${esc(S.busca)}">
  </div>
  <div class="bandeja">
    <div class="bandeja-lista">${lista.map((x) => `
      <div class="msj ${x._fila === S.sel ? "sel" : ""} ${x.Estado === "Nuevo" ? "no-leido" : ""}" data-acc="abrirMensaje" data-fila="${x._fila}">
        <div class="linea"><b>${esc(nombreMsj(x))}</b><small>${esc((x.Fecha || "").slice(0, 16))}</small></div>
        <div class="linea"><small class="tipo-${clase(tipoMsj(x))}">${esc(tipoMsj(x))}</small><span class="chip ${clase(x.Estado || "Nuevo")}">${esc(x.Estado || "Nuevo")}</span></div>
        <p>${esc(resumenMsj(x))}</p>
      </div>`).join("") || '<p class="vacio">No hay mensajes con este filtro</p>'}
    </div>
    <div>${m ? detalleMensaje(m) : '<div class="detalle vacio">Elige un mensaje</div>'}</div>
  </div>`;
}

function detalleMensaje(m) {
  const tel = m["Teléfono"] || "";
  const wa = telWa(tel);
  const datos = Object.keys(m).filter((k) => !OCULTOS.includes(k));
  const firma = `\n\nUn saludo,\nGuillermo\n${S.ajustes?.nombre || "Evolv Real Estate"}\n${S.ajustes?.telefono || "+34 627 05 76 68"}`;
  const casa = casaDeMensaje(m);
  const inm = casa ? `${casa.p.nombre} (${casa.p.zona})` : nombreInmueble(m);
  const cuerpo = `Hola ${m.Nombre || ""},\n\nGracias por contactar con Evolv Real Estate. ${tipoMsj(m) === "Visita" ? `Te escribo sobre tu solicitud para visitar ${inm || "el inmueble"}.` : ""}\n\n${firma}`;
  const enlace = m["Enlace del inmueble"] || (casa ? urlCasaWeb(casa.tipo, casa.i) : "");
  const fichaCasa = casa ? `<div class="msj-casa">
      ${casa.p.img ? `<img src="${esc(fotoURL(casa.p.img))}" alt="">` : '<div class="sin-foto"></div>'}
      <div class="mc-info"><small>${esc(m["Operación"] || (casa.tipo === "venta" ? "Comprar" : "Alquilar"))} · le interesa</small>
        <b>${esc(casa.p.nombre)}</b><span>${esc(casa.p.zona)} · ${euros(casa.p.precio)}${casa.tipo === "alquiler" ? "/mes" : ""}</span>
        <span class="chip ${clase(casa.p.estado || "Disponible")}">${esc(casa.p.estado || "Disponible")}</span></div>
      <div class="mc-acc">${enlace ? `<a class="btn peq" href="${esc(enlace)}" target="_blank" rel="noopener">Ver ficha ↗</a>` : ""}
        <button class="btn peq" data-acc="abrirCasa" data-tipo="${casa.tipo}" data-nombre="${esc(casa.p.nombre)}" data-zona="${esc(casa.p.zona)}">Abrir en Casas</button></div>
    </div>`
    : tipoMsj(m) === "Visita" && m.Inmueble ? `<div class="aviso-info">${m["Operación"] ? `<b>${esc(m["Operación"])}</b> · ` : ""}${esc(m.Inmueble)}${enlace ? ` · <a href="${esc(enlace)}" target="_blank" rel="noopener">Ver ficha ↗</a>` : ""}</div>` : "";
  const valor = m["Valoración enviada"] ? `<div class="aviso-info verde"><b>Valoración enviada al propietario:</b> ${esc(m["Valoración enviada"])}</div>` : "";
  return `<div class="detalle">
    <div class="detalle-cab">
      <div><h2>${esc(nombreMsj(m))}</h2><p><span class="chip tipo-${clase(tipoMsj(m))}">${esc(tipoMsj(m))}</span> recibido ${esc(m.Fecha || "")}</p></div>
      <div class="acciones">
        <select id="estado-msj" data-fila="${m._fila}" style="width:auto">${ESTADOS_MSJ.map((e) => `<option ${e === (m.Estado || "Nuevo") ? "selected" : ""}>${e}</option>`).join("")}</select>
        ${wa ? `<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(`Hola ${m.Nombre || ""}, soy Guillermo de Evolv Real Estate. `)}">WhatsApp</a>` : ""}
        ${tel ? `<a class="btn" href="tel:${esc(tel.replace(/\s/g, ""))}">Llamar</a>` : ""}
      </div>
    </div>
    ${m.Cita ? `<div class="aviso-info">${esc(m.Cita)} <a href="#visitas" data-acc="irVisitaDe" data-fecha="${esc(m["Fecha visita"] || "")}">Ver en el calendario →</a></div>` : ""}
    ${fichaCasa}${valor}
    <dl class="tabla-datos">${datos.map((k) => `<dt>${esc(k)}</dt><dd>${esc(m[k])}</dd>`).join("") || "<dd>Sin datos</dd>"}</dl>
    <div class="bloque"><h3>Notas internas</h3>
      <textarea id="nota-msj" placeholder="Apuntes sobre este cliente (solo los ves tú)">${esc(m.Notas || "")}</textarea>
      <div class="acciones" style="margin-top:.5rem"><button class="btn" data-acc="guardarNota" data-fila="${m._fila}">Guardar nota</button></div>
    </div>
    <div class="bloque"><h3>Responder por email</h3>
      ${m.email ? `<div class="campos">
        <div><label>Para</label><input type="email" id="r-para" value="${esc(m.email)}"></div>
        <div><label>Asunto</label><input type="text" id="r-asunto" value="${esc(tipoMsj(m) === "Visita" ? "Tu visita a " + (inm || "nuestro inmueble") : tipoMsj(m) === "Valoración" ? "La valoración de tu vivienda" : "Tu consulta en Evolv Real Estate")}"></div>
        <div class="completo"><label>Mensaje</label><textarea id="r-cuerpo" style="min-height:180px">${esc(cuerpo)}</textarea></div>
      </div>
      <div class="acciones" style="margin-top:.6rem"><button class="btn primario" data-acc="enviarRespuesta" data-fila="${m._fila}">Enviar email</button></div>`
      : '<p class="vacio">Este contacto no dejó email. Usa WhatsApp o llámale.</p>'}
    </div>
  </div>`;
}

/* =========================================================
   VISITAS (calendario)
   ========================================================= */
function vVisitas() {
  const y = S.mes.getFullYear(), mo = S.mes.getMonth();
  const primero = new Date(y, mo, 1);
  const desfase = (primero.getDay() + 6) % 7; // lunes primero
  const inicio = new Date(y, mo, 1 - desfase);
  const hoy = claveDia(new Date());
  const porDia = {};
  S.visitas.forEach((v) => { const k = claveDia(new Date(v.inicio)); (porDia[k] = porDia[k] || []).push(v); });
  Object.values(porDia).forEach((l) => l.sort((a, b) => new Date(a.inicio) - new Date(b.inicio)));
  let celdas = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    const k = claveDia(d);
    const evs = porDia[k] || [];
    celdas += `<div class="cal-celda ${d.getMonth() !== mo ? "fuera" : ""} ${k === hoy ? "hoy" : ""} ${k === S.dia ? "sel" : ""}" data-acc="elegirDia" data-dia="${k}">
      <span class="num">${d.getDate()}</span>
      ${evs.slice(0, 3).map((v) => `<span class="ev ${v.estado}">${v.todoElDia ? "" : new Date(v.inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + " "}${esc(v.titulo)}</span>`).join("")}
      ${evs.length > 3 ? `<span class="ev">+${evs.length - 3} más</span>` : ""}
    </div>`;
  }
  const dSel = new Date(S.dia + "T12:00:00");
  const delDia = porDia[S.dia] || [];
  const pend = visitasFuturas().filter((v) => v.estado === "Pendiente");
  return `
  <div class="cal-cab">
    <button class="btn icono" data-acc="mes" data-d="-1" title="Mes anterior">‹</button>
    <h2>${S.mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</h2>
    <button class="btn icono" data-acc="mes" data-d="1" title="Mes siguiente">›</button>
    <button class="btn peq" data-acc="mes" data-d="0">Hoy</button>
    <div class="derecha"><button class="btn primario" data-acc="nuevaVisita">+ Nueva visita</button></div>
  </div>
  <div class="cal-layout">
    <div class="calendario">
      <div class="cal-dias">${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => `<div>${d}</div>`).join("")}</div>
      <div class="cal-rejilla">${celdas}</div>
    </div>
    <div style="display:grid;gap:1.2rem">
      <section class="caja dia-panel"><h2><span>${fmtDia(dSel)}</span></h2>
        <div class="lista-simple">${delDia.map(itemVisita).join("") || '<p class="vacio">Sin visitas este día</p>'}</div>
        <button class="btn ancho" style="margin-top:.8rem" data-acc="nuevaVisita" data-dia="${S.dia}">+ Visita este día</button>
      </section>
      <section class="caja"><h2>Por confirmar (${pend.length})</h2>
        <div class="lista-simple">${pend.map(itemVisita).join("") || '<p class="vacio">Ninguna pendiente ✓</p>'}</div>
      </section>
    </div>
  </div>`;
}

function modalVisita(v) {
  const ini = new Date(v.inicio);
  const email = linea(v.descripcion, "Email"), tel = linea(v.descripcion, "Teléfono"), nombre = linea(v.descripcion, "Cliente");
  const wa = telWa(tel);
  const sugerida = v.todoElDia ? new Date(ini.getFullYear(), ini.getMonth(), ini.getDate(), 11, 0) : ini;
  const msgConf = `Hola ${nombre},\n\nTe confirmo la visita a ${v.titulo.split(" — ")[0]} el {FECHA}.\n\nSi necesitas cambiarla, responde a este email o escríbeme por WhatsApp.\n\nUn saludo,\nGuillermo\nEvolv Real Estate`;
  abrirModal(`
    <div class="modal-cab"><h2>${esc(v.titulo)}</h2><button class="btn icono" data-acc="cerrarModal">✕</button></div>
    <div class="modal-cuerpo">
      <p style="margin-bottom:1rem"><span class="chip ${clase(v.estado)}">${esc(v.estado)}</span> &nbsp; ${v.todoElDia ? fmtDia(ini) + " (sin hora)" : fmtFechaHora(ini)}</p>
      <div class="acciones" style="margin-bottom:1rem">
        ${wa ? `<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${wa}">WhatsApp</a>` : ""}
        ${tel ? `<a class="btn" href="tel:${esc(tel)}">Llamar</a>` : ""}
        <a class="btn" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/r/day/${ini.getFullYear()}/${ini.getMonth() + 1}/${ini.getDate()}">Abrir en Google Calendar</a>
      </div>
      <dl class="tabla-datos"><dt>Detalles</dt><dd>${esc(v.descripcion || "—")}</dd></dl>
      ${v.estado !== "Cancelada" ? `
      <div class="bloque"><h3>${v.estado === "Confirmada" ? "Cambiar fecha u hora" : "Confirmar visita"}</h3>
        <div class="campos">
          <div><label>Fecha y hora</label><input type="datetime-local" id="v-inicio" value="${aLocalInput(sugerida)}"></div>
          <div><label>Duración</label><select id="v-dur">${[30, 45, 60, 90, 120].map((m) => `<option value="${m}" ${m === 60 ? "selected" : ""}>${m} min</option>`).join("")}</select></div>
          ${email ? `<div class="completo"><label class="interruptor"><input type="checkbox" id="v-avisar" checked> Enviar confirmación por email a ${esc(email)}</label></div>
          <div class="completo"><textarea id="v-msg">${esc(msgConf)}</textarea></div>` : ""}
        </div>
      </div>` : ""}
    </div>
    <div class="modal-pie">
      <button class="btn rojo izq" data-acc="borrarVisita" data-id="${esc(v.id)}">Borrar</button>
      ${v.estado !== "Cancelada" ? `<button class="btn" data-acc="cancelarVisita" data-id="${esc(v.id)}">Cancelar visita</button>
      <button class="btn verde" data-acc="confirmarVisita" data-id="${esc(v.id)}" data-email="${esc(email)}">${v.estado === "Confirmada" ? "Guardar cambios" : "Confirmar visita"}</button>` : ""}
    </div>`);
}

let OPC_VISITA = {};
function modalNuevaVisita(dia) {
  const base = dia ? new Date(dia + "T11:00:00") : new Date(Date.now() + 864e5);
  if (!dia) base.setHours(11, 0, 0, 0);
  const abiertas = (l) => l.filter((p) => p.visible !== false && !["Vendida", "Alquilada"].includes(p.estado));
  const opc = (l, alq) => abiertas(l).map((p) => `<option value="${esc(`${p.nombre} (${p.zona}) · ${euros(p.precio)}${alq ? "/mes" : ""}`)}">${esc(`${p.nombre} (${p.zona}) · ${euros(p.precio)}${alq ? "/mes" : ""}`)}</option>`).join("");
  OPC_VISITA = { Comprar: opc(S.venta, false), Alquilar: opc(S.alquiler, true) };
  for (const k in OPC_VISITA) OPC_VISITA[k] += '<option value="">Otra / aún sin decidir</option>';
  abrirModal(`
    <div class="modal-cab"><h2>Nueva visita</h2><button class="btn icono" data-acc="cerrarModal">✕</button></div>
    <div class="modal-cuerpo"><div class="campos">
      <div><label>Nombre del cliente</label><input type="text" id="n-nombre"></div>
      <div><label>Teléfono</label><input type="tel" id="n-tel"></div>
      <div><label>Email</label><input type="email" id="n-email"></div>
      <div><label>Operación</label><select id="n-op"><option>Comprar</option><option>Alquilar</option></select></div>
      <div><label>Casa</label><select id="n-inm">${OPC_VISITA.Comprar}</select></div>
      <div><label>Fecha y hora</label><input type="datetime-local" id="n-inicio" value="${aLocalInput(base)}"></div>
      <div><label>Duración</label><select id="n-dur">${[30, 45, 60, 90, 120].map((m) => `<option value="${m}" ${m === 60 ? "selected" : ""}>${m} min</option>`).join("")}</select></div>
      <div class="completo"><label>Notas</label><textarea id="n-notas" style="min-height:70px"></textarea></div>
      <div class="completo"><label class="interruptor"><input type="checkbox" id="n-avisar"> Enviar confirmación por email al cliente</label></div>
    </div></div>
    <div class="modal-pie"><button class="btn" data-acc="cerrarModal">Cancelar</button><button class="btn primario" data-acc="crearVisita">Crear visita</button></div>`);
}

/* =========================================================
   CASAS
   ========================================================= */
function vCasas() {
  const lista = S.tab === "venta" ? S.venta : S.alquiler;
  const q = S.buscaCasa.toLowerCase();
  const filtradas = lista.map((p, i) => ({ p, i })).filter(({ p }) => !q || `${p.nombre} ${p.zona} ${p.estado}`.toLowerCase().includes(q));
  const ed = S.casasEditables;
  const activas = lista.filter((p) => p.visible !== false).length;
  return `
  ${ed ? "" : `<div class="aviso-info amarillo">Estás viendo las casas publicadas. Para crear, editar y subir fotos desde aquí, conecta GitHub en <a href="#ajustes"><b>Ajustes</b></a>.</div>`}
  <div class="filtros">
    <button class="filtro ${S.tab === "venta" ? "activo" : ""}" data-acc="tabCasas" data-t="venta">En venta (${S.venta.length})</button>
    <button class="filtro ${S.tab === "alquiler" ? "activo" : ""}" data-acc="tabCasas" data-t="alquiler">En alquiler (${S.alquiler.length})</button>
    <input type="search" id="busca-casa" placeholder="Buscar casa…" value="${esc(S.buscaCasa)}">
  </div>
  <div class="casas-resumen">
    <span><b>${activas}</b> activas en la web · <b>${lista.length - activas}</b> desactivadas</span>
    ${ed && lista.length ? `<span class="acciones">
      ${activas < lista.length ? `<button class="btn peq" data-acc="todasCasas" data-v="1">Activar todas</button>` : ""}
      ${activas ? `<button class="btn peq" data-acc="todasCasas" data-v="0">Desactivar todas</button>` : ""}</span>` : ""}
  </div>
  <div class="casas-rejilla">
    ${ed ? `<div class="casa nueva-casa" data-acc="nuevaCasa">+ Añadir casa</div>` : ""}
    ${filtradas.map(({ p, i }) => `
      <div class="casa" data-acc="editarCasa" data-i="${i}">
        <div class="foto">${p.img ? `<img src="${esc(fotoURL(p.img))}" alt="" loading="lazy">` : ""}
          <span class="chip ${clase(p.estado || "Disponible")}">${esc(p.estado || "Disponible")}</span>
          ${p.destacada ? '<span class="destacada-marca" title="Destacada en la portada">★ Destacada</span>' : ""}
          ${(p.galeria || []).length ? `<span class="n-fotos">${(p.galeria || []).length + 1} fotos</span>` : ""}
          ${p.visible === false ? '<div class="oculta-marca"><span>Desactivada</span><small>No se ve en la web</small></div>' : ""}</div>
        <div class="info"><h3>${esc(p.nombre)}</h3><div class="zona">${esc(p.zona)}</div>
          <div class="linea"><span class="precio">${euros(p.precio)}${S.tab === "alquiler" ? "<small>/mes</small>" : ""}</span>
          </div>${datosCasa(p)}</div>
        ${ed ? `<div class="casa-acc">
          <button class="btn peq ${p.visible === false ? "verde" : ""}" data-acc="toggleCasa" data-i="${i}">${p.visible === false ? "Activar" : "Desactivar"}</button>
          <button class="btn peq" data-acc="editarCasa" data-i="${i}">Editar</button>
          <button class="btn peq rojo" data-acc="eliminarCasa" data-i="${i}">Eliminar</button>
        </div>` : ""}
      </div>`).join("")}
  </div>`;
}

let EDIT = null; // { tipo, i (-1 = nueva), casa, fotos[] }
function modalCasa(tipo, i) {
  const lista = tipo === "venta" ? S.venta : S.alquiler;
  const p = i >= 0 ? JSON.parse(JSON.stringify(lista[i])) : { nombre: "", zona: "", hab: null, banos: null, m2: null, precio: null, img: "", visible: true, estado: "Novedad", descripcion: "", galeria: [], ubicacion: "" };
  EDIT = { tipo, i, casa: p, fotos: [p.img, ...(p.galeria || [])].filter(Boolean) };
  pintarModalCasa();
}
function pintarModalCasa() {
  const { tipo, i, casa: p } = EDIT;
  const ed = S.casasEditables;
  const estados = ["Disponible", "Novedad", "Reservada", tipo === "venta" ? "Vendida" : "Alquilada"];
  const urlWeb = i >= 0 ? urlCasaWeb(tipo, i) : "";
  abrirModal(`
    <div class="modal-cab"><h2>${i >= 0 ? esc(p.nombre) : "Nueva casa en " + tipo}</h2><button class="btn icono" data-acc="cerrarModal">✕</button></div>
    <div class="modal-cuerpo">
      <div class="campos">
        <div><label>Nombre</label><input type="text" id="c-nombre" value="${esc(p.nombre)}" placeholder="Ej.: Chalet con piscina"></div>
        <div><label>Zona</label><input type="text" id="c-zona" value="${esc(p.zona)}" placeholder="Ej.: Los Molinos"></div>
        <div><label>${tipo === "venta" ? "Precio (€)" : "Precio al mes (€)"}</label><input type="number" id="c-precio" value="${p.precio ?? ""}" min="0"></div>
        <div><label>Estado</label><select id="c-estado">${estados.map((e) => `<option ${e === (p.estado || "Disponible") ? "selected" : ""}>${e}</option>`).join("")}</select></div>
        <div><label>Habitaciones</label><input type="number" id="c-hab" value="${p.hab ?? ""}" min="0"></div>
        <div><label>Baños</label><input type="number" id="c-banos" value="${p.banos ?? ""}" min="0"></div>
        <div><label>Metros cuadrados</label><input type="number" id="c-m2" value="${p.m2 ?? ""}" min="0"></div>
        <div><label>Ubicación para el mapa</label><input type="text" id="c-ubic" data-direccion value="${esc(p.ubicacion || "")}" placeholder="Calle o pueblo (opcional)"></div>
        <div class="completo"><label>Descripción</label><textarea id="c-desc" placeholder="Cuenta lo mejor de la casa. Cada párrafo en una línea.">${esc(p.descripcion || "")}</textarea></div>
        <div class="completo"><label class="interruptor"><input type="checkbox" id="c-visible" ${p.visible !== false ? "checked" : ""}> Anuncio activo (se ve en la web)</label></div>
        <div class="completo"><label class="interruptor"><input type="checkbox" id="c-destacada" ${p.destacada ? "checked" : ""}> ★ Destacar en la portada</label>
          <small class="ayuda">Las casas destacadas salen en el carrusel de la página principal. Si no destacas ninguna, salen todas.</small></div>
        <div class="completo"><label>Fotos (la primera es la principal)</label>
          ${ed ? `<small class="ayuda" style="margin:0 0 .6rem">Puedes subir varias a la vez. Ordénalas con ◀ ▶ y elige la principal con ★. Todas salen en la galería de la casa.</small>` : ""}
          <div class="fotos-editor">
            ${EDIT.fotos.map((f, k) => `<div class="foto-item ${k === 0 ? "principal" : ""}"><img src="${esc(fotoURL(f))}" alt="">
              ${k === 0 ? '<span class="marca-p">Principal</span>' : ""}
              ${ed ? `<div class="ctrl">
                <span>${k > 0 ? `<button data-acc="fotoMover" data-k="${k}" data-d="-1">◀</button>` : ""}${k < EDIT.fotos.length - 1 ? `<button data-acc="fotoMover" data-k="${k}" data-d="1">▶</button>` : ""}</span>
                <span>${k > 0 ? `<button data-acc="fotoPrincipal" data-k="${k}">★</button>` : ""}<button data-acc="fotoQuitar" data-k="${k}">✕</button></span>
              </div>` : ""}</div>`).join("")}
            ${ed ? `<label class="subir" for="c-fotos">+ Subir fotos<br><small>JPG o PNG</small></label><input type="file" id="c-fotos" accept="image/*" multiple hidden>` : ""}
          </div>
        </div>
      </div>
    </div>
    <div class="modal-pie">
      ${ed && i >= 0 ? `<button class="btn rojo izq" data-acc="borrarCasa">Eliminar casa</button>` : ""}
      ${urlWeb ? `<a class="btn" href="${urlWeb}" target="_blank" rel="noopener">Ver en la web ↗</a>` : ""}
      ${ed ? `<button class="btn primario" data-acc="guardarCasa">Guardar y publicar</button>` : `<button class="btn" data-acc="cerrarModal">Cerrar</button>`}
    </div>`);
  const inp = $("#c-fotos");
  if (inp) inp.addEventListener("change", subirFotosCasa);
}
function leerFormCasa() {
  const num = (id) => { const v = $(id).value; return v === "" ? null : Number(v); };
  Object.assign(EDIT.casa, {
    nombre: $("#c-nombre").value.trim(), zona: $("#c-zona").value.trim(), precio: num("#c-precio"),
    estado: $("#c-estado").value, hab: num("#c-hab"), banos: num("#c-banos"), m2: num("#c-m2"),
    ubicacion: $("#c-ubic").value.trim(), descripcion: $("#c-desc").value, visible: $("#c-visible").checked, destacada: $("#c-destacada").checked,
  });
}

async function prepararFoto(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}
async function subirFotosCasa(e) {
  const files = [...e.target.files];
  if (!files.length) return;
  leerFormCasa();
  const base = slug(EDIT.casa.nombre + " " + EDIT.casa.zona) || "casa";
  toast(`Subiendo ${files.length} foto(s)…`);
  for (const [n, f] of files.entries()) {
    try {
      const dataUrl = await prepararFoto(f);
      const nombre = `${base}-${Date.now().toString(36)}${n}.jpg`;
      const ruta = await api("subirFoto", { nombre, base64: dataUrl.split(",")[1] });
      S.previews[ruta] = dataUrl;
      EDIT.fotos.push(ruta);
      pintarModalCasa();
    } catch (err) { toast("No se pudo subir " + f.name + ": " + err.message, "error"); }
  }
  toast("Fotos subidas. Recuerda pulsar «Guardar y publicar».", "ok");
}

async function guardarListaCasas(tipo, lista, motivo) {
  const sha = tipo === "venta" ? S.shaV : S.shaA;
  const r = await api("guardarCasas", { tipo, lista, sha, motivo });
  if (tipo === "venta") { S.venta = lista; S.shaV = r.sha; } else { S.alquiler = lista; S.shaA = r.sha; }
}

/* =========================================================
   AJUSTES
   ========================================================= */
function vAjustes() {
  const a = S.ajustes || {};
  const campo = (k, etq, tipo = "text") => `<div><label>${etq}</label><input type="${tipo}" data-aj="${k}" value="${esc(a[k] ?? "")}"></div>`;
  const permiso = window.Notification ? Notification.permission : "no";
  const V = a.valoracion || {};
  return `
  <section class="caja" style="margin-bottom:1.5rem"><h2>Conexión con GitHub ${S.github ? '<span class="chip disponible">Conectado</span>' : '<span class="chip pendiente">Sin conectar</span>'}</h2>
    ${S.github ? `<p>El panel puede crear y editar casas, fotos y ajustes de tu web. Cada cambio se publica solo en 1-2 minutos.</p>` : `
    <div class="aviso-info">Necesitas una <b>clave de GitHub</b> que permita al panel modificar solo el repositorio <b>evolv-web</b>:
      <ol style="margin:.6rem 0 0 1.2rem">
        <li>Abre <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener"><b>Crear clave en GitHub</b></a>.</li>
        <li>Nombre: <b>Panel Evolv</b>. Caducidad: la que prefieras (por ejemplo 1 año).</li>
        <li>Repository access: <b>Only select repositories</b> → <b>evolv-web</b>.</li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b>.</li>
        <li>Pulsa <b>Generate token</b>, copia la clave y pégala aquí abajo.</li>
      </ol></div>
    <div class="campos"><div class="completo"><label>Clave de GitHub</label><input type="password" id="gh-token" placeholder="github_pat_…" autocomplete="off"></div></div>
    <div class="acciones" style="margin-top:.7rem"><button class="btn primario" data-acc="conectarGitHub">Conectar</button></div>`}
  </section>

  ${S.github && S.ajustes ? `
  <section class="caja" style="margin-bottom:1.5rem"><h2>Datos de la web</h2>
    <div class="campos">
      ${campo("nombre", "Nombre de la empresa")}${campo("telefono", "Teléfono", "tel")}
      ${campo("whatsapp", "WhatsApp (con 34 delante, sin +)")}${campo("email", "Email de contacto", "email")}
      ${campo("direccion", "Dirección que se muestra")}${campo("instagram", "Instagram (URL)")}
      ${campo("facebook", "Facebook (URL, vacío para ocultar)")}${campo("linkedin", "LinkedIn (URL, vacío para ocultar)")}
    </div>
    <h2 style="margin-top:1.4rem">Aviso legal</h2>
    <div class="campos">${campo("titular", "Titular")}${campo("nif", "NIF")}<div class="completo">${campo("domicilio", "Domicilio completo")}</div></div>
    <h2 style="margin-top:1.4rem">Fotos de la portada</h2>
    <div class="campos">
      ${["portada", "imagenComprar"].map((k) => `<div><label>${k === "portada" ? "Foto principal" : "Foto sección Comprar"}</label>
        <div class="foto-item" style="max-width:260px"><img src="${esc(fotoURL(a[k]))}" alt=""></div>
        <label class="btn peq" style="margin-top:.4rem;display:inline-flex" for="aj-${k}">Cambiar foto</label><input type="file" id="aj-${k}" data-k="${k}" class="aj-foto" accept="image/*" hidden></div>`).join("")}
    </div>
    <h2 style="margin-top:1.4rem">Fotos del blog</h2>
    <div class="campos">
      ${BLOG.map(([s, t, def]) => `<div><label>${esc(t)}</label>
        <div class="foto-item" style="max-width:260px"><img src="${esc(fotoURL((a.blog || {})[s] || def))}" alt=""></div>
        <label class="btn peq" style="margin-top:.4rem;display:inline-flex" for="aj-blog-${s}">Cambiar foto</label><input type="file" id="aj-blog-${s}" data-k="blog:${s}" class="aj-foto" accept="image/*" hidden>
        <a class="btn peq" style="margin-top:.4rem" href="${WEB}/blog/${s}" target="_blank" rel="noopener">Ver artículo</a></div>`).join("")}
    </div>
    <h2 style="margin-top:1.4rem">Opiniones de clientes <button class="btn peq" data-acc="addTestimonio">+ Añadir</button></h2>
    <div id="testimonios" style="display:grid;gap:.8rem">${(a.testimonios || []).map((t, k) => `
      <div class="campos" style="background:var(--bg);padding:.8rem;border-radius:12px">
        <div class="completo"><label>Opinión</label><textarea data-tt="${k}" data-c="texto" style="min-height:70px">${esc(t.texto)}</textarea></div>
        <div><label>Nombre del cliente</label><input type="text" data-tt="${k}" data-c="autor" value="${esc(t.autor)}"></div>
        <div style="align-self:end"><button class="btn rojo peq" data-acc="quitarTestimonio" data-k="${k}">Quitar</button></div>
      </div>`).join("") || '<p class="vacio">Añade opiniones reales de tus clientes (con su permiso).</p>'}</div>
    <h2 style="margin-top:1.4rem">Valoración automática de viviendas</h2>
    <p style="margin-bottom:.7rem">Cuando un propietario rellena <b>Valorar mi casa</b>, la web calcula una horquilla orientativa con estos precios por m² (ajustada por tipo, estado, tamaño y extras) y se la envía por email. Revísalos de vez en cuando con tu conocimiento de la zona. Si un municipio no está en la lista, no se envía cifra y te llega la solicitud para que la valores tú.</p>
    <div class="campos">
      <div><label class="interruptor"><input type="checkbox" id="val-activa" ${V.activa !== false ? "checked" : ""}> Enviar valoración automática</label></div>
      <div><label>Margen de la horquilla (± %)</label><input type="number" id="val-margen" min="3" max="20" value="${esc(V.margen ?? 8)}"></div>
    </div>
    <div class="tabla-precios">
      <div class="tp-cab"><span>Municipio</span><span>Pisos (€/m²)</span><span>Casas (€/m²)</span><span></span></div>
      ${(V.municipios || []).map((m, k) => `<div class="tp-fila">
        <input type="text" data-vm="${k}" data-c="nombre" value="${esc(m.nombre)}" placeholder="Municipio">
        <input type="number" data-vm="${k}" data-c="piso" value="${esc(m.piso ?? "")}" placeholder="Pisos €/m²">
        <input type="number" data-vm="${k}" data-c="casa" value="${esc(m.casa ?? "")}" placeholder="Casas €/m²">
        <button class="btn rojo peq" data-acc="quitarMunicipio" data-k="${k}">Quitar</button></div>`).join("")}
    </div>
    <div class="acciones" style="margin-top:.6rem"><button class="btn peq" data-acc="addMunicipio">+ Añadir municipio</button></div>
    ${V.fuente ? `<p style="margin-top:.6rem;color:var(--md);font-size:.85rem">Precios de partida: ${esc(V.fuente)}</p>` : ""}
    <div class="acciones" style="margin-top:1.2rem"><button class="btn primario" data-acc="guardarAjustes">Guardar y publicar</button></div>
  </section>` : ""}

  <section class="caja" style="margin-bottom:1.5rem"><h2>Avisos en este dispositivo</h2>
    <p style="margin-bottom:.7rem">Con el panel abierto, te avisa al momento cuando entra un mensaje nuevo. Además siempre te llega el email a evolvrealestate@gmail.com.</p>
    ${permiso === "granted" ? '<span class="chip disponible">Avisos activados</span>' : permiso === "no" ? "<p>Este navegador no admite avisos.</p>" : '<button class="btn" data-acc="activarAvisos">Activar avisos</button>'}
  </section>

  <section class="caja" style="margin-bottom:1.5rem"><h2>Accesos</h2>
    <div class="acciones">
      <a class="btn" href="${WEB}" target="_blank" rel="noopener">Tu web</a>
      <a class="btn" href="${HOJA}" target="_blank" rel="noopener">Hoja de contactos</a>
      <a class="btn" href="https://calendar.google.com" target="_blank" rel="noopener">Google Calendar</a>
      <a class="btn" href="https://github.com/guillern-ux/evolv-web" target="_blank" rel="noopener">GitHub</a>
      <a class="btn" href="https://dash.cloudflare.com" target="_blank" rel="noopener">Cloudflare</a>
    </div>
  </section>

  <section class="caja"><h2>Sesión</h2>
    <p style="margin-bottom:.7rem">Cierra la sesión si has usado el panel en un ordenador que no es tuyo.</p>
    <button class="btn rojo" data-acc="salir">Cerrar sesión</button>
  </section>`;
}
function leerAjustes() {
  const a = S.ajustes;
  $$("[data-aj]").forEach((el) => { a[el.dataset.aj] = el.value.trim(); });
  a.testimonios = a.testimonios || [];
  $$("[data-tt]").forEach((el) => { a.testimonios[Number(el.dataset.tt)][el.dataset.c] = el.value.trim(); });
  a.valoracion = a.valoracion || { activa: true, margen: 8, municipios: [] };
  a.valoracion.municipios = a.valoracion.municipios || [];
  const act = $("#val-activa");
  if (act) { a.valoracion.activa = act.checked; a.valoracion.margen = Number($("#val-margen").value) || 8; }
  $$("[data-vm]").forEach((el) => { const m = a.valoracion.municipios[Number(el.dataset.vm)]; m[el.dataset.c] = el.dataset.c === "nombre" ? el.value.trim() : Number(el.value) || null; });
}

/* =========================================================
   ACCIONES (clics)
   ========================================================= */
const ACC = {
  cerrarModal: () => cerrarModal(),
  salir: async () => { if (await confirmar("Se cerrará el panel en este dispositivo.", "Cerrar sesión")) salir(); },
  nuevaVisita: (b) => modalNuevaVisita(b.dataset.dia),
  nuevaCasa: async () => {
    if (!S.github) { toast("Conecta GitHub en Ajustes para añadir casas", "error"); irA("ajustes"); return; }
    try { if (!S.casasEditables) await cargarCasas(); } catch (e) { return toast(e.message, "error"); }
    if (S.vista !== "casas") { S.vista = "casas"; history.replaceState(null, "", "#casas"); await pintar(); }
    modalCasa(S.tab, -1);
  },

  /* Mensajes */
  filtroMsj: (b) => { S.filtro = b.dataset.f; S.sel = null; pintar(); },
  abrirMensaje: (b) => {
    S.sel = Number(b.dataset.fila);
    if (S.vista !== "mensajes") irA("mensajes"); else pintar();
    $("#avisos").classList.add("oculto");
  },
  guardarNota: (b) => conBoton(b, async () => {
    const fila = Number(b.dataset.fila), nota = $("#nota-msj").value;
    await api("guardarNota", { fila, nota });
    S.mensajes.find((m) => m._fila === fila).Notas = nota;
    toast("Nota guardada", "ok");
  }).catch((e) => toast(e.message, "error")),
  enviarRespuesta: async (b) => {
    const para = $("#r-para").value.trim(), asunto = $("#r-asunto").value.trim(), cuerpo = $("#r-cuerpo").value;
    if (!para) return toast("Falta el email", "error");
    if (!(await confirmar(`Se enviará el email a <b>${esc(para)}</b> con el asunto «${esc(asunto)}».`, "Enviar"))) return;
    const fila = Number(b.dataset.fila);
    try {
      await api("responder", { fila, para, asunto, cuerpo });
      const m = S.mensajes.find((x) => x._fila === fila);
      m.Estado = "Respondido";
      m.Notas = (m.Notas ? m.Notas + "\n" : "") + new Date().toLocaleString("es-ES") + " · Email enviado: " + asunto;
      actualizarInsignias(); pintar();
      toast("Email enviado ✓", "ok");
    } catch (e) { toast(e.message, "error"); }
  },
  irVisitaDe: (b) => {
    const f = b.dataset.fecha;
    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) { S.dia = f; S.mes = new Date(f.slice(0, 4), Number(f.slice(5, 7)) - 1, 1); }
  },

  /* Visitas */
  mes: async (b) => {
    const d = Number(b.dataset.d);
    S.mes = d === 0 ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) : new Date(S.mes.getFullYear(), S.mes.getMonth() + d, 1);
    if (d === 0) S.dia = claveDia(new Date());
    pintar();
    try { await cargarVisitasMes(); pintar(); } catch (e) { toast(e.message, "error"); }
  },
  elegirDia: (b, e) => { if (e.target.closest(".ev")) { /* sigue al día */ } S.dia = b.dataset.dia; pintar(); },
  verVisita: (b) => { const v = S.visitas.find((x) => x.id === b.dataset.id); if (v) { $("#avisos").classList.add("oculto"); modalVisita(v); } },
  confirmarVisita: (b) => conBoton(b, async () => {
    const ini = $("#v-inicio").value;
    if (!ini) throw new Error("Elige fecha y hora");
    const fecha = new Date(ini);
    const avisar = $("#v-avisar")?.checked;
    const mensaje = ($("#v-msg")?.value || "").replace("{FECHA}", fecha.toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }));
    const v = await api("confirmarVisita", { id: b.dataset.id, inicio: fecha.toISOString(), duracion: $("#v-dur").value, avisar, email: b.dataset.email, mensaje });
    S.visitas = S.visitas.map((x) => (x.id === v.id ? v : x));
    cerrarModal(); actualizarInsignias(); pintar();
    toast(avisar ? "Visita confirmada y cliente avisado ✓" : "Visita confirmada ✓", "ok");
  }).catch((e) => toast(e.message, "error")),
  cancelarVisita: async (b) => {
    if (!(await confirmar("La visita quedará marcada como cancelada en tu calendario.", "Cancelar visita", true))) return;
    try {
      const v = await api("cancelarVisita", { id: b.dataset.id });
      S.visitas = S.visitas.map((x) => (x.id === v.id ? v : x));
      actualizarInsignias(); pintar(); toast("Visita cancelada");
    } catch (e) { toast(e.message, "error"); }
  },
  borrarVisita: async (b) => {
    if (!(await confirmar("Se borrará la visita de tu Google Calendar. No se puede deshacer.", "Borrar", true))) return;
    try {
      await api("borrarVisita", { id: b.dataset.id });
      S.visitas = S.visitas.filter((x) => x.id !== b.dataset.id);
      actualizarInsignias(); pintar(); toast("Visita borrada");
    } catch (e) { toast(e.message, "error"); }
  },
  crearVisita: (b) => conBoton(b, async () => {
    const ini = $("#n-inicio").value;
    if (!ini) throw new Error("Elige fecha y hora");
    const fecha = new Date(ini);
    const d = {
      nombre: $("#n-nombre").value.trim(), telefono: $("#n-tel").value.trim(), email: $("#n-email").value.trim(),
      inmueble: [$("#n-op").value, $("#n-inm").value.trim()].filter(Boolean).join(" · "), inicio: fecha.toISOString(), duracion: $("#n-dur").value, notas: $("#n-notas").value,
      avisar: $("#n-avisar").checked,
    };
    if (d.avisar && !d.email) throw new Error("Para avisar al cliente, escribe su email");
    d.mensaje = `Hola ${d.nombre},\n\nTe confirmo la visita a ${$("#n-inm").value.split(" · ")[0] || "nuestro inmueble"} el ${fecha.toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.\n\nUn saludo,\nGuillermo\nEvolv Real Estate`;
    const v = await api("crearVisita", d);
    S.visitas.push(v); S.dia = claveDia(fecha);
    S.mes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    cerrarModal(); irA("visitas"); pintar();
    toast("Visita creada en tu calendario ✓", "ok");
  }).catch((e) => toast(e.message, "error")),

  abrirCasa: async (b) => {
    S.tab = b.dataset.tipo;
    if (S.github && !S.casasEditables) { try { await cargarCasas(); } catch (e) { return toast(e.message, "error"); } }
    const lista = b.dataset.tipo === "venta" ? S.venta : S.alquiler;
    const i = lista.findIndex((p) => p.nombre === b.dataset.nombre && p.zona === b.dataset.zona);
    irA("casas"); await pintar();
    if (i >= 0) modalCasa(b.dataset.tipo, i); else toast("No encuentro esa casa en tu lista", "error");
  },

  /* Casas */
  tabCasas: (b) => { S.tab = b.dataset.t; pintar(); },
  toggleCasa: (b) => conBoton(b, async () => {
    const tipo = S.tab, lista = JSON.parse(JSON.stringify(tipo === "venta" ? S.venta : S.alquiler));
    const c = lista[Number(b.dataset.i)];
    c.visible = c.visible === false;
    await guardarListaCasas(tipo, lista, (c.visible ? "activar " : "desactivar ") + c.nombre);
    pintar(); toast(c.visible ? `«${c.nombre}» activada ✓ Se verá en la web en 1-2 minutos` : `«${c.nombre}» desactivada ✓ Deja de verse en 1-2 minutos`, "ok");
  }).catch((e) => toast(e.message, "error")),
  eliminarCasa: async (b) => {
    const tipo = S.tab, lista = [...(tipo === "venta" ? S.venta : S.alquiler)];
    const i = Number(b.dataset.i), c = lista[i];
    if (!(await confirmar(`Se eliminará <b>${esc(c.nombre)}</b> (${esc(c.zona)}) del panel y de la web. No se puede deshacer.<br><br>Si solo quieres que no se vea, mejor <b>desactívala</b>.`, "Eliminar", true))) return;
    try {
      lista.splice(i, 1);
      await guardarListaCasas(tipo, lista, "eliminar " + c.nombre);
      pintar(); toast("Casa eliminada");
    } catch (e) { toast(e.message, "error"); }
  },
  todasCasas: async (b) => {
    const tipo = S.tab, activar = b.dataset.v === "1";
    const lista = JSON.parse(JSON.stringify(tipo === "venta" ? S.venta : S.alquiler));
    if (!(await confirmar(`Se ${activar ? "activarán" : "desactivarán"} las <b>${lista.length}</b> casas en ${tipo}. ${activar ? "Todas se verán en la web." : "Ninguna se verá en la web, pero no se borra nada."}`, activar ? "Activar todas" : "Desactivar todas"))) return;
    try {
      lista.forEach((c) => { c.visible = activar; });
      await guardarListaCasas(tipo, lista, (activar ? "activar" : "desactivar") + " todas las casas en " + tipo);
      pintar(); toast(activar ? "Todas activadas ✓" : "Todas desactivadas ✓", "ok");
    } catch (e) { toast(e.message, "error"); }
  },
  editarCasa: (b) => modalCasa(S.tab, Number(b.dataset.i)),
  fotoMover: (b) => { leerFormCasa(); const k = Number(b.dataset.k), d = Number(b.dataset.d); const f = EDIT.fotos; [f[k], f[k + d]] = [f[k + d], f[k]]; pintarModalCasa(); },
  fotoPrincipal: (b) => { leerFormCasa(); const k = Number(b.dataset.k); EDIT.fotos.unshift(EDIT.fotos.splice(k, 1)[0]); pintarModalCasa(); },
  fotoQuitar: (b) => { leerFormCasa(); EDIT.fotos.splice(Number(b.dataset.k), 1); pintarModalCasa(); },
  guardarCasa: (b) => conBoton(b, async () => {
    leerFormCasa();
    const c = EDIT.casa;
    if (!c.nombre || !c.zona) throw new Error("Pon al menos nombre y zona");
    if (c.precio == null) throw new Error("Pon el precio");
    c.img = EDIT.fotos[0] || "";
    c.galeria = EDIT.fotos.slice(1);
    const lista = [...(EDIT.tipo === "venta" ? S.venta : S.alquiler)];
    if (EDIT.i >= 0) lista[EDIT.i] = c; else lista.unshift(c);
    await guardarListaCasas(EDIT.tipo, lista, (EDIT.i >= 0 ? "editar " : "añadir ") + c.nombre);
    S.tab = EDIT.tipo; cerrarModal(); pintar();
    toast("Guardado ✓ La web se actualiza en 1-2 minutos", "ok");
  }).catch((e) => toast(e.message, "error")),
  borrarCasa: async () => {
    const { tipo, i, casa } = EDIT;
    if (!(await confirmar(`Se eliminará <b>${esc(casa.nombre)}</b> de la web. Si solo quieres esconderla, desactívala.`, "Eliminar", true))) return;
    try {
      const lista = [...(tipo === "venta" ? S.venta : S.alquiler)];
      lista.splice(i, 1);
      await guardarListaCasas(tipo, lista, "eliminar " + casa.nombre);
      pintar(); toast("Casa eliminada");
    } catch (e) { toast(e.message, "error"); }
  },

  /* Ajustes */
  conectarGitHub: (b) => conBoton(b, async () => {
    const token = $("#gh-token").value.trim();
    if (!token) throw new Error("Pega la clave de GitHub");
    await api("guardarToken", { token });
    S.github = true; S.casasEditables = false; S.ajustes = null;
    toast("GitHub conectado ✓", "ok"); pintar();
  }).catch((e) => toast(e.message, "error")),
  addTestimonio: () => { leerAjustes(); S.ajustes.testimonios.push({ texto: "", autor: "" }); pintar(); },
  quitarTestimonio: (b) => { leerAjustes(); S.ajustes.testimonios.splice(Number(b.dataset.k), 1); pintar(); },
  addMunicipio: () => { leerAjustes(); S.ajustes.valoracion.municipios.push({ nombre: "", piso: null, casa: null }); pintar(); },
  quitarMunicipio: (b) => { leerAjustes(); S.ajustes.valoracion.municipios.splice(Number(b.dataset.k), 1); pintar(); },
  guardarAjustes: (b) => conBoton(b, async () => {
    leerAjustes();
    S.ajustes.testimonios = S.ajustes.testimonios.filter((t) => t.texto);
    S.ajustes.valoracion.municipios = S.ajustes.valoracion.municipios.filter((m) => m.nombre);
    const r = await api("guardarAjustes", { ajustes: S.ajustes, sha: S.shaAj });
    S.shaAj = r.sha;
    toast("Ajustes guardados ✓ La web se actualiza en 1-2 minutos", "ok");
  }).catch((e) => toast(e.message, "error")),
  activarAvisos: async () => { try { await Notification.requestPermission(); } catch (_) {} pintar(); },
};

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-acc]");
  if (b && ACC[b.dataset.acc]) {
    if (b.tagName !== "A") e.preventDefault();
    ACC[b.dataset.acc](b, e);
  }
  if (!e.target.closest("#btn-avisos") && !e.target.closest("#avisos")) $("#avisos").classList.add("oculto");
});
document.addEventListener("change", async (e) => {
  if (e.target.id === "n-op") {
    $("#n-inm").innerHTML = OPC_VISITA[e.target.value] || "";
  }
  if (e.target.id === "estado-msj") {
    const fila = Number(e.target.dataset.fila), estado = e.target.value;
    try {
      await api("cambiarEstado", { fila, estado });
      S.mensajes.find((m) => m._fila === fila).Estado = estado;
      actualizarInsignias(); pintar(); toast("Estado: " + estado, "ok");
    } catch (err) { toast(err.message, "error"); }
  }
  if (e.target.classList.contains("aj-foto") && e.target.files[0]) {
    leerAjustes();
    const k = e.target.dataset.k;
    try {
      toast("Subiendo foto…");
      const dataUrl = await prepararFoto(e.target.files[0]);
      const ruta = await api("subirFoto", { nombre: `${k.replace(":", "-")}-${Date.now().toString(36)}.jpg`, base64: dataUrl.split(",")[1] });
      S.previews[ruta] = dataUrl;
      if (k.startsWith("blog:")) { S.ajustes.blog = S.ajustes.blog || {}; S.ajustes.blog[k.slice(5)] = ruta; } else S.ajustes[k] = ruta;
      pintar();
      toast("Foto subida. Pulsa «Guardar y publicar».", "ok");
    } catch (err) { toast(err.message, "error"); }
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "busca-msj") { S.busca = e.target.value; const pos = e.target.selectionStart; pintar(); const i = $("#busca-msj"); i.focus(); i.setSelectionRange(pos, pos); }
  if (e.target.id === "busca-casa") { S.buscaCasa = e.target.value; const pos = e.target.selectionStart; pintar(); const i = $("#busca-casa"); i.focus(); i.setSelectionRange(pos, pos); }
});
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });
$("#btn-avisos").addEventListener("click", () => { pintarAvisos(); $("#avisos").classList.toggle("oculto"); });
$("#btn-recargar").addEventListener("click", async (e) => {
  await conBoton(e.currentTarget, async () => {
    try { S.casasEditables = false; S.ajustes = null; await cargarTodo(); toast("Actualizado", "ok"); } catch (err) { toast(err.message, "error"); }
  });
});

/* ---------- Arranque ---------- */
async function arrancar() {
  $("#login").classList.add("oculto");
  $("#app").classList.remove("oculto");
  S.vista = (location.hash.slice(1) || "inicio").split("/")[0];
  $("#vista").innerHTML = '<div class="cargando">Cargando tu panel…</div>';
  try { await cargarTodo(); } catch (err) { if (S.clave) $("#vista").innerHTML = `<div class="aviso-info amarillo">No se ha podido cargar: ${esc(err.message)}</div>`; }
  setInterval(() => { if (document.visibilityState === "visible" && S.clave) cargarTodo(true).then(() => { if (!$("#modal").classList.contains("oculto")) return; if (S.vista === "inicio") pintar(); }).catch(() => {}); }, 60000);
}
if (S.clave) arrancar(); else $("#login").classList.remove("oculto");

/* =========================================================
   Lógica común: cabecera, pie, listados y formularios
   ========================================================= */

const ICONOS = {
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7.1.1 5.8.1 4.9.3 4.1.6c-.8.3-1.5.7-2.1 1.4C1.3 2.6.9 3.3.6 4.1.3 4.9.1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.3 2.2.6 2.9.3.8.7 1.5 1.4 2.1.6.7 1.3 1.1 2.1 1.4.8.3 1.6.5 2.9.6 1.2 0 1.6.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.2-.3 2.9-.6.8-.3 1.5-.7 2.1-1.4.7-.6 1.1-1.3 1.4-2.1.3-.8.5-1.6.6-2.9 0-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.2-.6-2.9-.3-.8-.7-1.5-1.4-2.1C21.4 1.3 20.7.9 19.9.6 19.1.3 18.2.1 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7A11.8 11.8 0 0 0 24 12c0-3.2-1.2-6.2-3.5-8.5z"/></svg>',
};

/* ---------- Cabecera ---------- */
function pintarCabecera() {
  const actual = location.pathname.split("/").pop() || "index.html";
  const enlaces = [
    ["comprar.html", "Comprar"],
    ["alquilar.html", "Alquilar"],
    ["vender.html", "Vender"],
    ["valorar.html", "Valorar mi casa"],
  ];
  const html = `
  <header class="cabecera">
    <div class="contenedor">
      <a href="index.html" class="logo" aria-label="Evolv Real Estate, inicio"><svg class="logo-svg" viewBox="0 0 668 190" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M366.5 120.2 365.0 122.5 365.0 145.2 365.5 146.2 367.8 147.8 386.5 147.8 388.0 147.0 389.5 144.5 389.5 123.0 388.8 121.2 386.5 119.8 367.8 119.8ZM509.8 51.8 513.0 61.8 561.0 188.2 561.5 188.8 615.5 188.8 666.8 54.8 667.8 53.5 667.8 51.5 617.2 51.8 592.8 135.2 592.0 136.8 591.0 137.2 590.0 136.8 564.8 51.8ZM303.9 116.4a73.4 73.4 0 1 0 146.8 0a73.4 73.4 0 1 0 -146.8 0ZM374.5 69.0 379.2 68.8 381.2 69.8 421.0 109.5 421.8 111.2 422.0 114.5 421.5 116.2 419.0 119.2 416.0 120.5 412.2 120.5 412.0 150.8 410.2 154.0 405.5 157.8 403.2 158.2 351.0 158.2 347.2 157.0 344.0 154.0 343.0 152.2 342.0 148.2 342.0 120.2 337.5 120.2 333.8 117.8 332.2 114.8 332.8 110.5 371.8 71.0ZM0.0 10.0 0.0 188.8 156.0 188.8 156.5 188.0 156.2 146.2 57.8 146.0 57.0 145.2 57.0 119.5 58.5 118.5 139.2 118.8 140.5 118.0 140.2 77.8 57.8 77.5 57.0 76.2 57.0 53.5 57.8 52.8 153.2 53.0 204.8 188.5 258.8 188.8 259.5 188.2 309.8 57.0 311.2 51.8 261.2 51.5 260.5 52.2 236.0 136.0 235.2 137.0 234.0 137.0 233.2 136.2 208.8 52.2 207.5 51.5 155.2 51.5 154.5 50.5 154.2 10.0ZM456.0 0.0 455.8 188.5 507.0 188.8 507.5 188.2 507.5 1.5 507.0 0.0Z"/></svg><span>Real Estate</span></a>
      <button class="hamburguesa" aria-label="Abrir menú"><span></span><span></span><span></span></button>
      <ul class="menu">
        ${enlaces.map(([h, t]) => `<li><a href="${h}" class="${actual.startsWith(h.replace(".html","")) ? "activo" : ""}">${t}</a></li>`).join("")}
        <li><a href="reservar.html" class="boton">Reservar visita</a></li>
      </ul>
    </div>
  </header>`;
  document.body.insertAdjacentHTML("afterbegin", html);
  const btn = document.querySelector(".hamburguesa");
  const menu = document.querySelector(".menu");
  btn.addEventListener("click", () => menu.classList.toggle("abierto"));
}

/* ---------- Pie ---------- */
function pintarPie() {
  const redes = ["instagram", "facebook", "linkedin"]
    .filter((r) => CONFIG[r])
    .map((r) => `<a href="${CONFIG[r]}" target="_blank" rel="noopener" aria-label="${r}">${ICONOS[r]}</a>`)
    .join("");
  const html = `
  <footer class="pie" id="contacto">
    <div class="contenedor">
      <div class="pie-rejilla">
        <div>
          <h4>Enlaces</h4>
          <ul>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="comprar.html">Comprar</a></li>
            <li><a href="alquilar.html">Alquilar</a></li>
            <li><a href="vender.html">Vender</a></li>
            <li><a href="valorar.html">Valorar mi casa</a></li>
            <li><a href="reservar.html">Reserva online</a></li>
            <li><a href="privacidad.html">Política de Privacidad</a></li>
            <li><a href="aviso-legal.html">Aviso legal</a></li>
          </ul>
        </div>
        <div>
          <h4>Email / Llamada</h4>
          <ul>
            <li>Tel: <a href="tel:${CONFIG.telefono.replace(/\s/g, "")}">${CONFIG.telefono}</a></li>
            <li>Email: <a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
            <li>Dirección: ${CONFIG.direccion}</li>
          </ul>
          <div class="redes">${redes}<a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONOS.whatsapp}</a></div>
        </div>
        <div>
          <h4>Déjame un mensaje</h4>
          <div class="aviso-ok">¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.</div>
          <form class="formulario" data-asunto="Nuevo mensaje desde la web">
            <div><label for="p-nombre">Nombre</label><input id="p-nombre" name="Nombre" required></div>
            <div><label for="p-apellido">Apellido</label><input id="p-apellido" name="Apellido"></div>
            <div><label for="p-email">Email</label><input id="p-email" type="email" name="email" required></div>
            <div><label for="p-tel">Teléfono</label><input id="p-tel" type="tel" name="Teléfono"></div>
            <div class="completo"><label for="p-msg">Mensaje</label><textarea id="p-msg" name="Mensaje" placeholder="Escribe tu mensaje aquí" required></textarea></div>
            <p class="legal completo"><label style="display:flex;gap:.5rem;font-weight:400"><input type="checkbox" required style="width:auto"> He leído y acepto la <a href="privacidad.html">política de privacidad</a>.</label></p>
            <button class="boton claro" type="submit">Enviar</button>
          </form>
        </div>
      </div>
      <div class="copy"><span>© ${new Date().getFullYear()} ${CONFIG.nombre}</span><span>Agencia inmobiliaria en la Sierra de Madrid</span></div>
    </div>
  </footer>
  <a class="whatsapp" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${ICONOS.whatsapp}</a>`;
  document.body.insertAdjacentHTML("beforeend", html);
}

/* ---------- Listado de propiedades ---------- */
const euros = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";

/* ---------- Iconos y tarjeta de casa (listados, portada y ficha) ---------- */
const ICO = {
  cama: '<path d="M7 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4z"/>',
  bano: '<path d="M21 13H6V5.5a1.5 1.5 0 0 1 3 0V6H7v2h5V6h-1v-.5a3.5 3.5 0 0 0-7 0V13H3v2h1v1a4 4 0 0 0 2 3.46V22h2v-2h8v2h2v-2.54A4 4 0 0 0 20 16v-1h1z"/>',
  m2: '<path d="M3 3h7v2H5v5H3zm11 0h7v7h-2V5h-5zM3 14h2v5h5v2H3zm16 0h2v7h-7v-2h5z"/>',
  pin: '<path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>',
  camara: '<path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
  rejilla: '<path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>',
};
const icono = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;
function datosCasa(p, clase = "tc-datos") {
  const d = [];
  if (p.hab != null && p.hab !== "") d.push(`<li>${icono("cama")}<span><b>${p.hab}</b> ${Number(p.hab) === 1 ? "habitación" : "habitaciones"}</span></li>`);
  if (p.banos != null && p.banos !== "") d.push(`<li>${icono("bano")}<span><b>${p.banos}</b> ${Number(p.banos) === 1 ? "baño" : "baños"}</span></li>`);
  if (p.m2 != null && p.m2 !== "") d.push(`<li>${icono("m2")}<span><b>${p.m2}</b> m²</span></li>`);
  return d.length ? `<ul class="${clase}">${d.join("")}</ul>` : "";
}
function tarjetaCasa(p, alq, anim = true) {
  const url = `casa.html?tipo=${p.tipo}&id=${p.id}`;
  const n = (p.fotos || []).length;
  return `<article class="tarjeta tc${anim ? " aparecer" : ""}">
    <div class="tc-foto">
      <img src="${esc(p.img)}" alt="${esc(p.nombre)} en ${esc(p.zona)}" loading="lazy">
      ${p.estado !== "Disponible" ? `<span class="etiqueta etiqueta-${slug(p.estado)}">${esc(p.estado)}</span>` : ""}
      ${n > 1 ? `<span class="tc-nfotos">${icono("camara")}${n}</span>` : ""}
    </div>
    <div class="tc-cuerpo">
      <p class="tc-precio">${euros(p.precio)}${alq ? "<small>/mes</small>" : ""}</p>
      <h3 class="tc-nombre"><a href="${url}">${esc(p.nombre)}</a></h3>
      <p class="tc-zona">${icono("pin")}${esc(p.zona)}</p>
      ${datosCasa(p)}
    </div>
  </article>`;
}

function pintarListado(lista, contenedorId, esAlquiler = false) {
  const cont = document.getElementById(contenedorId);
  if (!cont) return;
  const selZona = document.getElementById("filtro-zona");
  const selHab = document.getElementById("filtro-hab");
  const selOrden = document.getElementById("filtro-orden");

  // Rellenar zonas automáticamente
  [...new Set(lista.map((p) => p.zona))].forEach((z) => selZona.insertAdjacentHTML("beforeend", `<option>${z}</option>`));

  // Filtros que llegan desde el buscador de la portada (?zona=…&hab=…)
  const qs = new URLSearchParams(location.search);
  if (qs.get("zona")) selZona.value = qs.get("zona");
  const h = qs.get("hab");
  if (h && /^\d+$/.test(h)) {
    if (![...selHab.options].some((o) => o.value === h)) selHab.insertAdjacentHTML("beforeend", `<option value="${h}">${h}+</option>`);
    selHab.value = h;
  }

  function render() {
    let res = lista.filter(
      (p) => (!selZona.value || p.zona === selZona.value) && (!selHab.value || p.hab >= +selHab.value)
    );
    if (selOrden.value === "asc") res = [...res].sort((a, b) => a.precio - b.precio);
    if (selOrden.value === "desc") res = [...res].sort((a, b) => b.precio - a.precio);
    res = [...res].sort((a, b) => (a.estado === "Vendida" || a.estado === "Alquilada") - (b.estado === "Vendida" || b.estado === "Alquilada"));

    cont.innerHTML = res.length
      ? res.map((p) => tarjetaCasa(p, esAlquiler)).join("")
      : `<p class="vacio">No hay inmuebles con esos filtros.</p>`;
    observarAparicion();
  }
  [selZona, selHab, selOrden].forEach((s) => s.addEventListener("change", render));
  render();
}

/* ---------- Envío de formularios (FormSubmit, sin servidor) ---------- */
function activarFormularios() {
  document.querySelectorAll("form.formulario").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const boton = form.querySelector('[type="submit"]');
      const textoOriginal = boton.textContent;
      boton.disabled = true;
      boton.textContent = "Enviando…";
      const datos = new FormData(form);
      const asunto = form.dataset.asunto || "Nuevo mensaje desde la web";
      try {
        if (CONFIG.formularioUrl) {
          // Google Sheets (Apps Script): guarda la fila y te avisa por email
          const cuerpo = new URLSearchParams();
          cuerpo.append("Formulario", asunto);
          cuerpo.append("Página", location.pathname);
          for (const [k, v] of datos.entries()) cuerpo.append(k.replace("[]", ""), v);
          await fetch(CONFIG.formularioUrl, { method: "POST", mode: "no-cors", body: cuerpo });
        } else {
          // Alternativa sin configurar: FormSubmit (solo email)
          datos.append("_subject", asunto);
          datos.append("_template", "table");
          datos.append("_captcha", "false");
          const r = await fetch(`https://formsubmit.co/ajax/${CONFIG.email}`, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: datos,
          });
          if (!r.ok) throw new Error();
        }
        form.reset();
        const aviso = form.parentElement.querySelector(".aviso-ok");
        if (aviso) aviso.classList.add("visible");
        boton.textContent = "Enviado ✓";
      } catch {
        alertaFallo(form);
        boton.textContent = textoOriginal;
        boton.disabled = false;
      }
    });
  });
}
function alertaFallo(form) {
  let p = form.querySelector(".error-envio");
  if (!p) {
    p = document.createElement("p");
    p.className = "legal completo error-envio";
    form.appendChild(p);
  }
  p.innerHTML = `No se ha podido enviar. Escríbenos a <a href="mailto:${CONFIG.email}">${CONFIG.email}</a> o por <a href="https://wa.me/${CONFIG.whatsapp}">WhatsApp</a>.`;
}

/* ---------- Animación al hacer scroll ---------- */
let observador;
function observarAparicion() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".aparecer").forEach((el) => el.classList.add("visible"));
    return;
  }
  observador ??= new IntersectionObserver(
    (entradas) => entradas.forEach((en) => en.isIntersecting && (en.target.classList.add("visible"), observador.unobserve(en.target))),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".aparecer:not(.visible)").forEach((el) => observador.observe(el));
}

/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  listo.then(() => {
    pintarCabecera();
    pintarPie();
    activarFormularios();
    observarAparicion();
  });
});

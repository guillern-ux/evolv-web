/* Blog: pone las fotos elegidas en el panel (Ajustes → Fotos del blog).
   Si no se ha cambiado ninguna, se sirve la página tal cual. */
const WEB = "https://evolvrealestate.com";

export async function onRequest({ request, env, next }) {
  const res = await next();
  if (res.status !== 200 || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  let fotos = {};
  try {
    const aj = await env.ASSETS.fetch(new URL("/data/ajustes.json", request.url));
    fotos = (await aj.json()).blog || {};
  } catch (_) { return res; }
  if (!Object.keys(fotos).length) return res;
  const abs = (p) => (p.startsWith("http") ? p : WEB + p);
  return new HTMLRewriter().on("[data-blog]", {
    element(el) {
      const f = fotos[el.getAttribute("data-blog")];
      if (!f) return;
      if (el.tagName === "meta") el.setAttribute("content", abs(f));
      else el.setAttribute("src", f);
    },
  }).transform(res);
}

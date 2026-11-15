# Evolv Real Estate — web

Web estática (HTML + CSS + JavaScript, sin dependencias) de Evolv Real Estate.
Se publica gratis con **GitHub** + **Cloudflare Pages** y el dominio de **IONOS**.

## Estructura

```
index.html        Portada
comprar.html      Viviendas en venta (con filtros)
alquilar.html     Viviendas en alquiler (con filtros)
vender.html       Formulario para propietarios
reservar.html     Solicitud de visita
privacidad.html   Política de privacidad
404.html          Página de error
css/styles.css    Todo el diseño (colores arriba del todo, en :root)
js/datos.js       ⭐ Teléfono, email, redes, imágenes y LISTADO DE CASAS
js/main.js        Cabecera, pie, filtros y envío de formularios
img/              Tus imágenes
_redirects        Redirige las URLs antiguas de Wix
```

## Cambios habituales

- **Añadir/quitar una casa:** edita `js/datos.js` y copia una línea de `VENTA` o `ALQUILER`.
- **Cambiar teléfono, email o redes:** bloque `CONFIG` en `js/datos.js`.
- **Cambiar colores:** variables al principio de `css/styles.css`.
- **Imágenes:** ahora se cargan desde Wix. Descárgalas, guárdalas en `img/` y cambia la ruta en `js/datos.js` (ej. `"img/chalet-molinos.jpg"`). Hazlo antes de cerrar Wix.

## Formularios

Los formularios llegan a `evolvrealestate@gmail.com` mediante [FormSubmit](https://formsubmit.co) (gratis, sin servidor).
**La primera vez** que alguien envíe un formulario, FormSubmit te mandará un email para activarlo: pulsa el botón de confirmar y listo.

## Publicar (una sola vez)

1. **GitHub:** crea un repositorio nuevo (ej. `evolv-web`) y sube todos estos archivos.
2. **Cloudflare:** Workers & Pages → Create → Pages → *Connect to Git* → elige el repositorio.
   - Framework preset: **None** · Build command: *(vacío)* · Output directory: **/**
3. Te dará una dirección tipo `evolv-web.pages.dev`. Comprueba que todo funciona.
4. **Dominio de IONOS:**
   - En Cloudflare: *Add a site* → escribe tu dominio → plan Free. Te dará 2 *nameservers*.
   - En IONOS: Dominios → tu dominio → *Nameservers* → usar nameservers personalizados → pega los 2 de Cloudflare.
   - Vuelve a tu proyecto de Pages → *Custom domains* → añade `tudominio.es` y `www.tudominio.es`.
   - La propagación tarda de minutos a 24 h.

A partir de ahí, cada cambio que subas a GitHub se publica solo en 1 minuto.

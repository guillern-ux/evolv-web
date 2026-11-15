# Evolv Real Estate — evolvrealestate.com

Web estática (HTML + CSS + JS) publicada con **GitHub → Cloudflare Pages**. Cada cambio en este repositorio se publica solo en ~1 minuto.

## Gestionar casas (sin código)
Entra en **https://app.pagescms.org** con tu GitHub → proyecto `evolv-web`:
- **Casas en venta / Casas en alquiler**: añadir, editar, ocultar ("Mostrar en la web") o borrar casas y subir fotos.
- **Ajustes de la web**: teléfono, email, WhatsApp, redes, fotos de portada y opiniones de clientes.
Al pulsar **Save**, la web se actualiza sola.

## Formularios
Todos los formularios (contacto, vender, reservar visita) se guardan en la hoja de Google
**"Contactos web Evolv"** y te llega un aviso por email a evolvrealestate@gmail.com.
Script: proyecto de Apps Script "Formularios web Evolv" en tu cuenta de Google.

## Estructura
```
data/venta.json, data/alquiler.json, data/ajustes.json   ← contenido (lo edita el panel)
img/                                                      ← fotos
index.html, comprar.html, alquilar.html, vender.html, reservar.html, privacidad.html, 404.html
css/styles.css   js/datos.js (carga datos)   js/main.js (cabecera, pie, listados, formularios)
.pages.yml       ← configuración del panel Pages CMS
_redirects       ← redirecciones de las URLs antiguas de Wix
```
Si cambias `js/` o `css/`, sube el número `?v=` en las etiquetas `<script>`/`<link>` de los HTML para que los navegadores cojan la versión nueva.

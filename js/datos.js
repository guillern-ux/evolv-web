/* =========================================================
   DATOS DE LA WEB — edita aquí sin tocar el resto del código
   ========================================================= */

const CONFIG = {
  nombre: "Evolv Real Estate",
  telefono: "+34 627 05 76 68",
  whatsapp: "34627057668",            // sin + ni espacios
  email: "evolvrealestate@gmail.com",
  direccion: "28460 Los Molinos, Madrid",
  instagram: "https://www.instagram.com/evolvhome",
  facebook: "",                        // pon la URL o déjalo vacío para ocultarlo
  linkedin: "",
};

/* Imágenes generales.
   Ahora apuntan a las de tu web de Wix. Lo ideal es descargarlas,
   meterlas en la carpeta /img y cambiar la ruta, p. ej. "img/portada.jpg" */
const W = "https://static.wixstatic.com/media/";
const IMAGENES = {
  portada: W + "306168_9a96681284154629bec61c074b0c0506~mv2.jpg",
  comprar: W + "306168_9eadf1490f2840b0a8d3644e308648eb~mv2.jpg",
};

/* Propiedades en VENTA */
const VENTA = [
  { nombre: "Chalet",            zona: "Los Molinos", hab: 5, banos: 3, m2: 450, precio: 515000,  img: W + "306168_3939257d2f534a058fc9f6598f97868a~mv2.png" },
  { nombre: "Plaza Loreto",      zona: "Zona Centro", hab: 6, banos: 3, m2: 520, precio: 1290050, img: W + "306168_92fd3b77ccbb4799908f9638a394ca48~mv2.jpg" },
  { nombre: "Plaza Dolores",     zona: "Zona Centro", hab: 6, banos: 4, m2: 670, precio: 3450000, img: W + "306168_1b5263b1b4d04b958675ee7421966106~mv2.jpg" },
  { nombre: "La Perla",          zona: "Zona Centro", hab: 5, banos: 5, m2: 440, precio: 3325500, img: W + "306168_c8e7150b16f14d8595c55344f05f2cb3~mv2.jpeg" },
  { nombre: "Centro Colón",      zona: "Zona Centro", hab: 5, banos: 4, m2: 450, precio: 5555000, img: W + "306168_6500f8e5a2c8410e800952fe939b7cd8~mv2.jpg" },
  { nombre: "Edificio SASS",     zona: "Zona Centro", hab: 3, banos: 2, m2: 800, precio: 4450000, img: W + "306168_1937c61298c44829975129259a7fc6a6~mv2.jpg" },
  { nombre: "Edificio Banquero", zona: "Zona Centro", hab: 7, banos: 2, m2: 780, precio: 3325500, img: W + "306168_f93fdbec54894c679fa4c0c7f33b9bf9~mv2.jpg" },
];

/* Propiedades en ALQUILER (precio al mes) */
const ALQUILER = [
  { nombre: "Plaza Barbeto",  zona: "Zona Centro", hab: 6, banos: 2, m2: 600, precio: 1200, img: W + "306168_1b5263b1b4d04b958675ee7421966106~mv2.jpg" },
  { nombre: "Centro Magno",   zona: "Zona Centro", hab: 5, banos: 5, m2: 470, precio: 1520, img: W + "306168_c8e7150b16f14d8595c55344f05f2cb3~mv2.jpeg" },
  { nombre: "Edificio Gambo", zona: "Zona Centro", hab: 6, banos: 6, m2: 590, precio: 7500, img: W + "306168_6500f8e5a2c8410e800952fe939b7cd8~mv2.jpg" },
  { nombre: "Chalet",         zona: "Luz Sierra",  hab: 4, banos: 3, m2: 425, precio: 2500, img: W + "306168_f93fdbec54894c679fa4c0c7f33b9bf9~mv2.jpg" },
  { nombre: "Plaza Franco",   zona: "Zona Centro", hab: 6, banos: 1, m2: 610, precio: 1890, img: W + "306168_92fd3b77ccbb4799908f9638a394ca48~mv2.jpg" },
];

/* Opiniones de clientes que salen en la portada.
   ⚠️ Pon aquí opiniones REALES de tus clientes (con su permiso).
   Si la lista está vacía, la sección se oculta sola. */
const TESTIMONIOS = [
  // { texto: "Lo que te dijo el cliente…", autor: "Nombre del cliente" },
];

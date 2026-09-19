/**
 * Contenido estático de la invitación (textos, fechas, fotos, cuentas).
 * Reconstruido a partir de la producción (bundle AppRoutes-DBE344fO.js) para
 * mantener fidelidad con el sitio publicado en casamiento-vanesa-augusto.vercel.app.
 */

export type ItinerarioItem = {
  hora: string
  titulo: string
  imagen: string
  imagenAlt: string
}

export type TipItem = {
  titulo: string
  texto: string | string[]
  lista?: string[]
}

export type CuentaRegaloInfo = {
  moneda: string
  alias: string
  cbu: string
  cuenta: string
}

export const CASAMIENTO = {
  sobreFotos: [
    '/sobre/01.jpg',
    '/sobre/02.jpg',
    '/sobre/03.jpg',
    '/sobre/04.jpg',
    '/sobre/05.jpg',
    '/sobre/06.jpg',
    '/sobre/07.jpg',
    '/sobre/08.jpg',
    '/sobre/09.jpg',
  ],
  titulo: 'Casamiento Vanesa y Augusto',
  novios: 'Vanesa y Augusto',
  fechaLabel: '19 DE DICIEMBRE DE 2026',
  fechaIso: '2026-12-19T00:00:00',

  historia: {
    fotos: ['/sobre/02.jpg', '/sobre/04.jpg', '/historia/fontana.jpg?v=2', '/sobre/08.jpg'],
    parrafos: [
      'Nos conocimos hace 10 años, un Diciembre, sin imaginar todo lo que íbamos a vivir juntos. Desde entonces compartimos mudanzas, viajes, aventuras, risas y también momentos que nos enseñaron, una y otra vez, a acompañarnos y elegirnos. Con el tiempo, entre complicidad, desafíos y sueños compartidos, fuimos construyendo nuestra propia manera de estar juntos',
      'Hoy sabemos que nuestro lugar favorito es ese lugar que construimos cuando estamos juntos. Un hogar que empezó siendo de dos y hoy compartimos con Madison. Después de tantos años, tantas historias y tanto recorrido, queremos celebrar que seguimos caminando en la misma dirección y que junto a ustedes todavía nos queda muchísimo por vivir',
    ],
  },

  itinerario: {
    items: [
      {
        hora: '11:45 hs',
        titulo: 'Ceremonia religiosa',
        imagen: '/itinerario/ceremonia.png?v=2',
        imagenAlt: 'Anillo en estuche — ceremonia',
      },
      {
        hora: '13:30 hs',
        titulo: 'Recepción',
        imagen: '/itinerario/recepcion.png?v=2',
        imagenAlt: 'Copas en brindis — recepción',
      },
      {
        hora: '15:30 hs',
        titulo: 'Fiesta',
        imagen: '/itinerario/fiesta.png?v=2',
        imagenAlt: 'Serpentinas — fiesta',
      },
    ] as ItinerarioItem[],
  },

  iglesia: {
    horario: '11:45 HS',
    lugar: 'Parroquia Nuestra Señora de Guadalupe',
    direccion: 'Paraguay 3901, Palermo, CABA',
    /** Basílica del Espíritu Santo — misma parroquia, pin correcto en Google Maps. */
    mapsQuery: 'Basílica del Espíritu Santo, Paraguay 3901, Palermo, CABA',
    calendar: {
      title: 'Ceremonia — Vanesa y Augusto',
      start: '20261219T114500',
      end: '20261219T130000',
      timezone: 'America/Argentina/Buenos_Aires',
      location: 'Parroquia Nuestra Señora de Guadalupe, Paraguay 3901, Palermo, CABA',
      details: 'Ceremonia religiosa del casamiento de Vanesa y Augusto',
    },
  },

  fiesta: {
    horario: '13:30 HS',
    lugar: 'Milión',
    direccion: 'Parana 1048, Recoleta, CABA',
    mapsQuery: 'Parana 1048, Recoleta, CABA',
    fotos: ['/millon/d.jpg', '/millon/h.jpg', '/millon/j.jpg', '/millon/l.jpg'],
    calendar: {
      title: 'Fiesta — Vanesa y Augusto',
      start: '20261219T133000',
      end: '20261219T230000',
      timezone: 'America/Argentina/Buenos_Aires',
      location: 'Milión, Parana 1048, Recoleta, CABA',
      details: 'Celebración del casamiento de Vanesa y Augusto en Milión',
    },
  },

  vestimenta: {
    elegante: 'Elegante',
    notaNovia: 'Reservamos el color blanco para la novia',
    hombreAlt: 'Silueta de traje formal',
    mujerAlt: 'Silueta de vestido de fiesta',
  },

  tips: {
    items: [
      {
        titulo: 'Solo Adultos',
        texto: [
          'Queremos que ese día solo tengan que preocuparse por pasarla increíble',
          'El evento es exclusivo para adultos',
        ],
      },
      {
        titulo: 'Estacionamiento',
        texto: [
          'Milión no cuenta con estacionamiento propio',
          'Sin embargo, la casa está rodeada de múltiples opciones a pocos pasos:',
        ],
        lista: [
          'Marcelo T. de Alvear 1460',
          'Uruguay 1064',
          'Marcelo T. de Alvear 1566',
          'Av. Santa Fe 1536',
        ],
      },
      {
        titulo: 'Menú especial',
        texto: 'Contanos si tenés alguna restricción alimentaria al confirmar tu asistencia',
      },
    ] as TipItem[],
  },

  rsvp: {
    mensaje:
      'Te esperamos para disfrutar un gran momento y ser parte de este nuevo capítulo de nuestras vidas',
    pregunta: '¿Nos acompañas?',
    plazo: 'Confirmar antes del 19 de Noviembre de 2026',
    restriccionesContacto: 'Contactate con nosotros',
    restriccionesWhatsapp: {
      /** Número internacional sin + (Argentina). */
      telefono: '541152201025',
      mensaje:
        'Hola, queria informar que tengo restriccion alimentaria para el casamiento de Vanesa y Augusto',
      boton: 'WhatsApp',
    },
  },

  albumColaborativo: {
    titulo: 'Compartí tus fotos y videos',
    descripcion:
      'Hemos creado una carpeta compartida para que todos los invitados puedan subir las fotos y videos que tomen del gran día',
    nota: 'Porque no queremos perdernos ningún momento',
    boton: 'Subí tu foto o video',
    /** URL de carpeta compartida externa (si está vacía, se usa el upload propio). */
    url: '',
  },

  regalos: {
    detalle:
      'Lo más importante es compartir este día con ustedes si desean hacernos un regalo, pueden depositar en:',
    cuentas: [
      {
        moneda: 'Pesos',
        alias: 'augustoyvanesa',
        cbu: '3840200500000039415943',
        cuenta: '38402000003941594',
      },
      {
        moneda: 'Dólares',
        alias: 'augustoyvanesausd',
        cbu: '3840200500000039416328',
        cuenta: '38402000003941632',
      },
    ] as CuentaRegaloInfo[],
  },

  qr: {
    titulo: 'QR para transferir',
    detalle: 'Escaneá con tu app bancaria o billetera — también podés usar el alias de arriba',
    url: 'augustoyvanesa',
  },
}

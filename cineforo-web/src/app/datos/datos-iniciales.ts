import { Categoria, Comentario, Sancion, Tema, Usuario } from '../modelos/modelos';

/**
 * Datos de ejemplo del FrontEnd, guardados en arreglos (listas) de Angular.
 * Son los mismos que cargan los scripts SQL de Oracle para los microservicios.
 * Clave de todos los usuarios de ejemplo: Cine2026!
 */
const CLAVE = 'Cine2026!';

export const USUARIOS_INICIALES: Usuario[] = [
  { id: 1, nombreUsuario: 'admin_cineforo', email: 'admin@cineforo.cl', password: CLAVE, rol: 'ADMINISTRADOR', activo: true, fechaRegistro: '2026-11-02' },
  { id: 2, nombreUsuario: 'ana_moderadora', email: 'ana@cineforo.cl', password: CLAVE, rol: 'MODERADOR', activo: true, fechaRegistro: '2026-11-02' },
  { id: 3, nombreUsuario: 'juan_cinefilo', email: 'juan@cineforo.cl', password: CLAVE, rol: 'USUARIO', activo: true, fechaRegistro: '2026-11-02', generoFavorito: 'Ciencia ficción' },
  { id: 4, nombreUsuario: 'maria_series', email: 'maria@cineforo.cl', password: CLAVE, rol: 'USUARIO', activo: true, fechaRegistro: '2026-11-02', generoFavorito: 'Drama' },
  { id: 5, nombreUsuario: 'pedro_anime', email: 'pedro@cineforo.cl', password: CLAVE, rol: 'USUARIO', activo: true, fechaRegistro: '2026-11-02', generoFavorito: 'Animación' },
  { id: 6, nombreUsuario: 'camila_resenas', email: 'camila@cineforo.cl', password: CLAVE, rol: 'USUARIO', activo: true, fechaRegistro: '2026-11-02', generoFavorito: 'Thriller' },
];

export const CATEGORIAS_INICIALES: Categoria[] = [
  { id: 1, nombre: 'Estrenos', descripcion: 'Películas en cartelera y próximos lanzamientos', icono: 'bi-film' },
  { id: 2, nombre: 'Series', descripcion: 'Conversación sobre series, temporadas y plataformas de streaming', icono: 'bi-tv' },
  { id: 3, nombre: 'Animación y Anime', descripcion: 'Películas animadas, anime y series animadas', icono: 'bi-stars' },
  { id: 4, nombre: 'Reseñas', descripcion: 'Críticas y recomendaciones escritas por la comunidad', icono: 'bi-pencil-square' },
  { id: 5, nombre: 'Teorías y Spoilers', descripcion: 'Análisis de finales y teorías. ¡Atención: contiene spoilers!', icono: 'bi-lightbulb' },
];

export const TEMAS_INICIALES: Tema[] = [
  { id: 1, titulo: '¿Qué película esperan más para el próximo año?', contenido: 'Abro el tema para armar una lista de los estrenos más esperados. ¿Cuál es el suyo y por qué?', categoriaId: 1, autorId: 3, fecha: '2026-11-02T11:30:00', estado: 'ACTIVO', spoiler: false },
  { id: 2, titulo: '¿Vale la pena ver películas en IMAX?', contenido: 'Siempre veo todo en sala normal. ¿Realmente se nota la diferencia en películas como Dune: Parte Dos u Oppenheimer?', categoriaId: 1, autorId: 6, fecha: '2026-11-02T11:35:00', estado: 'ACTIVO', spoiler: false },
  { id: 3, titulo: 'Recomienden series cortas para un fin de semana', contenido: 'Busco series de una o dos temporadas que se puedan ver de corrido. Acepto cualquier género.', categoriaId: 2, autorId: 4, fecha: '2026-11-02T11:40:00', estado: 'ACTIVO', spoiler: false },
  { id: 4, titulo: 'Severance: ¿la mejor serie de ciencia ficción reciente?', contenido: 'Terminé la segunda temporada y sigo pensando en ella. ¿Qué les pareció el ritmo comparado con la primera?', categoriaId: 2, autorId: 3, fecha: '2026-11-02T11:45:00', estado: 'ACTIVO', spoiler: false },
  { id: 5, titulo: 'Anime para quienes nunca han visto anime', contenido: 'Quiero recomendarle anime a un amigo que nunca ha visto. Estaba pensando en Frieren o Fullmetal Alchemist: Brotherhood. ¿Otras ideas?', categoriaId: 3, autorId: 5, fecha: '2026-11-02T11:50:00', estado: 'ACTIVO', spoiler: false },
  { id: 6, titulo: 'La animación de Spider-Verse cambió el cine animado', contenido: 'Después de Across the Spider-Verse, muchas películas animadas empezaron a experimentar con estilos visuales. ¿Están de acuerdo?', categoriaId: 3, autorId: 5, fecha: '2026-11-02T11:55:00', estado: 'ACTIVO', spoiler: false },
  { id: 7, titulo: 'Reseña: Oppenheimer, tres horas que se pasan volando', contenido: 'La actuación de Cillian Murphy y la banda sonora de Ludwig Göransson hacen que la película nunca pierda tensión. Mi nota: 9/10.', categoriaId: 4, autorId: 6, fecha: '2026-11-02T12:00:00', estado: 'ACTIVO', spoiler: false },
  { id: 8, titulo: 'Reseña: Arcane, temporada 2', contenido: 'Visualmente impecable y con un cierre a la altura. Algunos arcos se sienten apurados, pero vale totalmente la pena. Nota: 8.5/10.', categoriaId: 4, autorId: 4, fecha: '2026-11-02T12:05:00', estado: 'ACTIVO', spoiler: false },
  { id: 9, titulo: '[SPOILERS] El final de Interstellar explicado', contenido: '¿Quién construyó realmente el teseracto? Dejo mi teoría y los invito a compartir la suya.', categoriaId: 5, autorId: 3, fecha: '2026-11-02T12:10:00', estado: 'ACTIVO', spoiler: true },
  { id: 10, titulo: 'LINKS PARA VER PELÍCULAS GRATIS', contenido: 'Contenido eliminado por incumplir las normas del foro (piratería).', categoriaId: 1, autorId: 5, fecha: '2026-11-02T12:15:00', estado: 'BANEADO', spoiler: false },
];

export const COMENTARIOS_INICIALES: Comentario[] = [
  { id: 1, contenido: 'Sí se nota, sobre todo en el sonido. Para películas de ese tamaño vale cada peso.', temaId: 2, autorId: 3, fecha: '2026-11-02T13:00:00', estado: 'ACTIVO' },
  { id: 2, contenido: 'Depende de la película. Para dramas o comedias no lo pagaría.', temaId: 2, autorId: 4, fecha: '2026-11-02T13:05:00', estado: 'ACTIVO' },
  { id: 3, contenido: 'Chernobyl: una sola temporada y es impecable.', temaId: 3, autorId: 6, fecha: '2026-11-02T13:10:00', estado: 'ACTIVO' },
  { id: 4, contenido: "Te sumo Bebé Reno y The Queen's Gambit (Gambito de dama).", temaId: 3, autorId: 3, fecha: '2026-11-02T13:15:00', estado: 'ACTIVO' },
  { id: 5, contenido: 'La segunda temporada es más lenta al principio, pero el final lo compensa.', temaId: 4, autorId: 4, fecha: '2026-11-02T13:20:00', estado: 'ACTIVO' },
  { id: 6, contenido: 'Frieren es perfecta para empezar: tranquila, emotiva y muy bien hecha.', temaId: 5, autorId: 6, fecha: '2026-11-02T13:25:00', estado: 'ACTIVO' },
  { id: 7, contenido: 'Totalmente. Se nota su influencia en varias películas animadas posteriores.', temaId: 6, autorId: 3, fecha: '2026-11-02T13:30:00', estado: 'ACTIVO' },
  { id: 8, contenido: 'Coincido con el 9. La escena de la prueba Trinity es inolvidable.', temaId: 7, autorId: 5, fecha: '2026-11-02T13:35:00', estado: 'ACTIVO' },
  { id: 9, contenido: 'Mi teoría: son los humanos del futuro, que cierran el ciclo.', temaId: 9, autorId: 4, fecha: '2026-11-02T13:40:00', estado: 'ACTIVO' },
  { id: 10, contenido: 'Comentario eliminado por lenguaje ofensivo.', temaId: 8, autorId: 5, fecha: '2026-11-02T13:45:00', estado: 'BANEADO' },
];

export const SANCIONES_INICIALES: Sancion[] = [
  { id: 1, tipoContenido: 'TEMA', contenidoId: 10, motivo: 'Publica enlaces a sitios de piratería, prohibido por las normas del foro', moderadorId: 2, fecha: '2026-11-02T14:00:00', vigente: true },
  { id: 2, tipoContenido: 'COMENTARIO', contenidoId: 10, motivo: 'Uso de lenguaje ofensivo hacia otros usuarios', moderadorId: 2, fecha: '2026-11-02T14:05:00', vigente: true },
  { id: 3, tipoContenido: 'COMENTARIO', contenidoId: 3, motivo: 'Reportado como spoiler sin aviso (revisado: no correspondía)', moderadorId: 1, fecha: '2026-11-02T14:10:00', vigente: false },
];

export const GENEROS = ['Acción', 'Animación', 'Ciencia ficción', 'Comedia', 'Documental', 'Drama', 'Fantasía', 'Terror', 'Thriller'];

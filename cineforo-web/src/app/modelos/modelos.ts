/** Modelos del dominio de CineForo (mismos datos que los microservicios). */

export type NombreRol = 'USUARIO' | 'MODERADOR' | 'ADMINISTRADOR';
export type EstadoContenido = 'ACTIVO' | 'BANEADO';
export type TipoContenido = 'TEMA' | 'COMENTARIO';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  email: string;
  password: string;          // solo para la demo del FrontEnd (el BackEnd usa BCrypt)
  rol: NombreRol;
  activo: boolean;
  fechaRegistro: string;
  fechaNacimiento?: string;
  bio?: string;
  generoFavorito?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;             // clase de Bootstrap Icons
}

export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  categoriaId: number;
  autorId: number;
  fecha: string;
  estado: EstadoContenido;
  spoiler: boolean;
}

export interface Comentario {
  id: number;
  contenido: string;
  temaId: number;
  autorId: number;
  fecha: string;
  estado: EstadoContenido;
}

export interface Sancion {
  id: number;
  tipoContenido: TipoContenido;
  contenidoId: number;
  motivo: string;
  moderadorId: number;
  fecha: string;
  vigente: boolean;
}

/** Resultado de una operacion de la fachada. */
export interface Resultado<T = void> {
  ok: boolean;
  mensaje: string;
  dato?: T;
}

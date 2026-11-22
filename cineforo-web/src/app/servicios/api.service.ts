import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NombreRol, TipoContenido } from '../modelos/modelos';

/**
 * Cliente HTTP de los 3 microservicios.
 *
 * Las rutas son relativas (/api/...): en desarrollo las reenvia el proxy de Angular
 * (proxy.conf.json) y en Docker las reenvia nginx al contenedor que corresponde:
 *   /api/auth, /api/usuarios, /api/roles      -> usuarios-ms   (8081)
 *   /api/categorias, /api/temas, /api/comentarios -> foro-ms   (8082)
 *   /api/sanciones                            -> moderacion-ms (8083)
 * El header X-Usuario-Id lo agrega el interceptor (interceptores/usuario.interceptor.ts).
 */

// ===== Lo que responden los microservicios (DTOs de Spring Boot) =====
export interface RolApi { id: number; nombre: NombreRol; descripcion: string; }
export interface UsuarioApi { id: number; nombreUsuario: string; email: string; rol: RolApi; fechaRegistro: string; activo: boolean; }
export interface LoginApi { mensaje: string; usuario: UsuarioApi; }
export interface CategoriaApi { id: number; nombre: string; descripcion: string; }
export interface TemaApi {
  id: number; titulo: string; contenido: string; categoria: CategoriaApi; autorId: number;
  fechaCreacion: string; estado: 'ACTIVO' | 'BANEADO'; cantidadComentarios?: number;
}
export interface ComentarioApi { id: number; contenido: string; temaId: number; autorId: number; fechaCreacion: string; estado: 'ACTIVO' | 'BANEADO'; }
export interface SancionApi { id: number; tipoContenido: TipoContenido; contenidoId: number; motivo: string; moderadorId: number; fecha: string; vigente: boolean; }

/** Error de negocio devuelto por un microservicio (400, 401, 403, 404, 409...). */
export class ErrorApi extends Error {
  constructor(readonly estado: number, mensaje: string) {
    super(mensaje);
  }
}

/** El microservicio no responde (apagado, contenedor caido o sin proxy). */
export class SinConexion extends Error {}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly http = inject(HttpClient);

  // ===================== usuarios-ms =====================
  login(usuario: string, password: string) {
    return this.llamar(this.http.post<LoginApi>('/api/auth/login', { usuario, password }));
  }
  roles() {
    return this.llamar(this.http.get<RolApi[]>('/api/roles'));
  }
  usuarios() {
    return this.llamar(this.http.get<UsuarioApi[]>('/api/usuarios'));
  }
  crearUsuario(datos: { nombreUsuario: string; email: string; password: string }) {
    return this.llamar(this.http.post<UsuarioApi>('/api/usuarios', datos));
  }
  actualizarUsuario(id: number, cambios: { email?: string; password?: string; rolId?: number; activo?: boolean }, actorId?: number) {
    // actorId solo se indica en la recuperacion de clave (no hay sesion iniciada)
    const headers = actorId !== undefined ? { 'X-Usuario-Id': String(actorId) } : undefined;
    return this.llamar(this.http.put<UsuarioApi>(`/api/usuarios/${id}`, cambios, { headers }));
  }

  // ===================== foro-ms =====================
  categorias() {
    return this.llamar(this.http.get<CategoriaApi[]>('/api/categorias'));
  }
  crearCategoria(nombre: string, descripcion: string) {
    return this.llamar(this.http.post<CategoriaApi>('/api/categorias', { nombre, descripcion }));
  }
  eliminarCategoria(id: number) {
    return this.llamar(this.http.delete<void>(`/api/categorias/${id}`));
  }
  temas() {
    return this.llamar(this.http.get<TemaApi[]>('/api/temas'));
  }
  publicarTema(titulo: string, contenido: string, categoriaId: number) {
    return this.llamar(this.http.post<TemaApi>('/api/temas', { titulo, contenido, categoriaId }));
  }
  eliminarTema(id: number) {
    return this.llamar(this.http.delete<void>(`/api/temas/${id}`));
  }
  comentarios(temaId: number) {
    return this.llamar(this.http.get<ComentarioApi[]>(`/api/temas/${temaId}/comentarios`));
  }
  comentar(temaId: number, contenido: string) {
    return this.llamar(this.http.post<ComentarioApi>(`/api/temas/${temaId}/comentarios`, { contenido }));
  }
  eliminarComentario(id: number) {
    return this.llamar(this.http.delete<void>(`/api/comentarios/${id}`));
  }

  // ===================== moderacion-ms =====================
  sanciones() {
    return this.llamar(this.http.get<SancionApi[]>('/api/sanciones'));
  }
  sancionar(tipoContenido: TipoContenido, contenidoId: number, motivo: string) {
    return this.llamar(this.http.post<SancionApi>('/api/sanciones', { tipoContenido, contenidoId, motivo }));
  }
  revocarSancion(id: number) {
    return this.llamar(this.http.delete<void>(`/api/sanciones/${id}`));
  }

  // ===================== Manejo de errores =====================
  private async llamar<T>(peticion: import('rxjs').Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(peticion);
    } catch (e) {
      throw this.traducir(e);
    }
  }

  private traducir(e: unknown): Error {
    if (!(e instanceof HttpErrorResponse)) {
      return new SinConexion('Error inesperado de red');
    }
    // 0: sin respuesta | 502/504: nginx o el proxy no alcanzan el microservicio
    // 200 con error: respondio algo que no es JSON (no hay microservicio detras)
    if (e.status === 0 || e.status === 502 || e.status === 504 || e.status === 200 || e.status === 404 && typeof e.error === 'string') {
      return new SinConexion(`Sin respuesta del microservicio (${e.status})`);
    }
    const cuerpo = e.error as { error?: string; campos?: Record<string, string> } | null;
    const detalle = cuerpo?.campos ? Object.values(cuerpo.campos).join(' ') : '';
    return new ErrorApi(e.status, detalle || cuerpo?.error || `Error ${e.status}`);
  }
}

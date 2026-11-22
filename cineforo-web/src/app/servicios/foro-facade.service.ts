import { computed, inject, Injectable } from '@angular/core';
import { AlmacenService } from './almacen.service';
import { SesionService } from './sesion.service';
import {
  Categoria, Comentario, NombreRol, Resultado, Sancion, Tema, TipoContenido, Usuario,
} from '../modelos/modelos';

/**
 * PATRON DE DISENO: FACADE (estructural).
 *
 * Es la unica puerta de entrada que usan las paginas. Oculta como se guardan los
 * datos (AlmacenService) y como se maneja la sesion (SesionService), y concentra
 * las reglas de negocio y de permisos por rol:
 *  - USUARIO: publica, comenta y elimina solo su propio contenido.
 *  - MODERADOR: ademas banea y restaura temas o comentarios.
 *  - ADMINISTRADOR: ademas gestiona usuarios (rol, activo) y categorias.
 * Si manana el FrontEnd se conecta a los microservicios, solo cambia esta clase.
 */
@Injectable({ providedIn: 'root' })
export class ForoFacade {

  private readonly almacen = inject(AlmacenService);
  readonly sesion = inject(SesionService);

  // ===================== Lecturas =====================
  readonly categorias = this.almacen.categorias.asReadonly();
  readonly usuarios = this.almacen.usuarios.asReadonly();
  readonly sanciones = computed(() =>
    [...this.almacen.sanciones()].sort((a, b) => b.fecha.localeCompare(a.fecha)));

  readonly temasActivos = computed(() =>
    this.almacen.temas().filter(t => t.estado === 'ACTIVO').sort((a, b) => b.fecha.localeCompare(a.fecha)));

  readonly estadisticas = computed(() => ({
    usuarios: this.almacen.usuarios().length,
    temas: this.temasActivos().length,
    comentarios: this.almacen.comentarios().filter(c => c.estado === 'ACTIVO').length,
  }));

  readonly temasBaneados = computed(() => this.almacen.temas().filter(t => t.estado === 'BANEADO'));
  readonly comentariosBaneados = computed(() => this.almacen.comentarios().filter(c => c.estado === 'BANEADO'));
  readonly comentariosActivos = computed(() =>
    this.almacen.comentarios().filter(c => c.estado === 'ACTIVO').sort((a, b) => b.fecha.localeCompare(a.fecha)));

  categoria(id: number): Categoria | undefined {
    return this.almacen.categorias().find(c => c.id === id);
  }

  buscarTemas(filtro: { categoriaId?: number; texto?: string; autorId?: number }): Tema[] {
    const texto = (filtro.texto ?? '').trim().toLowerCase();
    return this.temasActivos().filter(t =>
      (filtro.categoriaId === undefined || t.categoriaId === filtro.categoriaId) &&
      (filtro.autorId === undefined || t.autorId === filtro.autorId) &&
      (texto === '' || t.titulo.toLowerCase().includes(texto) || t.contenido.toLowerCase().includes(texto)));
  }

  tema(id: number): Tema | undefined {
    return this.almacen.temas().find(t => t.id === id && t.estado === 'ACTIVO');
  }

  temaCualquierEstado(id: number): Tema | undefined {
    return this.almacen.temas().find(t => t.id === id);
  }

  comentariosDe(temaId: number): Comentario[] {
    return this.almacen.comentarios()
      .filter(c => c.temaId === temaId && c.estado === 'ACTIVO')
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  contarComentarios(temaId: number): number {
    return this.almacen.comentarios().filter(c => c.temaId === temaId && c.estado === 'ACTIVO').length;
  }

  contarTemas(categoriaId: number): number {
    return this.temasActivos().filter(t => t.categoriaId === categoriaId).length;
  }

  nombreAutor(id: number): string {
    return this.almacen.usuarios().find(u => u.id === id)?.nombreUsuario ?? 'usuario eliminado';
  }

  existeNombreUsuario(nombre: string, excepto?: number): boolean {
    return this.almacen.usuarios().some(u => u.nombreUsuario.toLowerCase() === nombre.trim().toLowerCase() && u.id !== excepto);
  }

  existeEmail(email: string, excepto?: number): boolean {
    return this.almacen.usuarios().some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== excepto);
  }

  puedeEliminar(autorId: number): boolean {
    const u = this.sesion.usuario();
    return u !== null && (u.id === autorId || this.sesion.puedeModerar());
  }

  // ===================== Sesion y cuenta =====================
  iniciarSesion(usuarioOEmail: string, password: string): Resultado<Usuario> {
    const valor = usuarioOEmail.trim().toLowerCase();
    const u = this.almacen.usuarios().find(x =>
      x.nombreUsuario.toLowerCase() === valor || x.email.toLowerCase() === valor);
    if (!u || u.password !== password) {
      return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
    }
    if (!u.activo) {
      return { ok: false, mensaje: 'Tu cuenta está desactivada. Contacta a un administrador.' };
    }
    this.sesion.iniciar(u);
    return { ok: true, mensaje: `¡Bienvenido/a, ${u.nombreUsuario}!`, dato: u };
  }

  cerrarSesion(): void {
    this.sesion.cerrar();
  }

  registrar(datos: { nombreUsuario: string; email: string; password: string; fechaNacimiento: string; generoFavorito: string }): Resultado<Usuario> {
    if (this.existeNombreUsuario(datos.nombreUsuario)) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso.' };
    }
    if (this.existeEmail(datos.email)) {
      return { ok: false, mensaje: 'Ese email ya está registrado.' };
    }
    const usuarios = this.almacen.usuarios();
    const nuevo: Usuario = {
      id: this.almacen.siguienteId(usuarios),
      nombreUsuario: datos.nombreUsuario.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password,
      rol: 'USUARIO',
      activo: true,
      fechaRegistro: new Date().toISOString().slice(0, 10),
      fechaNacimiento: datos.fechaNacimiento,
      generoFavorito: datos.generoFavorito,
    };
    this.almacen.usuarios.set([...usuarios, nuevo]);
    this.almacen.guardar();
    this.sesion.iniciar(nuevo);
    return { ok: true, mensaje: 'Cuenta creada con éxito.', dato: nuevo };
  }

  /** Simula el envio de un codigo de recuperacion por email (no hay servidor de correo). */
  solicitarRecuperacion(email: string): Resultado<string> {
    if (!this.existeEmail(email)) {
      return { ok: false, mensaje: 'No hay ninguna cuenta registrada con ese email.' };
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    return { ok: true, mensaje: 'Código enviado.', dato: codigo };
  }

  restablecerPassword(email: string, nueva: string): Resultado {
    this.modificarUsuario(u => u.email.toLowerCase() === email.trim().toLowerCase(), u => ({ ...u, password: nueva }));
    return { ok: true, mensaje: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' };
  }

  actualizarPerfil(datos: { email: string; bio: string; generoFavorito: string }): Resultado {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión.' };
    }
    if (this.existeEmail(datos.email, yo.id)) {
      return { ok: false, mensaje: 'Ese email ya lo usa otra cuenta.' };
    }
    this.modificarUsuario(u => u.id === yo.id, u => ({
      ...u, email: datos.email.trim().toLowerCase(), bio: datos.bio.trim(), generoFavorito: datos.generoFavorito,
    }));
    return { ok: true, mensaje: 'Perfil actualizado.' };
  }

  cambiarPassword(actual: string, nueva: string): Resultado {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión.' };
    }
    if (yo.password !== actual) {
      return { ok: false, mensaje: 'La contraseña actual no es correcta.' };
    }
    this.modificarUsuario(u => u.id === yo.id, u => ({ ...u, password: nueva }));
    return { ok: true, mensaje: 'Contraseña actualizada.' };
  }

  // ===================== Foro =====================
  publicarTema(datos: { titulo: string; contenido: string; categoriaId: number; spoiler: boolean }): Resultado<Tema> {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión para publicar.' };
    }
    const temas = this.almacen.temas();
    const nuevo: Tema = {
      id: this.almacen.siguienteId(temas),
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      categoriaId: datos.categoriaId,
      autorId: yo.id,
      fecha: new Date().toISOString(),
      estado: 'ACTIVO',
      spoiler: datos.spoiler,
    };
    this.almacen.temas.set([...temas, nuevo]);
    this.almacen.guardar();
    return { ok: true, mensaje: 'Tema publicado.', dato: nuevo };
  }

  comentar(temaId: number, contenido: string): Resultado {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión para comentar.' };
    }
    const comentarios = this.almacen.comentarios();
    this.almacen.comentarios.set([...comentarios, {
      id: this.almacen.siguienteId(comentarios), contenido: contenido.trim(), temaId,
      autorId: yo.id, fecha: new Date().toISOString(), estado: 'ACTIVO',
    }]);
    this.almacen.guardar();
    return { ok: true, mensaje: 'Comentario publicado.' };
  }

  eliminarTema(id: number): Resultado {
    const tema = this.temaCualquierEstado(id);
    if (!tema || !this.puedeEliminar(tema.autorId)) {
      return { ok: false, mensaje: 'No tienes permiso para eliminar este tema.' };
    }
    this.almacen.temas.set(this.almacen.temas().filter(t => t.id !== id));
    this.almacen.comentarios.set(this.almacen.comentarios().filter(c => c.temaId !== id));
    this.almacen.guardar();
    return { ok: true, mensaje: 'Tema eliminado.' };
  }

  eliminarComentario(id: number): Resultado {
    const c = this.almacen.comentarios().find(x => x.id === id);
    if (!c || !this.puedeEliminar(c.autorId)) {
      return { ok: false, mensaje: 'No tienes permiso para eliminar este comentario.' };
    }
    this.almacen.comentarios.set(this.almacen.comentarios().filter(x => x.id !== id));
    this.almacen.guardar();
    return { ok: true, mensaje: 'Comentario eliminado.' };
  }

  // ===================== Moderacion (MODERADOR / ADMINISTRADOR) =====================
  banear(tipo: TipoContenido, contenidoId: number, motivo: string): Resultado {
    const yo = this.sesion.usuario();
    if (!yo || !this.sesion.puedeModerar()) {
      return { ok: false, mensaje: 'Solo un moderador o administrador puede banear contenido.' };
    }
    this.cambiarEstado(tipo, contenidoId, 'BANEADO');
    const sanciones = this.almacen.sanciones();
    const nueva: Sancion = {
      id: this.almacen.siguienteId(sanciones), tipoContenido: tipo, contenidoId, motivo: motivo.trim(),
      moderadorId: yo.id, fecha: new Date().toISOString(), vigente: true,
    };
    this.almacen.sanciones.set([...sanciones, nueva]);
    this.almacen.guardar();
    return { ok: true, mensaje: `${tipo === 'TEMA' ? 'Tema' : 'Comentario'} baneado.` };
  }

  restaurar(tipo: TipoContenido, contenidoId: number): Resultado {
    if (!this.sesion.puedeModerar()) {
      return { ok: false, mensaje: 'Solo un moderador o administrador puede restaurar contenido.' };
    }
    this.cambiarEstado(tipo, contenidoId, 'ACTIVO');
    this.almacen.sanciones.set(this.almacen.sanciones().map(s =>
      s.tipoContenido === tipo && s.contenidoId === contenidoId && s.vigente ? { ...s, vigente: false } : s));
    this.almacen.guardar();
    return { ok: true, mensaje: 'Contenido restaurado.' };
  }

  // ===================== Administracion (ADMINISTRADOR) =====================
  cambiarRol(usuarioId: number, rol: NombreRol): Resultado {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede cambiar roles.' };
    }
    if (usuarioId === this.sesion.usuario()?.id) {
      return { ok: false, mensaje: 'No puedes cambiar tu propio rol.' };
    }
    this.modificarUsuario(u => u.id === usuarioId, u => ({ ...u, rol }));
    return { ok: true, mensaje: 'Rol actualizado.' };
  }

  alternarActivo(usuarioId: number): Resultado {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede activar o desactivar cuentas.' };
    }
    if (usuarioId === this.sesion.usuario()?.id) {
      return { ok: false, mensaje: 'No puedes desactivar tu propia cuenta.' };
    }
    this.modificarUsuario(u => u.id === usuarioId, u => ({ ...u, activo: !u.activo }));
    return { ok: true, mensaje: 'Estado de la cuenta actualizado.' };
  }

  crearCategoria(nombre: string, descripcion: string): Resultado {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede crear categorías.' };
    }
    const categorias = this.almacen.categorias();
    if (categorias.some(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      return { ok: false, mensaje: 'Ya existe una categoría con ese nombre.' };
    }
    this.almacen.categorias.set([...categorias, {
      id: this.almacen.siguienteId(categorias), nombre: nombre.trim(), descripcion: descripcion.trim(), icono: 'bi-collection-play',
    }]);
    this.almacen.guardar();
    return { ok: true, mensaje: 'Categoría creada.' };
  }

  eliminarCategoria(id: number): Resultado {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede eliminar categorías.' };
    }
    if (this.almacen.temas().some(t => t.categoriaId === id)) {
      return { ok: false, mensaje: 'No se puede eliminar una categoría que tiene temas.' };
    }
    this.almacen.categorias.set(this.almacen.categorias().filter(c => c.id !== id));
    this.almacen.guardar();
    return { ok: true, mensaje: 'Categoría eliminada.' };
  }

  restablecerDatos(): void {
    this.almacen.restablecer();
    this.sesion.cerrar();
  }

  // ===================== Auxiliares =====================
  private cambiarEstado(tipo: TipoContenido, id: number, estado: 'ACTIVO' | 'BANEADO'): void {
    if (tipo === 'TEMA') {
      this.almacen.temas.set(this.almacen.temas().map(t => t.id === id ? { ...t, estado } : t));
    } else {
      this.almacen.comentarios.set(this.almacen.comentarios().map(c => c.id === id ? { ...c, estado } : c));
    }
  }

  private modificarUsuario(filtro: (u: Usuario) => boolean, cambio: (u: Usuario) => Usuario): void {
    this.almacen.usuarios.set(this.almacen.usuarios().map(u => filtro(u) ? cambio(u) : u));
    this.almacen.guardar();
  }
}

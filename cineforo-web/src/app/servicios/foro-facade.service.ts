import { computed, inject, Injectable, signal } from '@angular/core';
import { AlmacenService } from './almacen.service';
import { ApiService, ComentarioApi, ErrorApi, SancionApi, TemaApi, UsuarioApi } from './api.service';
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
 *
 * Conexion con el BackEnd: cada operacion se envia primero al microservicio que corresponde
 * (usuarios-ms, foro-ms o moderacion-ms, que guardan en Oracle) y su respuesta actualiza los
 * arreglos de Angular. Si los microservicios no responden, la fachada pasa a "modo local" y
 * sigue funcionando solo con los arreglos. Las paginas no notan la diferencia.
 */
@Injectable({ providedIn: 'root' })
export class ForoFacade {

  private readonly almacen = inject(AlmacenService);
  private readonly api = inject(ApiService);
  readonly sesion = inject(SesionService);

  /** De donde salen los datos: microservicios (Oracle) o arreglos locales. */
  readonly modo = signal<'conectando' | 'microservicios' | 'local'>('conectando');
  private readonly rolesId = new Map<NombreRol, number>([['USUARIO', 1], ['MODERADOR', 2], ['ADMINISTRADOR', 3]]);
  private sincronizando: Promise<void> | null = null;
  private ultimaSincronizacion = 0;

  constructor() {
    void this.sincronizar();
  }

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

  // ===================== Sincronizacion con los microservicios =====================
  /** Carga roles, usuarios, categorias, temas, comentarios y sanciones desde los 3 microservicios. */
  sincronizar(): Promise<void> {
    this.sincronizando ??= this.cargarDesdeMicroservicios().finally(() => {
      this.sincronizando = null;
      this.ultimaSincronizacion = Date.now();
    });
    return this.sincronizando;
  }

  /** Vuelve a sincronizar si pasaron mas de 'segundos' desde la ultima vez (se llama al navegar). */
  refrescar(segundos = 10): void {
    if (this.modo() !== 'local' && Date.now() - this.ultimaSincronizacion > segundos * 1000) {
      void this.sincronizar();
    }
  }

  private async cargarDesdeMicroservicios(): Promise<void> {
    try {
      const [roles, usuarios, categorias, temas, sanciones] = await Promise.all([
        this.api.roles(), this.api.usuarios(), this.api.categorias(), this.api.temas(), this.api.sanciones(),
      ]);
      const comentariosPorTema = await Promise.all(temas.map(t => this.api.comentarios(t.id)));

      roles.forEach(r => this.rolesId.set(r.nombre, r.id));
      const vigentes = sanciones.filter(s => s.vigente);
      const temasBaneados = new Set(vigentes.filter(s => s.tipoContenido === 'TEMA').map(s => s.contenidoId));
      const comentariosBaneados = new Set(vigentes.filter(s => s.tipoContenido === 'COMENTARIO').map(s => s.contenidoId));

      // Usuarios: los datos extra del perfil (bio, genero, fecha de nacimiento) solo existen en el FrontEnd
      const usuariosPrevios = new Map(this.almacen.usuarios().map(u => [u.id, u]));
      this.almacen.usuarios.set(usuarios.map(u => this.aUsuario(u, usuariosPrevios.get(u.id))));

      const iconos = new Map(this.almacen.categorias().map(c => [c.id, c.icono]));
      this.almacen.categorias.set(categorias.map(c => ({ ...c, icono: iconos.get(c.id) ?? 'bi-collection-play' })));

      // Temas: los activos vienen de foro-ms; los baneados (que foro-ms oculta) se conservan del arreglo local
      const temasPrevios = new Map(this.almacen.temas().map(t => [t.id, t]));
      const activos = temas.map(t => this.aTema(t, temasPrevios.get(t.id)));
      const idsActivos = new Set(activos.map(t => t.id));
      const ocultos = this.almacen.temas()
        .filter(t => temasBaneados.has(t.id) && !idsActivos.has(t.id))
        .map(t => ({ ...t, estado: 'BANEADO' as const }));
      this.almacen.temas.set([...activos, ...ocultos]);

      const comentariosActivos = comentariosPorTema.flat().map(c => this.aComentario(c));
      const idsComentarios = new Set(comentariosActivos.map(c => c.id));
      const comentariosOcultos = this.almacen.comentarios()
        .filter(c => !idsComentarios.has(c.id) && (comentariosBaneados.has(c.id) || temasBaneados.has(c.temaId)))
        .map(c => comentariosBaneados.has(c.id) ? { ...c, estado: 'BANEADO' as const } : c);
      this.almacen.comentarios.set([...comentariosActivos, ...comentariosOcultos]);

      this.almacen.sanciones.set(sanciones.map(s => this.aSancion(s)));
      this.almacen.guardar();
      this.modo.set('microservicios');
    } catch {
      // Algun microservicio no responde: se sigue trabajando con los arreglos locales
      this.modo.set('local');
    }
  }

  // ===================== Sesion y cuenta =====================
  async iniciarSesion(usuarioOEmail: string, password: string): Promise<Resultado<Usuario>> {
    return this.ejecutar(
      () => this.api.login(usuarioOEmail.trim(), password),
      r => {
        const u = this.guardarUsuario(this.aUsuario(r.usuario, this.almacen.usuarios().find(x => x.id === r.usuario.id), password));
        this.sesion.iniciar(u);
        return { ok: true, mensaje: `¡Bienvenido/a, ${u.nombreUsuario}!`, dato: u };
      },
      () => this.iniciarSesionLocal(usuarioOEmail, password),
      e => e.estado === 401 ? 'Usuario o contraseña incorrectos.' : e.message,
    );
  }

  private iniciarSesionLocal(usuarioOEmail: string, password: string): Resultado<Usuario> {
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

  async registrar(datos: { nombreUsuario: string; email: string; password: string; fechaNacimiento: string; generoFavorito: string }): Promise<Resultado<Usuario>> {
    if (this.existeNombreUsuario(datos.nombreUsuario)) {
      return { ok: false, mensaje: 'Ese nombre de usuario ya está en uso.' };
    }
    if (this.existeEmail(datos.email)) {
      return { ok: false, mensaje: 'Ese email ya está registrado.' };
    }
    const extras = { password: datos.password, fechaNacimiento: datos.fechaNacimiento, generoFavorito: datos.generoFavorito };
    return this.ejecutar(
      () => this.api.crearUsuario({ nombreUsuario: datos.nombreUsuario.trim(), email: datos.email.trim().toLowerCase(), password: datos.password }),
      creado => {
        const nuevo = this.guardarUsuario({ ...this.aUsuario(creado), ...extras });
        this.sesion.iniciar(nuevo);
        return { ok: true, mensaje: 'Cuenta creada con éxito.', dato: nuevo };
      },
      () => {
        const usuarios = this.almacen.usuarios();
        const nuevo: Usuario = {
          id: this.almacen.siguienteId(usuarios),
          nombreUsuario: datos.nombreUsuario.trim(),
          email: datos.email.trim().toLowerCase(),
          rol: 'USUARIO',
          activo: true,
          fechaRegistro: new Date().toISOString().slice(0, 10),
          ...extras,
        };
        this.guardarUsuario(nuevo);
        this.sesion.iniciar(nuevo);
        return { ok: true, mensaje: 'Cuenta creada con éxito.', dato: nuevo };
      },
    );
  }

  /** Simula el envio de un codigo de recuperacion por email (no hay servidor de correo). */
  solicitarRecuperacion(email: string): Resultado<string> {
    if (!this.existeEmail(email)) {
      return { ok: false, mensaje: 'No hay ninguna cuenta registrada con ese email.' };
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    return { ok: true, mensaje: 'Código enviado.', dato: codigo };
  }

  async restablecerPassword(email: string, nueva: string): Promise<Resultado> {
    const u = this.almacen.usuarios().find(x => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) {
      return { ok: false, mensaje: 'No hay ninguna cuenta registrada con ese email.' };
    }
    const exito: Resultado = { ok: true, mensaje: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' };
    return this.ejecutar(
      // el codigo ya fue verificado: se actua en nombre del propio usuario
      () => this.api.actualizarUsuario(u.id, { password: nueva }, u.id),
      () => { this.modificarUsuario(x => x.id === u.id, x => ({ ...x, password: nueva })); return exito; },
      () => { this.modificarUsuario(x => x.id === u.id, x => ({ ...x, password: nueva })); return exito; },
    );
  }

  async actualizarPerfil(datos: { email: string; bio: string; generoFavorito: string }): Promise<Resultado> {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión.' };
    }
    if (this.existeEmail(datos.email, yo.id)) {
      return { ok: false, mensaje: 'Ese email ya lo usa otra cuenta.' };
    }
    const aplicar = (): Resultado => {
      this.modificarUsuario(u => u.id === yo.id, u => ({
        ...u, email: datos.email.trim().toLowerCase(), bio: datos.bio.trim(), generoFavorito: datos.generoFavorito,
      }));
      return { ok: true, mensaje: 'Perfil actualizado.' };
    };
    return this.ejecutar(() => this.api.actualizarUsuario(yo.id, { email: datos.email.trim().toLowerCase() }), aplicar, aplicar);
  }

  async cambiarPassword(actual: string, nueva: string): Promise<Resultado> {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión.' };
    }
    const aplicar = (): Resultado => {
      this.modificarUsuario(u => u.id === yo.id, u => ({ ...u, password: nueva }));
      return { ok: true, mensaje: 'Contraseña actualizada.' };
    };
    return this.ejecutar(
      async () => {
        await this.api.login(yo.nombreUsuario, actual);   // verifica la clave actual en usuarios-ms
        return this.api.actualizarUsuario(yo.id, { password: nueva });
      },
      aplicar,
      () => yo.password !== actual ? { ok: false, mensaje: 'La contraseña actual no es correcta.' } : aplicar(),
      e => e.estado === 401 ? 'La contraseña actual no es correcta.' : e.message,
    );
  }

  // ===================== Foro =====================
  async publicarTema(datos: { titulo: string; contenido: string; categoriaId: number; spoiler: boolean }): Promise<Resultado<Tema>> {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión para publicar.' };
    }
    const guardar = (nuevo: Tema): Resultado<Tema> => {
      this.almacen.temas.set([...this.almacen.temas(), nuevo]);
      this.almacen.guardar();
      return { ok: true, mensaje: 'Tema publicado.', dato: nuevo };
    };
    return this.ejecutar(
      () => this.api.publicarTema(datos.titulo.trim(), datos.contenido.trim(), datos.categoriaId),
      creado => guardar({ ...this.aTema(creado), spoiler: datos.spoiler }),
      () => guardar({
        id: this.almacen.siguienteId(this.almacen.temas()),
        titulo: datos.titulo.trim(),
        contenido: datos.contenido.trim(),
        categoriaId: datos.categoriaId,
        autorId: yo.id,
        fecha: new Date().toISOString(),
        estado: 'ACTIVO',
        spoiler: datos.spoiler,
      }),
    );
  }

  async comentar(temaId: number, contenido: string): Promise<Resultado> {
    const yo = this.sesion.usuario();
    if (!yo) {
      return { ok: false, mensaje: 'Debes iniciar sesión para comentar.' };
    }
    const guardar = (nuevo: Comentario): Resultado => {
      this.almacen.comentarios.set([...this.almacen.comentarios(), nuevo]);
      this.almacen.guardar();
      return { ok: true, mensaje: 'Comentario publicado.' };
    };
    return this.ejecutar(
      () => this.api.comentar(temaId, contenido.trim()),
      creado => guardar(this.aComentario(creado)),
      () => guardar({
        id: this.almacen.siguienteId(this.almacen.comentarios()), contenido: contenido.trim(), temaId,
        autorId: yo.id, fecha: new Date().toISOString(), estado: 'ACTIVO',
      }),
    );
  }

  async eliminarTema(id: number): Promise<Resultado> {
    const tema = this.temaCualquierEstado(id);
    if (!tema || !this.puedeEliminar(tema.autorId)) {
      return { ok: false, mensaje: 'No tienes permiso para eliminar este tema.' };
    }
    const quitar = (): Resultado => {
      this.almacen.temas.set(this.almacen.temas().filter(t => t.id !== id));
      this.almacen.comentarios.set(this.almacen.comentarios().filter(c => c.temaId !== id));
      this.almacen.guardar();
      return { ok: true, mensaje: 'Tema eliminado.' };
    };
    return this.ejecutar(() => this.api.eliminarTema(id), quitar, quitar);
  }

  async eliminarComentario(id: number): Promise<Resultado> {
    const c = this.almacen.comentarios().find(x => x.id === id);
    if (!c || !this.puedeEliminar(c.autorId)) {
      return { ok: false, mensaje: 'No tienes permiso para eliminar este comentario.' };
    }
    const quitar = (): Resultado => {
      this.almacen.comentarios.set(this.almacen.comentarios().filter(x => x.id !== id));
      this.almacen.guardar();
      return { ok: true, mensaje: 'Comentario eliminado.' };
    };
    return this.ejecutar(() => this.api.eliminarComentario(id), quitar, quitar);
  }

  // ===================== Moderacion (MODERADOR / ADMINISTRADOR) =====================
  async banear(tipo: TipoContenido, contenidoId: number, motivo: string): Promise<Resultado> {
    const yo = this.sesion.usuario();
    if (!yo || !this.sesion.puedeModerar()) {
      return { ok: false, mensaje: 'Solo un moderador o administrador puede banear contenido.' };
    }
    const registrar = (sancion: Sancion): Resultado => {
      this.cambiarEstado(tipo, contenidoId, 'BANEADO');
      this.almacen.sanciones.set([...this.almacen.sanciones(), sancion]);
      this.almacen.guardar();
      return { ok: true, mensaje: `${tipo === 'TEMA' ? 'Tema' : 'Comentario'} baneado.` };
    };
    return this.ejecutar(
      () => this.api.sancionar(tipo, contenidoId, motivo.trim()),
      creada => registrar(this.aSancion(creada)),
      () => registrar({
        id: this.almacen.siguienteId(this.almacen.sanciones()), tipoContenido: tipo, contenidoId, motivo: motivo.trim(),
        moderadorId: yo.id, fecha: new Date().toISOString(), vigente: true,
      }),
    );
  }

  async restaurar(tipo: TipoContenido, contenidoId: number): Promise<Resultado> {
    if (!this.sesion.puedeModerar()) {
      return { ok: false, mensaje: 'Solo un moderador o administrador puede restaurar contenido.' };
    }
    const sancion = this.almacen.sanciones().find(s => s.tipoContenido === tipo && s.contenidoId === contenidoId && s.vigente);
    return this.ejecutar(
      async () => {
        if (!sancion) {
          throw new ErrorApi(404, 'No se encontró la sanción vigente de este contenido.');
        }
        await this.api.revocarSancion(sancion.id);   // moderacion-ms restaura el contenido en foro-ms
      },
      () => {
        // moderacion-ms elimina la sancion revocada
        this.cambiarEstado(tipo, contenidoId, 'ACTIVO');
        this.almacen.sanciones.set(this.almacen.sanciones().filter(s => s.id !== sancion?.id));
        this.almacen.guardar();
        return { ok: true, mensaje: 'Contenido restaurado.' };
      },
      () => {
        this.cambiarEstado(tipo, contenidoId, 'ACTIVO');
        this.almacen.sanciones.set(this.almacen.sanciones().map(s =>
          s.tipoContenido === tipo && s.contenidoId === contenidoId && s.vigente ? { ...s, vigente: false } : s));
        this.almacen.guardar();
        return { ok: true, mensaje: 'Contenido restaurado.' };
      },
    );
  }

  // ===================== Administracion (ADMINISTRADOR) =====================
  async cambiarRol(usuarioId: number, rol: NombreRol): Promise<Resultado> {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede cambiar roles.' };
    }
    if (usuarioId === this.sesion.usuario()?.id) {
      return { ok: false, mensaje: 'No puedes cambiar tu propio rol.' };
    }
    const aplicar = (): Resultado => {
      this.modificarUsuario(u => u.id === usuarioId, u => ({ ...u, rol }));
      return { ok: true, mensaje: 'Rol actualizado.' };
    };
    return this.ejecutar(() => this.api.actualizarUsuario(usuarioId, { rolId: this.rolesId.get(rol) }), aplicar, aplicar);
  }

  async alternarActivo(usuarioId: number): Promise<Resultado> {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede activar o desactivar cuentas.' };
    }
    if (usuarioId === this.sesion.usuario()?.id) {
      return { ok: false, mensaje: 'No puedes desactivar tu propia cuenta.' };
    }
    const actual = this.almacen.usuarios().find(u => u.id === usuarioId);
    if (!actual) {
      return { ok: false, mensaje: 'El usuario no existe.' };
    }
    const aplicar = (): Resultado => {
      this.modificarUsuario(u => u.id === usuarioId, u => ({ ...u, activo: !actual.activo }));
      return { ok: true, mensaje: 'Estado de la cuenta actualizado.' };
    };
    return this.ejecutar(() => this.api.actualizarUsuario(usuarioId, { activo: !actual.activo }), aplicar, aplicar);
  }

  async crearCategoria(nombre: string, descripcion: string): Promise<Resultado> {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede crear categorías.' };
    }
    const categorias = this.almacen.categorias();
    if (categorias.some(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      return { ok: false, mensaje: 'Ya existe una categoría con ese nombre.' };
    }
    const agregar = (c: Categoria): Resultado => {
      this.almacen.categorias.set([...this.almacen.categorias(), c]);
      this.almacen.guardar();
      return { ok: true, mensaje: 'Categoría creada.' };
    };
    return this.ejecutar(
      () => this.api.crearCategoria(nombre.trim(), descripcion.trim()),
      creada => agregar({ ...creada, icono: 'bi-collection-play' }),
      () => agregar({ id: this.almacen.siguienteId(categorias), nombre: nombre.trim(), descripcion: descripcion.trim(), icono: 'bi-collection-play' }),
    );
  }

  async eliminarCategoria(id: number): Promise<Resultado> {
    if (!this.sesion.esAdministrador()) {
      return { ok: false, mensaje: 'Solo un administrador puede eliminar categorías.' };
    }
    if (this.almacen.temas().some(t => t.categoriaId === id)) {
      return { ok: false, mensaje: 'No se puede eliminar una categoría que tiene temas.' };
    }
    const quitar = (): Resultado => {
      this.almacen.categorias.set(this.almacen.categorias().filter(c => c.id !== id));
      this.almacen.guardar();
      return { ok: true, mensaje: 'Categoría eliminada.' };
    };
    return this.ejecutar(() => this.api.eliminarCategoria(id), quitar, quitar);
  }

  /** Conectado: vuelve a cargar todo desde los microservicios. Modo local: restablece los datos de ejemplo. */
  async restablecerDatos(): Promise<void> {
    this.sesion.cerrar();
    if (this.modo() === 'local') {
      this.almacen.restablecer();
    }
    await this.sincronizar();
  }

  // ===================== Auxiliares =====================
  /**
   * Ejecuta una operacion en el microservicio y, con su respuesta, actualiza los arreglos.
   * - Si el microservicio responde con un error de negocio (400, 401, 403, 409...), se muestra su mensaje.
   * - Si no hay respuesta, se pasa a modo local y se ejecuta la version local de la operacion.
   */
  private async ejecutar<T, R>(
    remota: () => Promise<T>,
    alResponder: (valor: T) => Resultado<R>,
    local: () => Resultado<R>,
    mensajeError: (e: ErrorApi) => string = e => e.message,
  ): Promise<Resultado<R>> {
    if (this.modo() === 'conectando') {
      await this.sincronizando;
    }
    if (this.modo() === 'microservicios') {
      try {
        return alResponder(await remota());
      } catch (e) {
        if (e instanceof ErrorApi) {
          return { ok: false, mensaje: mensajeError(e) };
        }
        this.modo.set('local');
      }
    }
    return local();
  }

  private aUsuario(u: UsuarioApi, previo?: Usuario, password?: string): Usuario {
    const mismo = previo && previo.nombreUsuario === u.nombreUsuario ? previo : undefined;
    return {
      id: u.id,
      nombreUsuario: u.nombreUsuario,
      email: u.email,
      password: password ?? mismo?.password ?? '',
      rol: u.rol.nombre,
      activo: u.activo,
      fechaRegistro: (u.fechaRegistro ?? '').slice(0, 10),
      fechaNacimiento: mismo?.fechaNacimiento,
      bio: mismo?.bio,
      generoFavorito: mismo?.generoFavorito,
    };
  }

  private aTema(t: TemaApi, previo?: Tema): Tema {
    return {
      id: t.id,
      titulo: t.titulo,
      contenido: t.contenido,
      categoriaId: t.categoria.id,
      autorId: t.autorId,
      fecha: t.fechaCreacion,
      estado: t.estado,
      // foro-ms no guarda la marca de spoiler: se conserva la del FrontEnd o se deduce del titulo
      spoiler: previo && previo.titulo === t.titulo ? previo.spoiler : /spoiler/i.test(t.titulo),
    };
  }

  private aComentario(c: ComentarioApi): Comentario {
    return { id: c.id, contenido: c.contenido, temaId: c.temaId, autorId: c.autorId, fecha: c.fechaCreacion, estado: c.estado };
  }

  private aSancion(s: SancionApi): Sancion {
    return { ...s };
  }

  private guardarUsuario(u: Usuario): Usuario {
    const otros = this.almacen.usuarios().filter(x => x.id !== u.id);
    this.almacen.usuarios.set([...otros, u].sort((a, b) => a.id - b.id));
    this.almacen.guardar();
    return u;
  }

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

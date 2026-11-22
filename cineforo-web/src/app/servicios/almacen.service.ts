import { Injectable, signal, WritableSignal } from '@angular/core';
import { Categoria, Comentario, Sancion, Tema, Usuario } from '../modelos/modelos';
import {
  CATEGORIAS_INICIALES, COMENTARIOS_INICIALES, SANCIONES_INICIALES, TEMAS_INICIALES, USUARIOS_INICIALES,
} from '../datos/datos-iniciales';

const CLAVE_STORAGE = 'cineforo-datos-v1';

interface Datos {
  usuarios: Usuario[];
  categorias: Categoria[];
  temas: Tema[];
  comentarios: Comentario[];
  sanciones: Sancion[];
}

/**
 * Almacen de datos del FrontEnd.
 * PATRON SINGLETON: Angular crea una unica instancia (providedIn: 'root') compartida por toda la app.
 * La informacion vive en arreglos (listas) dentro de signals de Angular y se respalda en
 * localStorage para que no se pierda al recargar la pagina.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenService {

  readonly usuarios: WritableSignal<Usuario[]>;
  readonly categorias: WritableSignal<Categoria[]>;
  readonly temas: WritableSignal<Tema[]>;
  readonly comentarios: WritableSignal<Comentario[]>;
  readonly sanciones: WritableSignal<Sancion[]>;

  constructor() {
    const d = this.cargar();
    this.usuarios = signal(d.usuarios);
    this.categorias = signal(d.categorias);
    this.temas = signal(d.temas);
    this.comentarios = signal(d.comentarios);
    this.sanciones = signal(d.sanciones);
  }

  /** Siguiente ID disponible en una lista. */
  siguienteId(lista: { id: number }[]): number {
    return lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;
  }

  guardar(): void {
    const datos: Datos = {
      usuarios: this.usuarios(),
      categorias: this.categorias(),
      temas: this.temas(),
      comentarios: this.comentarios(),
      sanciones: this.sanciones(),
    };
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
    } catch {
      // Sin localStorage (modo privado): los datos quedan solo en memoria
    }
  }

  restablecer(): void {
    const d = this.datosIniciales();
    this.usuarios.set(d.usuarios);
    this.categorias.set(d.categorias);
    this.temas.set(d.temas);
    this.comentarios.set(d.comentarios);
    this.sanciones.set(d.sanciones);
    this.guardar();
  }

  private cargar(): Datos {
    try {
      const texto = localStorage.getItem(CLAVE_STORAGE);
      if (texto) {
        return JSON.parse(texto) as Datos;
      }
    } catch {
      // datos corruptos o sin acceso: se usan los iniciales
    }
    return this.datosIniciales();
  }

  private datosIniciales(): Datos {
    // copias para no modificar las constantes originales
    return structuredClone({
      usuarios: USUARIOS_INICIALES,
      categorias: CATEGORIAS_INICIALES,
      temas: TEMAS_INICIALES,
      comentarios: COMENTARIOS_INICIALES,
      sanciones: SANCIONES_INICIALES,
    });
  }
}

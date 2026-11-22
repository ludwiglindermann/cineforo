import { computed, inject, Injectable, signal } from '@angular/core';
import { AlmacenService } from './almacen.service';
import { NombreRol, Usuario } from '../modelos/modelos';

const CLAVE_SESION = 'cineforo-sesion';

/**
 * Estado de la sesion.
 * PATRON OBSERVER: el usuario conectado es un signal. La barra de navegacion,
 * los guards y las paginas "observan" ese signal y se actualizan solos
 * cuando alguien inicia o cierra sesion, sin tener que avisarles uno por uno.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {

  private readonly almacen = inject(AlmacenService);
  private readonly usuarioId = signal<number | null>(this.leerSesion());

  /** Usuario conectado (o null). Se recalcula si cambia la sesion o los datos del usuario. */
  readonly usuario = computed<Usuario | null>(() => {
    const id = this.usuarioId();
    return id === null ? null : this.almacen.usuarios().find(u => u.id === id && u.activo) ?? null;
  });

  readonly conectado = computed(() => this.usuario() !== null);
  readonly rol = computed<NombreRol | null>(() => this.usuario()?.rol ?? null);
  readonly esAdministrador = computed(() => this.rol() === 'ADMINISTRADOR');
  readonly puedeModerar = computed(() => this.rol() === 'MODERADOR' || this.rol() === 'ADMINISTRADOR');

  iniciar(usuario: Usuario): void {
    this.usuarioId.set(usuario.id);
    this.escribirSesion(usuario.id);
  }

  cerrar(): void {
    this.usuarioId.set(null);
    this.escribirSesion(null);
  }

  tieneRol(roles: NombreRol[]): boolean {
    const r = this.rol();
    return r !== null && roles.includes(r);
  }

  private leerSesion(): number | null {
    try {
      const v = sessionStorage.getItem(CLAVE_SESION);
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  }

  private escribirSesion(id: number | null): void {
    try {
      if (id === null) {
        sessionStorage.removeItem(CLAVE_SESION);
      } else {
        sessionStorage.setItem(CLAVE_SESION, String(id));
      }
    } catch {
      // sin sessionStorage: la sesion dura mientras la pestana este abierta
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';
import { NombreRol } from '../modelos/modelos';
import { sinSoloEspacios } from '../validadores/validadores';

/** Panel de administracion: solo ADMINISTRADOR (protegido por rolGuard). */
@Component({
  selector: 'app-administracion',
  imports: [ReactiveFormsModule, CampoError],
  template: `
    <div class="container py-4">
      <h1 class="h3 fw-bold mb-1"><i class="bi bi-gear me-2 text-ambar"></i>Administración</h1>
      <p class="text-suave">Gestiona los roles y el estado de las cuentas, y las categorías del foro.</p>
      @if (mensaje()) { <div class="alert alert-info py-2">{{ mensaje() }}</div> }

      <div class="row g-4">
        <div class="col-12 col-xl-8">
          <section class="cf-card p-3">
            <h2 class="h5 fw-bold mb-3">Usuarios ({{ foro.usuarios().length }})</h2>
            <div class="table-responsive cf-tabla-responsive">
              <table class="table table-dark align-middle mb-0">
                <thead><tr><th>Usuario</th><th class="d-none d-md-table-cell">Email</th><th>Rol</th><th>Estado</th></tr></thead>
                <tbody>
                  @for (u of foro.usuarios(); track u.id) {
                    <tr>
                      <td>{{ u.nombreUsuario }}</td>
                      <td class="d-none d-md-table-cell">{{ u.email }}</td>
                      <td>
                        <select class="form-select form-select-sm" [value]="u.rol" [disabled]="u.id === foro.sesion.usuario()?.id"
                                (change)="cambiarRol(u.id, $any($event.target).value)" [attr.aria-label]="'Rol de ' + u.nombreUsuario">
                          @for (r of roles; track r) { <option [value]="r" [selected]="r === u.rol">{{ r }}</option> }
                        </select>
                      </td>
                      <td>
                        <button class="btn btn-sm" type="button" [disabled]="u.id === foro.sesion.usuario()?.id"
                                [class.btn-outline-success]="!u.activo" [class.btn-outline-warning]="u.activo"
                                (click)="alternarActivo(u.id)">
                          {{ u.activo ? 'Desactivar' : 'Activar' }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="col-12 col-xl-4">
          <section class="cf-card p-3 mb-4">
            <h2 class="h5 fw-bold mb-3">Nueva categoría</h2>
            <form [formGroup]="form" (ngSubmit)="crearCategoria()" novalidate>
              <div class="mb-2">
                <label for="nombre" class="form-label">Nombre</label>
                <input id="nombre" class="form-control" formControlName="nombre"
                       [class.is-invalid]="form.controls.nombre.invalid && form.controls.nombre.touched">
                <app-campo-error [control]="form.controls.nombre" etiqueta="El nombre" />
              </div>
              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" rows="2" class="form-control" formControlName="descripcion"
                          [class.is-invalid]="form.controls.descripcion.invalid && form.controls.descripcion.touched"></textarea>
                <app-campo-error [control]="form.controls.descripcion" etiqueta="La descripción" />
              </div>
              <button class="btn btn-cf w-100" type="submit">Crear categoría</button>
            </form>
          </section>
          <section class="cf-card p-3">
            <h2 class="h5 fw-bold mb-3">Categorías</h2>
            <ul class="list-group list-group-flush">
              @for (c of foro.categorias(); track c.id) {
                <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                  <span><i class="bi {{ c.icono }} me-2 text-ambar"></i>{{ c.nombre }} <span class="small text-suave">({{ foro.contarTemas(c.id) }})</span></span>
                  <button class="btn btn-sm btn-outline-danger" type="button" (click)="eliminarCategoria(c.id)" [attr.aria-label]="'Eliminar ' + c.nombre"><i class="bi bi-trash"></i></button>
                </li>
              }
            </ul>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class Administracion {
  readonly foro = inject(ForoFacade);
  readonly roles: NombreRol[] = ['USUARIO', 'MODERADOR', 'ADMINISTRADOR'];
  readonly mensaje = signal('');

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), sinSoloEspacios()]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(250), sinSoloEspacios()]],
  });

  async cambiarRol(id: number, rol: NombreRol): Promise<void> {
    this.mensaje.set((await this.foro.cambiarRol(id, rol)).mensaje);
  }

  async alternarActivo(id: number): Promise<void> {
    this.mensaje.set((await this.foro.alternarActivo(id)).mensaje);
  }

  async eliminarCategoria(id: number): Promise<void> {
    this.mensaje.set((await this.foro.eliminarCategoria(id)).mensaje);
  }

  async crearCategoria(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const r = await this.foro.crearCategoria(this.form.controls.nombre.value, this.form.controls.descripcion.value);
    this.mensaje.set(r.mensaje);
    if (r.ok) {
      this.form.reset();
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';
import { sinSoloEspacios } from '../validadores/validadores';

@Component({
  selector: 'app-nuevo-tema',
  imports: [ReactiveFormsModule, CampoError],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="cf-card p-4">
            <h1 class="h3 fw-bold mb-4"><i class="bi bi-plus-circle me-2 text-ambar"></i>Publicar un tema</h1>
            @if (error()) {
              <div class="alert alert-danger py-2" role="alert">{{ error() }}</div>
            }
            <form [formGroup]="form" (ngSubmit)="publicar()" novalidate>
              <div class="row g-3">
                <div class="col-12 col-md-8">
                  <label for="titulo" class="form-label">Título</label>
                  <input id="titulo" class="form-control" formControlName="titulo"
                         [class.is-invalid]="c.titulo.invalid && c.titulo.touched">
                  <app-campo-error [control]="c.titulo" etiqueta="El título" />
                </div>
                <div class="col-12 col-md-4">
                  <label for="categoria" class="form-label">Categoría</label>
                  <select id="categoria" class="form-select" formControlName="categoriaId"
                          [class.is-invalid]="c.categoriaId.invalid && c.categoriaId.touched">
                    <option [ngValue]="0" disabled>Selecciona una</option>
                    @for (cat of foro.categorias(); track cat.id) { <option [ngValue]="cat.id">{{ cat.nombre }}</option> }
                  </select>
                  <app-campo-error [control]="c.categoriaId" etiqueta="La categoría" />
                </div>
                <div class="col-12">
                  <label for="contenido" class="form-label">Contenido <span class="small text-suave">({{ c.contenido.value.length }}/4000)</span></label>
                  <textarea id="contenido" rows="7" class="form-control" formControlName="contenido"
                            [class.is-invalid]="c.contenido.invalid && c.contenido.touched"></textarea>
                  <app-campo-error [control]="c.contenido" etiqueta="El contenido" />
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input id="spoiler" type="checkbox" class="form-check-input" formControlName="spoiler">
                    <label for="spoiler" class="form-check-label">Mi tema contiene spoilers (se ocultará hasta que el lector decida verlo)</label>
                  </div>
                </div>
                <div class="col-12 d-flex gap-2">
                  <button class="btn btn-cf" type="submit"><i class="bi bi-send me-1"></i>Publicar</button>
                  <button class="btn btn-outline-light" type="button" (click)="form.reset()">Limpiar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NuevoTema {
  readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);

  readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150), sinSoloEspacios()]],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    contenido: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000), sinSoloEspacios()]],
    spoiler: [false],
  });
  readonly c = this.form.controls;
  readonly error = signal('');

  async publicar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const r = await this.foro.publicarTema(this.form.getRawValue());
    this.error.set(r.ok ? '' : r.mensaje);
    if (r.ok && r.dato) {
      this.router.navigate(['/tema', r.dato.id]);
    }
  }
}

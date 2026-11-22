import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';
import { sinSoloEspacios } from '../validadores/validadores';

@Component({
  selector: 'app-tema-detalle',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, CampoError],
  template: `
    <div class="container py-4">
      @if (tema(); as t) {
        <nav aria-label="breadcrumb"><ol class="breadcrumb small">
          <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
          <li class="breadcrumb-item"><a [routerLink]="['/categoria', t.categoriaId]">{{ foro.categoria(t.categoriaId)?.nombre }}</a></li>
          <li class="breadcrumb-item active" aria-current="page">Tema</li>
        </ol></nav>

        <div class="row g-4">
          <div class="col-12 col-lg-8">
            <article class="cf-card p-4 mb-4">
              <div class="d-flex justify-content-between gap-2 flex-wrap mb-2">
                <span class="small text-suave"><i class="bi bi-person me-1"></i>{{ foro.nombreAutor(t.autorId) }} · {{ t.fecha | date: 'dd/MM/yyyy HH:mm' }}</span>
                @if (foro.puedeEliminar(t.autorId)) {
                  <button class="btn btn-outline-danger btn-sm" type="button" (click)="eliminarTema()"><i class="bi bi-trash me-1"></i>Eliminar tema</button>
                }
              </div>
              <h1 class="h3 fw-bold">{{ t.titulo }}</h1>
              @if (t.spoiler && !verSpoiler()) {
                <div class="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span><i class="bi bi-exclamation-triangle me-1"></i>Este tema contiene spoilers.</span>
                  <button class="btn btn-sm btn-warning" type="button" (click)="verSpoiler.set(true)">Mostrar de todas formas</button>
                </div>
              } @else {
                <p class="mb-0" style="white-space: pre-line;">{{ t.contenido }}</p>
              }
            </article>

            <h2 class="h5 fw-bold mb-3">{{ comentarios().length }} comentarios</h2>
            @for (c of comentarios(); track c.id) {
              <div class="cf-card p-3 mb-2">
                <div class="d-flex justify-content-between gap-2">
                  <span class="small fw-semibold text-ambar">{{ foro.nombreAutor(c.autorId) }}</span>
                  <span class="small text-suave">{{ c.fecha | date: 'dd/MM/yy HH:mm' }}</span>
                </div>
                <p class="mb-1 mt-1">{{ c.contenido }}</p>
                @if (foro.puedeEliminar(c.autorId)) {
                  <button class="btn btn-link btn-sm text-danger p-0" type="button" (click)="foro.eliminarComentario(c.id)">Eliminar</button>
                }
              </div>
            } @empty {
              <p class="text-suave">Sé el primero en comentar.</p>
            }

            @if (foro.sesion.conectado()) {
              <form class="cf-card p-3 mt-3" [formGroup]="form" (ngSubmit)="comentar()" novalidate>
                <label for="comentario" class="form-label fw-semibold">Tu comentario</label>
                <textarea id="comentario" rows="3" class="form-control" formControlName="contenido"
                          [class.is-invalid]="form.controls.contenido.invalid && form.controls.contenido.touched"></textarea>
                <div class="d-flex justify-content-between align-items-start mt-1">
                  <app-campo-error [control]="form.controls.contenido" etiqueta="El comentario" />
                  <span class="small text-suave ms-auto">{{ form.controls.contenido.value.length }}/1000</span>
                </div>
                <button class="btn btn-cf mt-2" type="submit"><i class="bi bi-send me-1"></i>Comentar</button>
              </form>
            } @else {
              <div class="alert alert-secondary mt-3"><a routerLink="/login">Inicia sesión</a> para comentar.</div>
            }
          </div>

          <aside class="col-12 col-lg-4">
            <div class="cf-card p-3">
              <h2 class="h6 fw-bold">Normas de la comunidad</h2>
              <ul class="small text-suave mb-0 ps-3">
                <li>Marca los spoilers.</li>
                <li>Respeta a los demás.</li>
                <li>Nada de enlaces a piratería.</li>
              </ul>
            </div>
          </aside>
        </div>
      } @else {
        <div class="alert alert-warning">Este tema no existe o fue retirado por la moderación. <a routerLink="/">Volver al inicio</a></div>
      }
    </div>
  `,
})
export class TemaDetalle {
  readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);
  readonly id = input.required<string>();
  readonly verSpoiler = signal(false);
  readonly tema = computed(() => this.foro.tema(Number(this.id())));
  readonly comentarios = computed(() => {
    this.foro.comentariosActivos(); // dependencia para recalcular al comentar o moderar
    return this.foro.comentariosDe(Number(this.id()));
  });

  readonly form = inject(FormBuilder).nonNullable.group({
    contenido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000), sinSoloEspacios()]],
  });

  comentar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const r = this.foro.comentar(Number(this.id()), this.form.controls.contenido.value);
    if (r.ok) {
      this.form.reset();
    }
  }

  eliminarTema(): void {
    if (this.foro.eliminarTema(Number(this.id())).ok) {
      this.router.navigate(['/']);
    }
  }
}

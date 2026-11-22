import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { TarjetaTema } from '../componentes/tarjeta-tema';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, TarjetaTema],
  template: `
    <section class="cf-hero py-5 mb-4">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-7">
            <h1 class="fw-bold">Donde el cine <span class="text-ambar">se conversa</span></h1>
            <p class="lead text-suave">Estrenos, series, anime, reseñas y teorías. Comparte lo que viste y descubre qué ver.</p>
            <div class="d-flex flex-wrap gap-2">
              @if (foro.sesion.conectado()) {
                <a routerLink="/nuevo-tema" class="btn btn-cf btn-lg"><i class="bi bi-plus-circle me-1"></i>Publicar un tema</a>
              } @else {
                <a routerLink="/registro" class="btn btn-cf btn-lg">Únete gratis</a>
                <a routerLink="/login" class="btn btn-outline-light btn-lg">Iniciar sesión</a>
              }
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="row g-2 text-center">
              <div class="col-4"><div class="cf-card p-3"><div class="fs-3 fw-bold text-ambar">{{ foro.estadisticas().usuarios }}</div><div class="small text-suave">Usuarios</div></div></div>
              <div class="col-4"><div class="cf-card p-3"><div class="fs-3 fw-bold text-ambar">{{ foro.estadisticas().temas }}</div><div class="small text-suave">Temas</div></div></div>
              <div class="col-4"><div class="cf-card p-3"><div class="fs-3 fw-bold text-ambar">{{ foro.estadisticas().comentarios }}</div><div class="small text-suave">Comentarios</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <h2 class="h4 fw-bold mb-3">Categorías</h2>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-5 g-3 mb-5">
        @for (c of foro.categorias(); track c.id) {
          <div class="col">
            <a [routerLink]="['/categoria', c.id]" class="text-decoration-none text-reset d-block h-100">
              <div class="cf-card cf-card-hover p-3 h-100">
                <span class="cf-icono-categoria mb-2"><i class="bi {{ c.icono }}"></i></span>
                <h3 class="h6 fw-bold mb-1">{{ c.nombre }}</h3>
                <p class="small text-suave mb-1">{{ c.descripcion }}</p>
                <span class="small text-ambar">{{ foro.contarTemas(c.id) }} {{ foro.contarTemas(c.id) === 1 ? 'tema' : 'temas' }}</span>
              </div>
            </a>
          </div>
        }
      </div>

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <h2 class="h4 fw-bold mb-0">Temas recientes</h2>
        <div class="input-group" style="max-width: 22rem;">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input type="search" class="form-control" placeholder="Buscar temas..." aria-label="Buscar temas"
                 [value]="texto()" (input)="texto.set($any($event.target).value)" maxlength="60">
        </div>
      </div>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        @for (t of temas(); track t.id) {
          <div class="col"><app-tarjeta-tema [tema]="t" /></div>
        } @empty {
          <p class="text-suave">No hay temas que coincidan con "{{ texto() }}".</p>
        }
      </div>
    </div>
  `,
})
export class Inicio {
  readonly foro = inject(ForoFacade);
  readonly texto = signal('');
  readonly temas = computed(() => this.foro.buscarTemas({ texto: this.texto() }).slice(0, 9));
}

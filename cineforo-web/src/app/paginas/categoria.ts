import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { TarjetaTema } from '../componentes/tarjeta-tema';

@Component({
  selector: 'app-categoria',
  imports: [RouterLink, TarjetaTema],
  template: `
    <div class="container py-4">
      @if (categoria(); as c) {
        <nav aria-label="breadcrumb"><ol class="breadcrumb small">
          <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ c.nombre }}</li>
        </ol></nav>
        <div class="row g-3 align-items-center mb-4">
          <div class="col-12 col-md-8 d-flex gap-3 align-items-center">
            <span class="cf-icono-categoria"><i class="bi {{ c.icono }}"></i></span>
            <div>
              <h1 class="h3 fw-bold mb-0">{{ c.nombre }}</h1>
              <p class="text-suave mb-0">{{ c.descripcion }}</p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <input type="search" class="form-control" placeholder="Buscar en {{ c.nombre }}..." [attr.aria-label]="'Buscar en ' + c.nombre"
                   [value]="texto()" (input)="texto.set($any($event.target).value)" maxlength="60">
          </div>
        </div>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          @for (t of temas(); track t.id) {
            <div class="col"><app-tarjeta-tema [tema]="t" /></div>
          } @empty {
            <p class="text-suave">No hay temas en esta categoría todavía.</p>
          }
        </div>
      } @else {
        <div class="alert alert-warning">La categoría no existe. <a routerLink="/">Volver al inicio</a></div>
      }
    </div>
  `,
})
export class CategoriaPagina {
  private readonly foro = inject(ForoFacade);
  readonly id = input.required<string>();     // viene de la ruta /categoria/:id
  readonly texto = signal('');
  readonly categoria = computed(() => this.foro.categoria(Number(this.id())));
  readonly temas = computed(() => this.foro.buscarTemas({ categoriaId: Number(this.id()), texto: this.texto() }));
}

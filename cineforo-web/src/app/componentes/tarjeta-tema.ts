import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { Tema } from '../modelos/modelos';

@Component({
  selector: 'app-tarjeta-tema',
  imports: [RouterLink, DatePipe],
  template: `
    <a [routerLink]="['/tema', tema().id]" class="text-decoration-none text-reset d-block h-100">
      <article class="cf-card cf-card-hover p-3 h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span class="badge text-bg-secondary"><i class="bi {{ categoria()?.icono }} me-1"></i>{{ categoria()?.nombre }}</span>
          @if (tema().spoiler) { <span class="badge badge-cf">Spoiler</span> }
        </div>
        <h3 class="h6 fw-bold mb-2">{{ tema().titulo }}</h3>
        <p class="small text-suave mb-3 flex-grow-1">{{ resumen() }}</p>
        <div class="d-flex justify-content-between small text-suave">
          <span><i class="bi bi-person me-1"></i>{{ foro.nombreAutor(tema().autorId) }}</span>
          <span><i class="bi bi-chat-dots me-1"></i>{{ foro.contarComentarios(tema().id) }} · {{ tema().fecha | date: 'dd/MM/yy' }}</span>
        </div>
      </article>
    </a>
  `,
})
export class TarjetaTema {
  readonly foro = inject(ForoFacade);
  readonly tema = input.required<Tema>();
  readonly categoria = computed(() => this.foro.categoria(this.tema().categoriaId));
  readonly resumen = computed(() => {
    const c = this.tema().contenido;
    return c.length > 120 ? c.slice(0, 117) + '...' : c;
  });
}

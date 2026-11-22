import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';

@Component({
  selector: 'app-pie-pagina',
  template: `
    <footer class="border-top mt-5 py-4" style="border-color: var(--cf-borde) !important;">
      <div class="container">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-6 text-center text-md-start">
            <img src="logo.svg" alt="" width="24" height="24" class="me-2">
            <span class="text-suave small">CineForo · Comunidad de cine, series y anime · DSY2205 Duoc UC</span>
          </div>
          <div class="col-12 col-md-6 text-center text-md-end">
            @switch (foro.modo()) {
              @case ('microservicios') {
                <span class="badge rounded-pill text-bg-success" title="Los datos se leen y guardan en Oracle a través de usuarios-ms, foro-ms y moderacion-ms">
                  <i class="bi bi-hdd-network me-1"></i>Conectado a los microservicios
                </span>
              }
              @case ('local') {
                <span class="badge rounded-pill text-bg-warning" title="Los microservicios no responden: los datos se guardan solo en este navegador">
                  <i class="bi bi-wifi-off me-1"></i>Modo local (sin BackEnd)
                </span>
              }
              @default {
                <span class="badge rounded-pill text-bg-secondary"><i class="bi bi-arrow-repeat me-1"></i>Conectando…</span>
              }
            }
            <button class="btn btn-link btn-sm text-suave" type="button" (click)="restablecer()">
              @if (foro.modo() === 'local') {
                <i class="bi bi-arrow-counterclockwise me-1"></i>Reintentar conexión / restablecer datos
              } @else {
                <i class="bi bi-arrow-repeat me-1"></i>Recargar datos desde el servidor
              }
            </button>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PiePagina {
  readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);

  async restablecer(): Promise<void> {
    await this.foro.restablecerDatos();
    this.router.navigate(['/']);
  }
}

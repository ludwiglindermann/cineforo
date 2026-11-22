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
            <button class="btn btn-link btn-sm text-suave" type="button" (click)="restablecer()">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Restablecer datos de ejemplo
            </button>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PiePagina {
  private readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);

  restablecer(): void {
    this.foro.restablecerDatos();
    this.router.navigate(['/']);
  }
}

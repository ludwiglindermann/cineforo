import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="display-1 fw-bold text-ambar">404</div>
      <h1 class="h4">Esta escena no existe</h1>
      <p class="text-suave">La página que buscas no está en nuestra cartelera.</p>
      <a routerLink="/" class="btn btn-cf">Volver al inicio</a>
    </div>
  `,
})
export class NoEncontrada {}

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="display-1 fw-bold text-ambar"><i class="bi bi-lock"></i></div>
      <h1 class="h4">Acceso restringido</h1>
      <p class="text-suave">Tu rol no tiene permiso para ver esta sección.</p>
      <a routerLink="/" class="btn btn-cf">Volver al inicio</a>
    </div>
  `,
})
export class AccesoDenegado {}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraNavegacion } from './componentes/barra-navegacion';
import { PiePagina } from './componentes/pie-pagina';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarraNavegacion, PiePagina],
  template: `
    <app-barra-navegacion />
    <main><router-outlet /></main>
    <app-pie-pagina />
  `,
})
export class App {}

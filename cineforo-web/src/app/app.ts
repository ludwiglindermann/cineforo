import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BarraNavegacion } from './componentes/barra-navegacion';
import { PiePagina } from './componentes/pie-pagina';
import { ForoFacade } from './servicios/foro-facade.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarraNavegacion, PiePagina],
  template: `
    <app-barra-navegacion />
    <main><router-outlet /></main>
    <app-pie-pagina />
  `,
})
export class App {
  constructor() {
    // Al cambiar de pagina se refrescan los datos desde los microservicios (como maximo cada 10 s)
    const foro = inject(ForoFacade);
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => foro.refrescar());
  }
}

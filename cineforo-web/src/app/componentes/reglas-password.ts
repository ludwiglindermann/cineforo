import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { REGLAS_PASSWORD } from '../validadores/validadores';

/** Lista en vivo de los requisitos de la contrasena (verde cuando se cumplen). */
@Component({
  // Eager: se revisa cada vez que su pagina se revisa (el estado del formulario no es un signal)
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-reglas-password',
  template: `
    <ul class="list-unstyled small mt-2 mb-0 row row-cols-1 row-cols-sm-2 g-1">
      @for (r of reglas; track r.clave) {
        <li class="col" [class.regla-ok]="r.cumple(valor())" [class.regla-pendiente]="!r.cumple(valor())">
          <i class="bi" [class.bi-check-circle-fill]="r.cumple(valor())" [class.bi-circle]="!r.cumple(valor())"></i>
          {{ r.texto }}
        </li>
      }
    </ul>
  `,
})
export class ReglasPassword {
  readonly valor = input('');
  readonly reglas = REGLAS_PASSWORD;
}

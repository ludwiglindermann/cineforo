import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Muestra los mensajes de error de un campo cuando el usuario ya lo toco. */
@Component({
  // Eager: se revisa cada vez que su pagina se revisa (el estado del formulario no es un signal)
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-campo-error',
  template: `
    @if (control()?.invalid && (control()?.touched || control()?.dirty)) {
      @for (m of mensajes(); track m) {
        <div class="invalid-feedback d-block"><i class="bi bi-exclamation-circle me-1"></i>{{ m }}</div>
      }
    }
  `,
})
export class CampoError {
  readonly control = input<AbstractControl | null>(null);
  readonly etiqueta = input('Este campo');
  readonly mensajePatron = input('El formato no es válido');

  mensajes(): string[] {
    const e = this.control()?.errors;
    if (!e) {
      return [];
    }
    const lista: string[] = [];
    if (e['required']) lista.push(`${this.etiqueta()} es obligatorio.`);
    if (e['requiredTrue']) lista.push('Debes aceptar para continuar.');
    if (e['email']) lista.push('Ingresa un email válido (ejemplo: nombre@correo.cl).');
    if (e['minlength']) lista.push(`Debe tener al menos ${e['minlength'].requiredLength} caracteres.`);
    if (e['maxlength']) lista.push(`No puede superar los ${e['maxlength'].requiredLength} caracteres.`);
    if (e['pattern']) lista.push(this.mensajePatron());
    if (e['min']) lista.push('Debes seleccionar una opción.');
    if (e['soloEspacios']) lista.push('No puede contener solo espacios.');
    if (e['edadMinima']) lista.push(`Debes tener al menos ${e['edadMinima'].requerida} años.`);
    if (e['fechaFutura']) lista.push('La fecha no puede ser futura.');
    if (e['fechaInvalida']) lista.push('La fecha no es válida.');
    if (e['nombreOcupado']) lista.push('Ese nombre de usuario ya está en uso.');
    if (e['emailOcupado']) lista.push('Ese email ya está registrado.');
    if (e['emailNoExiste']) lista.push('No hay ninguna cuenta con ese email.');
    if (e['passwordDebil']) lista.push('La contraseña no cumple todos los requisitos de seguridad.');
    if (e['codigoIncorrecto']) lista.push('El código no coincide con el enviado.');
    return lista;
  }
}

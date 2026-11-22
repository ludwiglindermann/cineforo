import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Reglas de seguridad de la contrasena (se muestran como lista en los formularios). */
export const REGLAS_PASSWORD: { clave: string; texto: string; cumple: (v: string) => boolean }[] = [
  { clave: 'minimo', texto: 'Al menos 8 caracteres', cumple: v => v.length >= 8 },
  { clave: 'maximo', texto: 'Máximo 20 caracteres', cumple: v => v.length > 0 && v.length <= 20 },
  { clave: 'mayuscula', texto: 'Una letra mayúscula', cumple: v => /[A-ZÁÉÍÓÚÑ]/.test(v) },
  { clave: 'minuscula', texto: 'Una letra minúscula', cumple: v => /[a-záéíóúñ]/.test(v) },
  { clave: 'numero', texto: 'Un número', cumple: v => /\d/.test(v) },
  { clave: 'especial', texto: 'Un carácter especial (!@#$%&*...)', cumple: v => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(v) },
  { clave: 'espacios', texto: 'Sin espacios', cumple: v => v.length > 0 && !/\s/.test(v) },
];

/** Contrasena segura: debe cumplir TODAS las reglas de REGLAS_PASSWORD. */
export function passwordSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    if (!valor) {
      return null; // "required" se valida aparte
    }
    const fallidas = REGLAS_PASSWORD.filter(r => !r.cumple(valor)).map(r => r.clave);
    return fallidas.length ? { passwordDebil: fallidas } : null;
  };
}

/** Validador de grupo: dos campos deben ser iguales (contrasena y confirmacion). */
export function camposIguales(campo: string, confirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const a = grupo.get(campo)?.value;
    const b = grupo.get(confirmacion)?.value;
    return a && b && a !== b ? { noCoinciden: true } : null;
  };
}

/** No permite textos formados solo por espacios. */
export function sinSoloEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    return typeof v === 'string' && v.length > 0 && v.trim().length === 0 ? { soloEspacios: true } : null;
  };
}

/** Edad minima a partir de una fecha de nacimiento (yyyy-mm-dd). */
export function edadMinima(anios: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const nacimiento = new Date(control.value);
    if (isNaN(nacimiento.getTime())) {
      return { fechaInvalida: true };
    }
    const hoy = new Date();
    if (nacimiento > hoy) {
      return { fechaFutura: true };
    }
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad < anios ? { edadMinima: { requerida: anios } } : null;
  };
}

/** Valida contra una funcion (por ejemplo, "el nombre de usuario ya existe"). */
export function noDebeExistir(existe: (valor: string) => boolean, error: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value && existe(control.value) ? { [error]: true } : null;
}

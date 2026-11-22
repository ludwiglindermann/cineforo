import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';
import { ReglasPassword } from '../componentes/reglas-password';
import { camposIguales, passwordSegura } from '../validadores/validadores';

/** Recuperar contrasena en 3 pasos: email -> codigo -> nueva contrasena. */
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, CampoError, ReglasPassword],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6">
          <div class="cf-card p-4 p-md-5">
            <h1 class="h3 fw-bold mb-1">Recuperar contraseña</h1>
            <p class="text-suave mb-4">Paso {{ paso() }} de 3</p>
            <div class="progress mb-4" role="progressbar" aria-label="Avance" style="height: 6px;">
              <div class="progress-bar bg-warning" [style.width.%]="paso() * 33.4"></div>
            </div>

            @if (paso() === 1) {
              <form [formGroup]="formEmail" (ngSubmit)="enviarEmail()" novalidate>
                <label for="email" class="form-label">Email de tu cuenta</label>
                <input id="email" type="email" class="form-control" formControlName="email"
                       [class.is-invalid]="formEmail.controls.email.invalid && formEmail.controls.email.touched">
                <app-campo-error [control]="formEmail.controls.email" etiqueta="El email" />
                <button type="submit" class="btn btn-cf w-100 mt-4">Enviar código</button>
              </form>
            }

            @if (paso() === 2) {
              <div class="alert alert-info small">
                <i class="bi bi-envelope me-1"></i>Enviamos un código de 6 dígitos a <strong>{{ email() }}</strong>.
                <br><span class="text-suave">(Simulación: el código es <strong>{{ codigo() }}</strong>)</span>
              </div>
              <form [formGroup]="formCodigo" (ngSubmit)="validarCodigo()" novalidate>
                <label for="codigo" class="form-label">Código de verificación</label>
                <input id="codigo" inputmode="numeric" maxlength="6" class="form-control text-center fs-4" formControlName="codigo"
                       [class.is-invalid]="formCodigo.controls.codigo.invalid && formCodigo.controls.codigo.touched">
                <app-campo-error [control]="formCodigo.controls.codigo" etiqueta="El código" mensajePatron="El código tiene exactamente 6 números." />
                <button type="submit" class="btn btn-cf w-100 mt-4">Verificar código</button>
              </form>
            }

            @if (paso() === 3) {
              @if (exito()) {
                <div class="alert alert-success"><i class="bi bi-check-circle me-1"></i>{{ exito() }}</div>
                <a routerLink="/login" class="btn btn-cf w-100">Ir a iniciar sesión</a>
              } @else {
                <form [formGroup]="formPassword" (ngSubmit)="cambiar()" novalidate>
                  <div class="mb-3">
                    <label for="nueva" class="form-label">Nueva contraseña</label>
                    <input id="nueva" type="password" class="form-control" formControlName="nueva" autocomplete="new-password"
                           [class.is-invalid]="formPassword.controls.nueva.invalid && formPassword.controls.nueva.touched">
                    <app-campo-error [control]="formPassword.controls.nueva" etiqueta="La contraseña" />
                    <app-reglas-password [valor]="formPassword.controls.nueva.value" />
                  </div>
                  <label for="confirmar" class="form-label">Confirmar contraseña</label>
                  <input id="confirmar" type="password" class="form-control" formControlName="confirmar" autocomplete="new-password"
                         [class.is-invalid]="formPassword.hasError('noCoinciden') && formPassword.controls.confirmar.touched">
                  <app-campo-error [control]="formPassword.controls.confirmar" etiqueta="La confirmación" />
                  @if (formPassword.hasError('noCoinciden') && formPassword.controls.confirmar.touched) {
                    <div class="invalid-feedback d-block">Las contraseñas no coinciden.</div>
                  }
                  <button type="submit" class="btn btn-cf w-100 mt-4">Guardar nueva contraseña</button>
                </form>
              }
            }
            <p class="text-center small mt-4 mb-0"><a routerLink="/login"><i class="bi bi-arrow-left me-1"></i>Volver a iniciar sesión</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Recuperar {
  private readonly foro = inject(ForoFacade);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly paso = signal(1);
  readonly email = signal('');
  readonly codigo = signal('');
  readonly exito = signal('');

  readonly formEmail = this.fb.group({
    email: ['', [Validators.required, Validators.email,
      (c: AbstractControl): ValidationErrors | null => c.value && !this.foro.existeEmail(c.value) ? { emailNoExiste: true } : null]],
  });

  readonly formCodigo = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/),
      (c: AbstractControl): ValidationErrors | null =>
        /^\d{6}$/.test(c.value) && c.value !== this.codigo() ? { codigoIncorrecto: true } : null]],
  });

  readonly formPassword = this.fb.group({
    nueva: ['', [Validators.required, passwordSegura()]],
    confirmar: ['', Validators.required],
  }, { validators: camposIguales('nueva', 'confirmar') });

  enviarEmail(): void {
    this.formEmail.markAllAsTouched();
    if (this.formEmail.invalid) {
      return;
    }
    const r = this.foro.solicitarRecuperacion(this.formEmail.controls.email.value);
    if (r.ok && r.dato) {
      this.email.set(this.formEmail.controls.email.value);
      this.codigo.set(r.dato);
      this.paso.set(2);
    }
  }

  validarCodigo(): void {
    this.formCodigo.markAllAsTouched();
    if (this.formCodigo.valid) {
      this.paso.set(3);
    }
  }

  async cambiar(): Promise<void> {
    this.formPassword.markAllAsTouched();
    if (this.formPassword.invalid) {
      return;
    }
    this.exito.set((await this.foro.restablecerPassword(this.email(), this.formPassword.controls.nueva.value)).mensaje);
  }
}

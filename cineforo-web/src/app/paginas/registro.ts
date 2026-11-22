import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';
import { ReglasPassword } from '../componentes/reglas-password';
import { GENEROS } from '../datos/datos-iniciales';
import { camposIguales, edadMinima, noDebeExistir, passwordSegura } from '../validadores/validadores';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, CampoError, ReglasPassword],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-7">
          <div class="cf-card p-4 p-md-5">
            <h1 class="h3 fw-bold mb-1">Crear cuenta</h1>
            <p class="text-suave mb-4">Únete a la comunidad de CineForo</p>

            @if (error()) { <div class="alert alert-danger py-2" role="alert">{{ error() }}</div> }

            <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label for="nombreUsuario" class="form-label">Nombre de usuario</label>
                  <input id="nombreUsuario" class="form-control" formControlName="nombreUsuario" autocomplete="username"
                         [class.is-invalid]="c.nombreUsuario.invalid && c.nombreUsuario.touched">
                  <div class="form-text">3 a 20 caracteres: letras, números y _</div>
                  <app-campo-error [control]="c.nombreUsuario" etiqueta="El nombre de usuario"
                                   mensajePatron="Solo letras, números y guion bajo (_), sin espacios." />
                </div>
                <div class="col-12 col-md-6">
                  <label for="email" class="form-label">Email</label>
                  <input id="email" type="email" class="form-control" formControlName="email" autocomplete="email"
                         [class.is-invalid]="c.email.invalid && c.email.touched">
                  <app-campo-error [control]="c.email" etiqueta="El email" />
                </div>
                <div class="col-12 col-md-6">
                  <label for="fechaNacimiento" class="form-label">Fecha de nacimiento</label>
                  <input id="fechaNacimiento" type="date" class="form-control" formControlName="fechaNacimiento"
                         [class.is-invalid]="c.fechaNacimiento.invalid && c.fechaNacimiento.touched">
                  <app-campo-error [control]="c.fechaNacimiento" etiqueta="La fecha de nacimiento" />
                </div>
                <div class="col-12 col-md-6">
                  <label for="genero" class="form-label">Género favorito</label>
                  <select id="genero" class="form-select" formControlName="generoFavorito"
                          [class.is-invalid]="c.generoFavorito.invalid && c.generoFavorito.touched">
                    <option value="" disabled>Selecciona uno</option>
                    @for (g of generos; track g) { <option [value]="g">{{ g }}</option> }
                  </select>
                  <app-campo-error [control]="c.generoFavorito" etiqueta="El género favorito" />
                </div>
                <div class="col-12 col-md-6">
                  <label for="password" class="form-label">Contraseña</label>
                  <input id="password" type="password" class="form-control" formControlName="password" autocomplete="new-password"
                         [class.is-invalid]="c.password.invalid && c.password.touched">
                  <app-campo-error [control]="c.password" etiqueta="La contraseña" />
                </div>
                <div class="col-12 col-md-6">
                  <label for="confirmar" class="form-label">Confirmar contraseña</label>
                  <input id="confirmar" type="password" class="form-control" formControlName="confirmar" autocomplete="new-password"
                         [class.is-invalid]="(c.confirmar.invalid || form.hasError('noCoinciden')) && c.confirmar.touched">
                  <app-campo-error [control]="c.confirmar" etiqueta="La confirmación" />
                  @if (form.hasError('noCoinciden') && c.confirmar.touched) {
                    <div class="invalid-feedback d-block"><i class="bi bi-exclamation-circle me-1"></i>Las contraseñas no coinciden.</div>
                  }
                </div>
                <div class="col-12">
                  <app-reglas-password [valor]="c.password.value" />
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input id="terminos" type="checkbox" class="form-check-input" formControlName="terminos"
                           [class.is-invalid]="c.terminos.invalid && c.terminos.touched">
                    <label for="terminos" class="form-check-label">Acepto las normas de la comunidad (sin spoilers sin aviso, sin piratería, sin ofensas)</label>
                    <app-campo-error [control]="c.terminos" etiqueta="Aceptar las normas" />
                  </div>
                </div>
                <div class="col-12">
                  <button type="submit" class="btn btn-cf w-100 py-2">Crear cuenta</button>
                </div>
              </div>
            </form>
            <p class="text-center small text-suave mt-4 mb-0">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Registro {
  private readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);
  readonly generos = GENEROS;
  readonly error = signal('');

  readonly form = inject(FormBuilder).nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_]+$/), noDebeExistir(v => this.foro.existeNombreUsuario(v), 'nombreOcupado')]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120),
      noDebeExistir(v => this.foro.existeEmail(v), 'emailOcupado')]],
    fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
    generoFavorito: ['', Validators.required],
    password: ['', [Validators.required, passwordSegura()]],
    confirmar: ['', Validators.required],
    terminos: [false, Validators.requiredTrue],
  }, { validators: camposIguales('password', 'confirmar') });

  readonly c = this.form.controls;

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    const r = this.foro.registrar(v);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.router.navigate(['/']);
  }
}

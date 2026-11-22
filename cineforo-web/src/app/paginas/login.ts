import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CampoError],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-7 col-lg-5">
          <div class="cf-card p-4 p-md-5">
            <div class="text-center mb-4">
              <img src="logo.svg" alt="" width="56" height="56">
              <h1 class="h3 fw-bold mt-2">Iniciar sesión</h1>
              <p class="text-suave small mb-0">Vuelve a la conversación sobre cine y series</p>
            </div>

            @if (error()) { <div class="alert alert-danger py-2" role="alert">{{ error() }}</div> }

            <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
              <div class="mb-3">
                <label for="usuario" class="form-label">Nombre de usuario o email</label>
                <input id="usuario" type="text" class="form-control" formControlName="usuario" autocomplete="username"
                       [class.is-invalid]="form.controls.usuario.invalid && form.controls.usuario.touched">
                <app-campo-error [control]="form.controls.usuario" etiqueta="El usuario" />
              </div>
              <div class="mb-2">
                <label for="password" class="form-label">Contraseña</label>
                <div class="input-group">
                  <input id="password" [type]="ver() ? 'text' : 'password'" class="form-control" formControlName="password"
                         autocomplete="current-password"
                         [class.is-invalid]="form.controls.password.invalid && form.controls.password.touched">
                  <button class="btn btn-outline-secondary" type="button" (click)="ver.set(!ver())" [attr.aria-label]="ver() ? 'Ocultar' : 'Mostrar'">
                    <i class="bi" [class.bi-eye]="!ver()" [class.bi-eye-slash]="ver()"></i>
                  </button>
                </div>
                <app-campo-error [control]="form.controls.password" etiqueta="La contraseña" />
              </div>
              <div class="text-end mb-4"><a routerLink="/recuperar" class="small">¿Olvidaste tu contraseña?</a></div>
              <button type="submit" class="btn btn-cf w-100 py-2">Ingresar</button>
            </form>

            <p class="text-center small text-suave mt-4 mb-0">¿No tienes cuenta? <a routerLink="/registro">Regístrate</a></p>
            <p class="text-center small text-suave mt-2 mb-0">Demo: <code>admin_cineforo</code>, <code>ana_moderadora</code> o <code>juan_cinefilo</code> · clave <code>Cine2026!</code></p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  readonly ver = signal(false);
  readonly error = signal('');

  readonly form = inject(FormBuilder).nonNullable.group({
    usuario: ['', [Validators.required, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
  });

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const r = this.foro.iniciarSesion(this.form.controls.usuario.value, this.form.controls.password.value);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.router.navigateByUrl(this.ruta.snapshot.queryParamMap.get('volver') ?? '/');
  }
}

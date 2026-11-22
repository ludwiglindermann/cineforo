import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForoFacade } from '../servicios/foro-facade.service';
import { CampoError } from '../componentes/campo-error';
import { ReglasPassword } from '../componentes/reglas-password';
import { TarjetaTema } from '../componentes/tarjeta-tema';
import { GENEROS } from '../datos/datos-iniciales';
import { camposIguales, noDebeExistir, passwordSegura, sinSoloEspacios } from '../validadores/validadores';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, DatePipe, CampoError, ReglasPassword, TarjetaTema],
  template: `
    @if (foro.sesion.usuario(); as u) {
      <div class="container py-4">
        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-4">
          <div class="cf-icono-categoria" style="width: 4rem; height: 4rem;"><i class="bi bi-person-fill fs-2"></i></div>
          <div>
            <h1 class="h3 fw-bold mb-0">{{ u.nombreUsuario }}</h1>
            <span class="badge badge-cf">{{ u.rol }}</span>
            <span class="text-suave small ms-2">Miembro desde {{ u.fechaRegistro | date: 'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12 col-lg-6">
            <section class="cf-card p-4 h-100">
              <h2 class="h5 fw-bold mb-3"><i class="bi bi-pencil me-2 text-ambar"></i>Modificar perfil</h2>
              @if (msgPerfil()) { <div class="alert py-2" [class.alert-success]="okPerfil()" [class.alert-danger]="!okPerfil()">{{ msgPerfil() }}</div> }
              <form [formGroup]="formPerfil" (ngSubmit)="guardarPerfil()" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input id="email" type="email" class="form-control" formControlName="email"
                         [class.is-invalid]="formPerfil.controls.email.invalid && formPerfil.controls.email.touched">
                  <app-campo-error [control]="formPerfil.controls.email" etiqueta="El email" />
                </div>
                <div class="mb-3">
                  <label for="genero" class="form-label">Género favorito</label>
                  <select id="genero" class="form-select" formControlName="generoFavorito">
                    @for (g of generos; track g) { <option [value]="g">{{ g }}</option> }
                  </select>
                  <app-campo-error [control]="formPerfil.controls.generoFavorito" etiqueta="El género" />
                </div>
                <div class="mb-3">
                  <label for="bio" class="form-label">Sobre mí <span class="text-suave small">({{ formPerfil.controls.bio.value.length }}/200)</span></label>
                  <textarea id="bio" rows="3" class="form-control" formControlName="bio"
                            [class.is-invalid]="formPerfil.controls.bio.invalid && formPerfil.controls.bio.touched"></textarea>
                  <app-campo-error [control]="formPerfil.controls.bio" etiqueta="La descripción" />
                </div>
                <button class="btn btn-cf" type="submit">Guardar cambios</button>
              </form>
            </section>
          </div>

          <div class="col-12 col-lg-6">
            <section class="cf-card p-4 h-100">
              <h2 class="h5 fw-bold mb-3"><i class="bi bi-key me-2 text-ambar"></i>Cambiar contraseña</h2>
              @if (msgPass()) { <div class="alert py-2" [class.alert-success]="okPass()" [class.alert-danger]="!okPass()">{{ msgPass() }}</div> }
              <form [formGroup]="formPass" (ngSubmit)="cambiarPassword()" novalidate>
                <div class="mb-3">
                  <label for="actual" class="form-label">Contraseña actual</label>
                  <input id="actual" type="password" class="form-control" formControlName="actual" autocomplete="current-password"
                         [class.is-invalid]="formPass.controls.actual.invalid && formPass.controls.actual.touched">
                  <app-campo-error [control]="formPass.controls.actual" etiqueta="La contraseña actual" />
                </div>
                <div class="mb-3">
                  <label for="nueva" class="form-label">Nueva contraseña</label>
                  <input id="nueva" type="password" class="form-control" formControlName="nueva" autocomplete="new-password"
                         [class.is-invalid]="formPass.controls.nueva.invalid && formPass.controls.nueva.touched">
                  <app-campo-error [control]="formPass.controls.nueva" etiqueta="La nueva contraseña" />
                  <app-reglas-password [valor]="formPass.controls.nueva.value" />
                </div>
                <div class="mb-3">
                  <label for="confirmar" class="form-label">Confirmar nueva contraseña</label>
                  <input id="confirmar" type="password" class="form-control" formControlName="confirmar" autocomplete="new-password"
                         [class.is-invalid]="formPass.hasError('noCoinciden') && formPass.controls.confirmar.touched">
                  <app-campo-error [control]="formPass.controls.confirmar" etiqueta="La confirmación" />
                  @if (formPass.hasError('noCoinciden') && formPass.controls.confirmar.touched) {
                    <div class="invalid-feedback d-block">Las contraseñas no coinciden.</div>
                  }
                </div>
                <button class="btn btn-cf" type="submit">Actualizar contraseña</button>
              </form>
            </section>
          </div>
        </div>

        <h2 class="h5 fw-bold mt-5 mb-3">Mis temas</h2>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          @for (t of foro.buscarTemas({ autorId: u.id }); track t.id) {
            <div class="col"><app-tarjeta-tema [tema]="t" /></div>
          } @empty {
            <p class="text-suave">Aún no has publicado temas.</p>
          }
        </div>
      </div>
    }
  `,
})
export class Perfil {
  readonly foro = inject(ForoFacade);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly generos = GENEROS;
  readonly msgPerfil = signal('');
  readonly okPerfil = signal(false);
  readonly msgPass = signal('');
  readonly okPass = signal(false);

  private readonly yo = this.foro.sesion.usuario()!;

  readonly formPerfil = this.fb.group({
    email: [this.yo.email, [Validators.required, Validators.email, Validators.maxLength(120),
      noDebeExistir(v => this.foro.existeEmail(v, this.yo.id), 'emailOcupado')]],
    generoFavorito: [this.yo.generoFavorito ?? GENEROS[0], Validators.required],
    bio: [this.yo.bio ?? '', [Validators.maxLength(200), sinSoloEspacios()]],
  });

  readonly formPass = this.fb.group({
    actual: ['', Validators.required],
    nueva: ['', [Validators.required, passwordSegura()]],
    confirmar: ['', Validators.required],
  }, { validators: camposIguales('nueva', 'confirmar') });

  async guardarPerfil(): Promise<void> {
    this.formPerfil.markAllAsTouched();
    if (this.formPerfil.invalid) {
      return;
    }
    const r = await this.foro.actualizarPerfil(this.formPerfil.getRawValue());
    this.okPerfil.set(r.ok);
    this.msgPerfil.set(r.mensaje);
  }

  async cambiarPassword(): Promise<void> {
    this.formPass.markAllAsTouched();
    if (this.formPass.invalid) {
      return;
    }
    const r = await this.foro.cambiarPassword(this.formPass.controls.actual.value, this.formPass.controls.nueva.value);
    this.okPass.set(r.ok);
    this.msgPass.set(r.mensaje);
    if (r.ok) {
      this.formPass.reset();
    }
  }
}

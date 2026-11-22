import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';

@Component({
  selector: 'app-barra-navegacion',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg border-bottom sticky-top" style="background: var(--cf-surface); border-color: var(--cf-borde) !important;">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" routerLink="/">
          <img src="logo.svg" alt="" width="36" height="36">
          <span>Cine<span class="text-ambar">Foro</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal"
                aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menú">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="menuPrincipal">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <i class="bi bi-house me-1"></i>Inicio
              </a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-grid me-1"></i>Categorías
              </a>
              <ul class="dropdown-menu">
                @for (c of foro.categorias(); track c.id) {
                  <li><a class="dropdown-item" [routerLink]="['/categoria', c.id]"><i class="bi {{ c.icono }} me-2"></i>{{ c.nombre }}</a></li>
                }
              </ul>
            </li>
            @if (foro.sesion.conectado()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/nuevo-tema" routerLinkActive="active"><i class="bi bi-plus-circle me-1"></i>Nuevo tema</a>
              </li>
            }
            @if (foro.sesion.puedeModerar()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/moderacion" routerLinkActive="active"><i class="bi bi-shield-check me-1"></i>Moderación</a>
              </li>
            }
            @if (foro.sesion.esAdministrador()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin" routerLinkActive="active"><i class="bi bi-gear me-1"></i>Administración</a>
              </li>
            }
          </ul>

          @if (foro.sesion.usuario(); as u) {
            <div class="dropdown">
              <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i>{{ u.nombreUsuario }}
                <span class="badge badge-cf ms-1">{{ u.rol }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" routerLink="/perfil"><i class="bi bi-person-gear me-2"></i>Mi perfil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" type="button" (click)="salir()"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>
              </ul>
            </div>
          } @else {
            <div class="d-flex gap-2">
              <a class="btn btn-outline-light btn-sm" routerLink="/login">Iniciar sesión</a>
              <a class="btn btn-cf btn-sm" routerLink="/registro">Registrarse</a>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
})
export class BarraNavegacion {
  readonly foro = inject(ForoFacade);
  private readonly router = inject(Router);

  salir(): void {
    this.foro.cerrarSesion();
    this.router.navigate(['/']);
  }
}

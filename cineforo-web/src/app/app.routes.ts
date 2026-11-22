import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './guards/guards';

/** Rutas de CineForo. Las paginas se cargan bajo demanda (lazy loading). */
export const routes: Routes = [
  { path: '', title: 'CineForo | Inicio', loadComponent: () => import('./paginas/inicio').then(m => m.Inicio) },
  { path: 'login', title: 'CineForo | Iniciar sesión', canActivate: [invitadoGuard], loadComponent: () => import('./paginas/login').then(m => m.Login) },
  { path: 'registro', title: 'CineForo | Registro', canActivate: [invitadoGuard], loadComponent: () => import('./paginas/registro').then(m => m.Registro) },
  { path: 'recuperar', title: 'CineForo | Recuperar contraseña', loadComponent: () => import('./paginas/recuperar').then(m => m.Recuperar) },
  { path: 'perfil', title: 'CineForo | Mi perfil', canActivate: [authGuard], loadComponent: () => import('./paginas/perfil').then(m => m.Perfil) },
  { path: 'categoria/:id', title: 'CineForo | Categoría', loadComponent: () => import('./paginas/categoria').then(m => m.CategoriaPagina) },
  { path: 'tema/:id', title: 'CineForo | Tema', loadComponent: () => import('./paginas/tema-detalle').then(m => m.TemaDetalle) },
  { path: 'nuevo-tema', title: 'CineForo | Nuevo tema', canActivate: [authGuard], loadComponent: () => import('./paginas/nuevo-tema').then(m => m.NuevoTema) },
  { path: 'moderacion', title: 'CineForo | Moderación', canActivate: [rolGuard('MODERADOR', 'ADMINISTRADOR')], loadComponent: () => import('./paginas/moderacion').then(m => m.Moderacion) },
  { path: 'admin', title: 'CineForo | Administración', canActivate: [rolGuard('ADMINISTRADOR')], loadComponent: () => import('./paginas/administracion').then(m => m.Administracion) },
  { path: 'acceso-denegado', title: 'CineForo | Acceso restringido', loadComponent: () => import('./paginas/errores').then(m => m.AccesoDenegado) },
  { path: '**', title: 'CineForo | No encontrada', loadComponent: () => import('./paginas/errores').then(m => m.NoEncontrada) },
];

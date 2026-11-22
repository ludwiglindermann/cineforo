import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../servicios/sesion.service';
import { NombreRol } from '../modelos/modelos';

/** Solo usuarios conectados. Si no, lleva al inicio de sesion y luego vuelve. */
export const authGuard: CanActivateFn = (_route, state) => {
  const sesion = inject(SesionService);
  return sesion.conectado()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { volver: state.url } });
};

/** Solo usuarios con alguno de los roles indicados. */
export function rolGuard(...roles: NombreRol[]): CanActivateFn {
  return (_route, state) => {
    const sesion = inject(SesionService);
    const router = inject(Router);
    if (!sesion.conectado()) {
      return router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
    }
    return sesion.tieneRol(roles) ? true : router.createUrlTree(['/acceso-denegado']);
  };
}

/** Las paginas de login y registro no tienen sentido si ya hay sesion. */
export const invitadoGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.conectado() ? inject(Router).createUrlTree(['/']) : true;
};

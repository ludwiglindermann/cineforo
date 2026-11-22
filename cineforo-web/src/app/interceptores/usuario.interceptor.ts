import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionService } from '../servicios/sesion.service';

/**
 * PATRON CHAIN OF RESPONSIBILITY (interceptor HTTP de Angular).
 * Cada peticion a los microservicios pasa por este eslabon antes de salir:
 * si hay sesion iniciada, agrega el header X-Usuario-Id que los microservicios
 * usan para validar los permisos por rol. Asi ninguna pagina tiene que acordarse de hacerlo.
 */
export const usuarioInterceptor: HttpInterceptorFn = (req, next) => {
  const usuario = inject(SesionService).usuario();
  if (usuario && req.url.startsWith('/api/') && !req.headers.has('X-Usuario-Id')) {
    req = req.clone({ setHeaders: { 'X-Usuario-Id': String(usuario.id) } });
  }
  return next(req);
};

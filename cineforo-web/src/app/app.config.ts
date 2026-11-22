import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { usuarioInterceptor } from './interceptores/usuario.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: los parametros de la ruta (:id) llegan como input() al componente
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Cliente HTTP para los microservicios; el interceptor agrega X-Usuario-Id
    provideHttpClient(withFetch(), withInterceptors([usuarioInterceptor])),
  ],
};

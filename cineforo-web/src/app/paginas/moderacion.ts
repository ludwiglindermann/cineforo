import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../servicios/foro-facade.service';
import { TipoContenido } from '../modelos/modelos';

/** Panel de moderacion: solo MODERADOR y ADMINISTRADOR (protegido por rolGuard). */
@Component({
  selector: 'app-moderacion',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <h1 class="h3 fw-bold mb-1"><i class="bi bi-shield-check me-2 text-ambar"></i>Moderación</h1>
      <p class="text-suave">Banea temas o comentarios que incumplan las normas y restaura los que fueron revisados.</p>

      @if (mensaje()) { <div class="alert alert-info py-2">{{ mensaje() }}</div> }

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item"><button class="nav-link" [class.active]="pestana() === 'temas'" (click)="pestana.set('temas')" type="button">Temas activos</button></li>
        <li class="nav-item"><button class="nav-link" [class.active]="pestana() === 'comentarios'" (click)="pestana.set('comentarios')" type="button">Comentarios</button></li>
        <li class="nav-item"><button class="nav-link" [class.active]="pestana() === 'baneado'" (click)="pestana.set('baneado')" type="button">
          Baneado <span class="badge badge-cf">{{ foro.temasBaneados().length + foro.comentariosBaneados().length }}</span></button></li>
        <li class="nav-item"><button class="nav-link" [class.active]="pestana() === 'historial'" (click)="pestana.set('historial')" type="button">Historial</button></li>
      </ul>

      <div class="cf-card p-3 mb-3">
        <label for="motivo" class="form-label small fw-semibold">Motivo de la sanción (obligatorio para banear, mínimo 5 caracteres)</label>
        <input id="motivo" class="form-control" [(ngModel)]="motivo" maxlength="300" placeholder="Ej: Publica enlaces a sitios de piratería">
      </div>

      @switch (pestana()) {
        @case ('temas') {
          <div class="table-responsive cf-tabla-responsive">
            <table class="table table-dark table-hover align-middle mb-0">
              <thead><tr><th>Tema</th><th class="d-none d-md-table-cell">Autor</th><th class="d-none d-lg-table-cell">Categoría</th><th class="text-end">Acción</th></tr></thead>
              <tbody>
                @for (t of foro.temasActivos(); track t.id) {
                  <tr>
                    <td><a [routerLink]="['/tema', t.id]">{{ t.titulo }}</a></td>
                    <td class="d-none d-md-table-cell">{{ foro.nombreAutor(t.autorId) }}</td>
                    <td class="d-none d-lg-table-cell">{{ foro.categoria(t.categoriaId)?.nombre }}</td>
                    <td class="text-end"><button class="btn btn-sm btn-outline-danger" type="button" (click)="banear('TEMA', t.id)"><i class="bi bi-slash-circle me-1"></i>Banear</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @case ('comentarios') {
          <div class="table-responsive cf-tabla-responsive">
            <table class="table table-dark table-hover align-middle mb-0">
              <thead><tr><th>Comentario</th><th class="d-none d-md-table-cell">Autor</th><th class="text-end">Acción</th></tr></thead>
              <tbody>
                @for (c of foro.comentariosActivos(); track c.id) {
                  <tr>
                    <td>{{ c.contenido }}</td>
                    <td class="d-none d-md-table-cell">{{ foro.nombreAutor(c.autorId) }}</td>
                    <td class="text-end"><button class="btn btn-sm btn-outline-danger" type="button" (click)="banear('COMENTARIO', c.id)"><i class="bi bi-slash-circle me-1"></i>Banear</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @case ('baneado') {
          <div class="row row-cols-1 row-cols-md-2 g-3">
            @for (t of foro.temasBaneados(); track t.id) {
              <div class="col"><div class="cf-card p-3 h-100">
                <span class="badge text-bg-danger mb-2">Tema baneado</span>
                <p class="fw-semibold mb-1">{{ t.titulo }}</p>
                <p class="small text-suave">Autor: {{ foro.nombreAutor(t.autorId) }}</p>
                <button class="btn btn-sm btn-outline-success" type="button" (click)="restaurar('TEMA', t.id)"><i class="bi bi-arrow-counterclockwise me-1"></i>Restaurar</button>
              </div></div>
            }
            @for (c of foro.comentariosBaneados(); track c.id) {
              <div class="col"><div class="cf-card p-3 h-100">
                <span class="badge text-bg-danger mb-2">Comentario baneado</span>
                <p class="mb-1">{{ c.contenido }}</p>
                <p class="small text-suave">Autor: {{ foro.nombreAutor(c.autorId) }}</p>
                <button class="btn btn-sm btn-outline-success" type="button" (click)="restaurar('COMENTARIO', c.id)"><i class="bi bi-arrow-counterclockwise me-1"></i>Restaurar</button>
              </div></div>
            }
          </div>
        }
        @case ('historial') {
          <div class="table-responsive cf-tabla-responsive">
            <table class="table table-dark align-middle mb-0">
              <thead><tr><th>Tipo</th><th>ID</th><th>Motivo</th><th class="d-none d-md-table-cell">Moderador</th><th class="d-none d-lg-table-cell">Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                @for (s of foro.sanciones(); track s.id) {
                  <tr>
                    <td>{{ s.tipoContenido }}</td><td>{{ s.contenidoId }}</td><td>{{ s.motivo }}</td>
                    <td class="d-none d-md-table-cell">{{ foro.nombreAutor(s.moderadorId) }}</td>
                    <td class="d-none d-lg-table-cell">{{ s.fecha | date: 'dd/MM/yy HH:mm' }}</td>
                    <td><span class="badge" [class.text-bg-danger]="s.vigente" [class.text-bg-secondary]="!s.vigente">{{ s.vigente ? 'Vigente' : 'Revocada' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
})
export class Moderacion {
  readonly foro = inject(ForoFacade);
  readonly pestana = signal<'temas' | 'comentarios' | 'baneado' | 'historial'>('temas');
  readonly mensaje = signal('');
  motivo = '';

  banear(tipo: TipoContenido, id: number): void {
    if (this.motivo.trim().length < 5) {
      this.mensaje.set('Escribe un motivo de al menos 5 caracteres antes de banear.');
      return;
    }
    this.mensaje.set(this.foro.banear(tipo, id, this.motivo).mensaje);
    this.motivo = '';
  }

  restaurar(tipo: TipoContenido, id: number): void {
    this.mensaje.set(this.foro.restaurar(tipo, id).mensaje);
  }
}

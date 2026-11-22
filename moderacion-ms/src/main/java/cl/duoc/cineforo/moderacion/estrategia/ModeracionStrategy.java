package cl.duoc.cineforo.moderacion.estrategia;

import cl.duoc.cineforo.moderacion.model.TipoContenido;

/**
 * PATRON DE DISENO: STRATEGY (comportamiento).
 *
 * Cada tipo de contenido (tema o comentario) tiene su propia estrategia para
 * banearlo o restaurarlo. SancionService elige la estrategia segun el tipo,
 * sin if/else, y agregar un nuevo tipo solo requiere una nueva clase.
 */
public interface ModeracionStrategy {

    /** Tipo de contenido que atiende esta estrategia. */
    TipoContenido tipo();

    /** Oculta el contenido en el foro (estado BANEADO). */
    void banear(Long contenidoId, Long moderadorId);

    /** Vuelve a mostrar el contenido en el foro (estado ACTIVO). */
    void restaurar(Long contenidoId, Long moderadorId);
}

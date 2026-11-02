package cl.duoc.cineforo.foro.dto;

import cl.duoc.cineforo.foro.model.Tema;
import java.time.LocalDateTime;

/** Resumen de un tema, usado en los listados y busquedas. */
public record TemaResponse(
        Long id,
        String titulo,
        String contenido,
        CategoriaResponse categoria,
        Long autorId,
        LocalDateTime fechaCreacion,
        String estado,
        long cantidadComentarios) {

    public static TemaResponse desde(Tema t, long cantidadComentarios) {
        return new TemaResponse(
                t.getId(),
                t.getTitulo(),
                t.getContenido(),
                CategoriaResponse.desde(t.getCategoria()),
                t.getUsuarioId(),
                t.getFechaCreacion(),
                t.getEstado().name(),
                cantidadComentarios);
    }
}

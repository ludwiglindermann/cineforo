package cl.duoc.cineforo.foro.dto;

import cl.duoc.cineforo.foro.model.Tema;
import java.time.LocalDateTime;
import java.util.List;

/** Tema completo, con sus comentarios. Se usa al ver un tema por su ID. */
public record TemaDetalleResponse(
        Long id,
        String titulo,
        String contenido,
        CategoriaResponse categoria,
        Long autorId,
        LocalDateTime fechaCreacion,
        String estado,
        List<ComentarioResponse> comentarios) {

    public static TemaDetalleResponse desde(Tema t, List<ComentarioResponse> comentarios) {
        return new TemaDetalleResponse(
                t.getId(),
                t.getTitulo(),
                t.getContenido(),
                CategoriaResponse.desde(t.getCategoria()),
                t.getUsuarioId(),
                t.getFechaCreacion(),
                t.getEstado().name(),
                comentarios);
    }
}

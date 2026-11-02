package cl.duoc.cineforo.foro.dto;

import cl.duoc.cineforo.foro.model.Comentario;
import java.time.LocalDateTime;

public record ComentarioResponse(
        Long id,
        String contenido,
        Long temaId,
        Long autorId,
        LocalDateTime fechaCreacion,
        String estado) {

    public static ComentarioResponse desde(Comentario c) {
        return new ComentarioResponse(
                c.getId(),
                c.getContenido(),
                c.getTema().getId(),
                c.getUsuarioId(),
                c.getFechaCreacion(),
                c.getEstado().name());
    }
}

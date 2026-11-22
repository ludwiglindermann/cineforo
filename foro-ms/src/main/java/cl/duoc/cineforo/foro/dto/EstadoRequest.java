package cl.duoc.cineforo.foro.dto;

import cl.duoc.cineforo.foro.model.EstadoContenido;
import jakarta.validation.constraints.NotNull;

/** Nuevo estado de un tema o comentario: ACTIVO o BANEADO. */
public record EstadoRequest(

        @NotNull(message = "Debe indicar el estado: ACTIVO o BANEADO")
        EstadoContenido estado) {
}

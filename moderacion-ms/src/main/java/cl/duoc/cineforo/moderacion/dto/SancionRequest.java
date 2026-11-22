package cl.duoc.cineforo.moderacion.dto;

import cl.duoc.cineforo.moderacion.model.TipoContenido;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Datos para banear un tema o comentario. */
public record SancionRequest(

        @NotNull(message = "Debe indicar el tipo de contenido: TEMA o COMENTARIO")
        TipoContenido tipoContenido,

        @NotNull(message = "Debe indicar el ID del contenido")
        @Positive(message = "El ID del contenido debe ser positivo")
        Long contenidoId,

        @NotBlank(message = "Debe indicar el motivo de la sancion")
        @Size(min = 5, max = 300, message = "El motivo debe tener entre 5 y 300 caracteres")
        String motivo) {
}

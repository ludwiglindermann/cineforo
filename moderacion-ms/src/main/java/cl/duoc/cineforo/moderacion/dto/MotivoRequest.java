package cl.duoc.cineforo.moderacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Nuevo motivo para una sancion existente. */
public record MotivoRequest(

        @NotBlank(message = "Debe indicar el motivo de la sancion")
        @Size(min = 5, max = 300, message = "El motivo debe tener entre 5 y 300 caracteres")
        String motivo) {
}

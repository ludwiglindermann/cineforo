package cl.duoc.cineforo.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos para publicar o editar un comentario. El autor se toma del header X-Usuario-Id. */
public record ComentarioRequest(

        @NotBlank(message = "El comentario no puede estar vacio")
        @Size(max = 2000, message = "El comentario no puede superar los 2000 caracteres")
        String contenido) {
}

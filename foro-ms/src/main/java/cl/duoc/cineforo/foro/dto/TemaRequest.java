package cl.duoc.cineforo.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Datos para publicar o editar un tema. El autor se toma del header X-Usuario-Id. */
public record TemaRequest(

        @NotBlank(message = "El titulo es obligatorio")
        @Size(min = 5, max = 150, message = "El titulo debe tener entre 5 y 150 caracteres")
        String titulo,

        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 4000, message = "El contenido no puede superar los 4000 caracteres")
        String contenido,

        @NotNull(message = "Debe indicar la categoria (categoriaId)")
        Long categoriaId) {
}

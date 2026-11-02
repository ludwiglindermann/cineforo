package cl.duoc.cineforo.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos para crear o actualizar un rol. */
public record RolRequest(

        @NotBlank(message = "El nombre del rol es obligatorio")
        @Size(max = 30, message = "El nombre del rol no puede superar los 30 caracteres")
        @Pattern(regexp = "^[A-Z_]+$", message = "El nombre del rol debe ir en MAYUSCULAS, sin espacios (ej: EDITOR)")
        String nombre,

        @NotBlank(message = "La descripcion es obligatoria")
        @Size(max = 200, message = "La descripcion no puede superar los 200 caracteres")
        String descripcion) {
}

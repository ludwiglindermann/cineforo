package cl.duoc.cineforo.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos para modificar un usuario. Todos los campos son opcionales:
 * solo se cambian los que vienen en el JSON.
 * rolId y activo solo los puede cambiar un ADMINISTRADOR.
 */
public record UsuarioUpdateRequest(

        @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "El nombre de usuario solo admite letras, numeros y _")
        String nombreUsuario,

        @Email(message = "El email no tiene un formato valido")
        @Size(max = 120, message = "El email no puede superar los 120 caracteres")
        String email,

        @Size(min = 8, max = 72, message = "La contrasena debe tener entre 8 y 72 caracteres")
        String password,

        Long rolId,

        Boolean activo) {
}

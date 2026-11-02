package cl.duoc.cineforo.usuarios.dto;

import jakarta.validation.constraints.NotBlank;

/** Credenciales de inicio de sesion. "usuario" acepta nombre de usuario o email. */
public record LoginRequest(

        @NotBlank(message = "Debe indicar el nombre de usuario o email")
        String usuario,

        @NotBlank(message = "Debe indicar la contrasena")
        String password) {
}

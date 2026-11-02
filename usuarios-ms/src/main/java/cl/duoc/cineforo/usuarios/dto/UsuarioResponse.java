package cl.duoc.cineforo.usuarios.dto;

import cl.duoc.cineforo.usuarios.model.Usuario;
import java.time.LocalDateTime;

/** Lo que se devuelve de un usuario. Nunca incluye la contrasena. */
public record UsuarioResponse(
        Long id,
        String nombreUsuario,
        String email,
        RolResponse rol,
        LocalDateTime fechaRegistro,
        boolean activo) {

    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNombreUsuario(),
                u.getEmail(),
                RolResponse.desde(u.getRol()),
                u.getFechaRegistro(),
                Boolean.TRUE.equals(u.getActivo()));
    }
}

package cl.duoc.cineforo.moderacion.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Usuario tal como lo devuelve usuarios-ms (GET /api/usuarios/{id}). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UsuarioRemoto(Long id, String nombreUsuario, RolRemoto rol, boolean activo) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RolRemoto(Long id, String nombre) {
    }

    public String nombreRol() {
        return rol == null ? null : rol.nombre();
    }

    public boolean puedeModerar() {
        return "MODERADOR".equals(nombreRol()) || "ADMINISTRADOR".equals(nombreRol());
    }
}

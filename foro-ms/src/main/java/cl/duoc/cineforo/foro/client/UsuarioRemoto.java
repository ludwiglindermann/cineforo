package cl.duoc.cineforo.foro.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Datos de un usuario tal como los devuelve el microservicio de Usuarios
 * (GET /api/usuarios/{id}). Solo se toman los campos que este servicio necesita.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UsuarioRemoto(Long id, String nombreUsuario, RolRemoto rol, boolean activo) {

    public static final String MODERADOR = "MODERADOR";
    public static final String ADMINISTRADOR = "ADMINISTRADOR";

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RolRemoto(Long id, String nombre) {
    }

    public String nombreRol() {
        return rol == null ? null : rol.nombre();
    }

    public boolean esAdministrador() {
        return ADMINISTRADOR.equals(nombreRol());
    }

    /** Moderadores y administradores pueden editar o eliminar contenido de otros. */
    public boolean puedeModerar() {
        return MODERADOR.equals(nombreRol()) || esAdministrador();
    }
}

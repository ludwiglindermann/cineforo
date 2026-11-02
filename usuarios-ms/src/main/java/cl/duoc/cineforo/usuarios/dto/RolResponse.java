package cl.duoc.cineforo.usuarios.dto;

import cl.duoc.cineforo.usuarios.model.Rol;

public record RolResponse(Long id, String nombre, String descripcion) {

    public static RolResponse desde(Rol rol) {
        return new RolResponse(rol.getId(), rol.getNombre(), rol.getDescripcion());
    }
}

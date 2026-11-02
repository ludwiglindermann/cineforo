package cl.duoc.cineforo.usuarios.service;

import cl.duoc.cineforo.usuarios.exception.AccesoDenegadoException;
import cl.duoc.cineforo.usuarios.exception.NoAutenticadoException;
import cl.duoc.cineforo.usuarios.model.Usuario;
import cl.duoc.cineforo.usuarios.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

/**
 * Identifica a quien hace la peticion (header X-Usuario-Id) y revisa
 * si su rol le permite hacer la operacion.
 */
@Service
public class PermisoService {

    private final UsuarioRepository usuarioRepository;

    public PermisoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /** Devuelve el usuario que hace la peticion, o lanza 401 si no se identifica. */
    public Usuario obtenerActor(Long actorId) {
        if (actorId == null) {
            throw new NoAutenticadoException("Debe enviar el header X-Usuario-Id con el ID del usuario que realiza la accion");
        }
        Usuario actor = usuarioRepository.findById(actorId)
                .orElseThrow(() -> new NoAutenticadoException("El usuario con ID " + actorId + " no existe"));
        if (!Boolean.TRUE.equals(actor.getActivo())) {
            throw new AccesoDenegadoException("La cuenta del usuario " + actor.getNombreUsuario() + " esta desactivada");
        }
        return actor;
    }

    /** Exige que quien hace la peticion sea ADMINISTRADOR (403 si no lo es). */
    public Usuario exigirAdministrador(Long actorId) {
        Usuario actor = obtenerActor(actorId);
        if (!actor.esAdministrador()) {
            throw new AccesoDenegadoException("Solo un ADMINISTRADOR puede realizar esta accion");
        }
        return actor;
    }
}

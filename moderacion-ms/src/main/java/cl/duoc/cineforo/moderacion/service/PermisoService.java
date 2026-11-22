package cl.duoc.cineforo.moderacion.service;

import cl.duoc.cineforo.moderacion.client.UsuarioClient;
import cl.duoc.cineforo.moderacion.client.UsuarioRemoto;
import cl.duoc.cineforo.moderacion.comun.excepcion.AccesoDenegadoException;
import cl.duoc.cineforo.moderacion.comun.excepcion.NoAutenticadoException;
import org.springframework.stereotype.Service;

/** Solo MODERADOR o ADMINISTRADOR pueden sancionar contenido. */
@Service
public class PermisoService {

    private final UsuarioClient usuarioClient;

    public PermisoService(UsuarioClient usuarioClient) {
        this.usuarioClient = usuarioClient;
    }

    public UsuarioRemoto exigirModerador(Long actorId) {
        if (actorId == null) {
            throw new NoAutenticadoException("Debe enviar el header X-Usuario-Id con el ID del moderador");
        }
        UsuarioRemoto actor = usuarioClient.obtenerUsuario(actorId);
        if (actor == null || !actor.activo()) {
            throw new AccesoDenegadoException("La cuenta del usuario " + actorId + " esta desactivada");
        }
        if (!actor.puedeModerar()) {
            throw new AccesoDenegadoException("Solo un MODERADOR o un ADMINISTRADOR puede moderar el foro");
        }
        return actor;
    }
}

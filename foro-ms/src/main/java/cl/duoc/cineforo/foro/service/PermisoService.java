package cl.duoc.cineforo.foro.service;

import cl.duoc.cineforo.foro.client.UsuarioClient;
import cl.duoc.cineforo.foro.client.UsuarioRemoto;
import cl.duoc.cineforo.foro.exception.AccesoDenegadoException;
import cl.duoc.cineforo.foro.exception.NoAutenticadoException;
import org.springframework.stereotype.Service;

/**
 * Reglas de permisos del foro segun el rol:
 * - USUARIO: publica y comenta; edita o elimina solo su propio contenido.
 * - MODERADOR: ademas, edita o elimina contenido de cualquier usuario.
 * - ADMINISTRADOR: ademas, gestiona las categorias.
 */
@Service
public class PermisoService {

    private final UsuarioClient usuarioClient;

    public PermisoService(UsuarioClient usuarioClient) {
        this.usuarioClient = usuarioClient;
    }

    /** Identifica a quien hace la peticion (header X-Usuario-Id) consultando al microservicio de Usuarios. */
    public UsuarioRemoto obtenerActor(Long actorId) {
        if (actorId == null) {
            throw new NoAutenticadoException("Debe enviar el header X-Usuario-Id con el ID del usuario que realiza la accion");
        }
        UsuarioRemoto actor = usuarioClient.obtenerUsuario(actorId);
        if (actor == null || !actor.activo()) {
            throw new AccesoDenegadoException("La cuenta del usuario " + actorId + " esta desactivada");
        }
        return actor;
    }

    public UsuarioRemoto exigirAdministrador(Long actorId) {
        UsuarioRemoto actor = obtenerActor(actorId);
        if (!actor.esAdministrador()) {
            throw new AccesoDenegadoException("Solo un ADMINISTRADOR puede gestionar las categorias");
        }
        return actor;
    }

    /** El autor puede modificar su contenido; un MODERADOR o ADMINISTRADOR puede modificar cualquiera. */
    public UsuarioRemoto exigirAutorOModerador(Long actorId, Long autorId, String queSeModifica) {
        UsuarioRemoto actor = obtenerActor(actorId);
        if (!actor.id().equals(autorId) && !actor.puedeModerar()) {
            throw new AccesoDenegadoException("Solo el autor, un MODERADOR o un ADMINISTRADOR puede modificar " + queSeModifica);
        }
        return actor;
    }
}

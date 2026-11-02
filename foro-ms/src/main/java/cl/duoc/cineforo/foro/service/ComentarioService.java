package cl.duoc.cineforo.foro.service;

import cl.duoc.cineforo.foro.client.UsuarioRemoto;
import cl.duoc.cineforo.foro.dto.ComentarioRequest;
import cl.duoc.cineforo.foro.dto.ComentarioResponse;
import cl.duoc.cineforo.foro.exception.RecursoNoEncontradoException;
import cl.duoc.cineforo.foro.model.Comentario;
import cl.duoc.cineforo.foro.model.EstadoContenido;
import cl.duoc.cineforo.foro.model.Tema;
import cl.duoc.cineforo.foro.repository.ComentarioRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComentarioService {

    private static final Logger log = LoggerFactory.getLogger(ComentarioService.class);

    private final ComentarioRepository comentarioRepository;
    private final TemaService temaService;
    private final PermisoService permisoService;

    public ComentarioService(ComentarioRepository comentarioRepository, TemaService temaService,
                             PermisoService permisoService) {
        this.comentarioRepository = comentarioRepository;
        this.temaService = temaService;
        this.permisoService = permisoService;
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponse> listarPorTema(Long temaId) {
        temaService.buscarActivo(temaId);
        return comentarioRepository.findByTema_IdAndEstadoOrderByFechaCreacionAsc(temaId, EstadoContenido.ACTIVO)
                .stream().map(ComentarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ComentarioResponse obtener(Long id) {
        return ComentarioResponse.desde(buscarActivo(id));
    }

    @Transactional
    public ComentarioResponse comentar(Long temaId, ComentarioRequest datos, Long actorId) {
        Tema tema = temaService.buscarActivo(temaId);
        UsuarioRemoto autor = permisoService.obtenerActor(actorId);
        Comentario comentario = new Comentario();
        comentario.setContenido(datos.contenido());
        comentario.setTema(tema);
        comentario.setUsuarioId(autor.id());
        Comentario guardado = comentarioRepository.save(comentario);
        log.info("Comentario publicado en el tema {} (ID {}) por {}", temaId, guardado.getId(), autor.nombreUsuario());
        return ComentarioResponse.desde(guardado);
    }

    @Transactional
    public ComentarioResponse actualizar(Long id, ComentarioRequest datos, Long actorId) {
        Comentario comentario = buscarActivo(id);
        UsuarioRemoto actor = permisoService.exigirAutorOModerador(actorId, comentario.getUsuarioId(), "este comentario");
        comentario.setContenido(datos.contenido());
        Comentario guardado = comentarioRepository.save(comentario);
        log.info("Comentario actualizado: ID {} por {} ({})", id, actor.nombreUsuario(), actor.nombreRol());
        return ComentarioResponse.desde(guardado);
    }

    @Transactional
    public void eliminar(Long id, Long actorId) {
        Comentario comentario = buscar(id);
        UsuarioRemoto actor = permisoService.exigirAutorOModerador(actorId, comentario.getUsuarioId(), "este comentario");
        comentarioRepository.delete(comentario);
        log.info("Comentario eliminado: ID {} por {} ({})", id, actor.nombreUsuario(), actor.nombreRol());
    }

    private Comentario buscar(Long id) {
        return comentarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el comentario con ID " + id));
    }

    private Comentario buscarActivo(Long id) {
        Comentario comentario = buscar(id);
        if (comentario.getEstado() != EstadoContenido.ACTIVO) {
            throw new RecursoNoEncontradoException("El comentario con ID " + id + " no esta disponible (fue baneado por la moderacion)");
        }
        return comentario;
    }
}

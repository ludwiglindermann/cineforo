package cl.duoc.cineforo.foro.service;

import cl.duoc.cineforo.foro.client.UsuarioRemoto;
import cl.duoc.cineforo.foro.dto.ComentarioResponse;
import cl.duoc.cineforo.foro.dto.TemaDetalleResponse;
import cl.duoc.cineforo.foro.dto.TemaRequest;
import cl.duoc.cineforo.foro.dto.TemaResponse;
import cl.duoc.cineforo.foro.exception.RecursoNoEncontradoException;
import cl.duoc.cineforo.foro.model.EstadoContenido;
import cl.duoc.cineforo.foro.model.Tema;
import cl.duoc.cineforo.foro.repository.ComentarioRepository;
import cl.duoc.cineforo.foro.repository.TemaRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TemaService {

    private static final Logger log = LoggerFactory.getLogger(TemaService.class);

    private final TemaRepository temaRepository;
    private final ComentarioRepository comentarioRepository;
    private final CategoriaService categoriaService;
    private final PermisoService permisoService;

    public TemaService(TemaRepository temaRepository, ComentarioRepository comentarioRepository,
                       CategoriaService categoriaService, PermisoService permisoService) {
        this.temaRepository = temaRepository;
        this.comentarioRepository = comentarioRepository;
        this.categoriaService = categoriaService;
        this.permisoService = permisoService;
    }

    /** Busca temas activos. Todos los filtros son opcionales. */
    @Transactional(readOnly = true)
    public List<TemaResponse> buscar(Long categoriaId, Long autorId, String texto) {
        String filtroTexto = (texto == null || texto.isBlank()) ? null : texto.trim();
        return temaRepository.buscar(EstadoContenido.ACTIVO, categoriaId, autorId, filtroTexto).stream()
                .map(t -> TemaResponse.desde(t,
                        comentarioRepository.countByTema_IdAndEstado(t.getId(), EstadoContenido.ACTIVO)))
                .toList();
    }

    /** Ver un tema con todos sus comentarios activos. */
    @Transactional(readOnly = true)
    public TemaDetalleResponse obtener(Long id) {
        Tema tema = buscarActivo(id);
        List<ComentarioResponse> comentarios = comentarioRepository
                .findByTema_IdAndEstadoOrderByFechaCreacionAsc(id, EstadoContenido.ACTIVO).stream()
                .map(ComentarioResponse::desde)
                .toList();
        return TemaDetalleResponse.desde(tema, comentarios);
    }

    @Transactional
    public TemaResponse publicar(TemaRequest datos, Long actorId) {
        UsuarioRemoto autor = permisoService.obtenerActor(actorId);
        Tema tema = new Tema();
        tema.setTitulo(datos.titulo());
        tema.setContenido(datos.contenido());
        tema.setCategoria(categoriaService.buscar(datos.categoriaId()));
        tema.setUsuarioId(autor.id());
        Tema guardado = temaRepository.save(tema);
        log.info("Tema publicado: '{}' (ID {}) por {}", guardado.getTitulo(), guardado.getId(), autor.nombreUsuario());
        return TemaResponse.desde(guardado, 0);
    }

    @Transactional
    public TemaResponse actualizar(Long id, TemaRequest datos, Long actorId) {
        Tema tema = buscarActivo(id);
        UsuarioRemoto actor = permisoService.exigirAutorOModerador(actorId, tema.getUsuarioId(), "este tema");
        tema.setTitulo(datos.titulo());
        tema.setContenido(datos.contenido());
        tema.setCategoria(categoriaService.buscar(datos.categoriaId()));
        Tema guardado = temaRepository.save(tema);
        log.info("Tema actualizado: ID {} por {} ({})", id, actor.nombreUsuario(), actor.nombreRol());
        return TemaResponse.desde(guardado,
                comentarioRepository.countByTema_IdAndEstado(id, EstadoContenido.ACTIVO));
    }

    /** Elimina el tema. Sus comentarios se eliminan en Oracle por ON DELETE CASCADE. */
    @Transactional
    public void eliminar(Long id, Long actorId) {
        Tema tema = buscar(id);
        UsuarioRemoto actor = permisoService.exigirAutorOModerador(actorId, tema.getUsuarioId(), "este tema");
        temaRepository.delete(tema);
        log.info("Tema eliminado: ID {} por {} ({})", id, actor.nombreUsuario(), actor.nombreRol());
    }

    Tema buscar(Long id) {
        return temaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el tema con ID " + id));
    }

    /** Un tema BANEADO no se muestra ni se puede comentar o editar. */
    Tema buscarActivo(Long id) {
        Tema tema = buscar(id);
        if (tema.getEstado() != EstadoContenido.ACTIVO) {
            throw new RecursoNoEncontradoException("El tema con ID " + id + " no esta disponible (fue baneado por la moderacion)");
        }
        return tema;
    }
}

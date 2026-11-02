package cl.duoc.cineforo.foro.service;

import cl.duoc.cineforo.foro.dto.CategoriaRequest;
import cl.duoc.cineforo.foro.dto.CategoriaResponse;
import cl.duoc.cineforo.foro.exception.ConflictoException;
import cl.duoc.cineforo.foro.exception.RecursoNoEncontradoException;
import cl.duoc.cineforo.foro.model.Categoria;
import cl.duoc.cineforo.foro.repository.CategoriaRepository;
import cl.duoc.cineforo.foro.repository.TemaRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService {

    private static final Logger log = LoggerFactory.getLogger(CategoriaService.class);

    private final CategoriaRepository categoriaRepository;
    private final TemaRepository temaRepository;
    private final PermisoService permisoService;

    public CategoriaService(CategoriaRepository categoriaRepository, TemaRepository temaRepository,
                            PermisoService permisoService) {
        this.categoriaRepository = categoriaRepository;
        this.temaRepository = temaRepository;
        this.permisoService = permisoService;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll().stream().map(CategoriaResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        return CategoriaResponse.desde(buscar(id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        if (categoriaRepository.existsByNombreIgnoreCase(datos.nombre())) {
            throw new ConflictoException("Ya existe una categoria llamada " + datos.nombre());
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(datos.nombre());
        categoria.setDescripcion(datos.descripcion());
        Categoria guardada = categoriaRepository.save(categoria);
        log.info("Categoria creada: {} (ID {})", guardada.getNombre(), guardada.getId());
        return CategoriaResponse.desde(guardada);
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Categoria categoria = buscar(id);
        if (!categoria.getNombre().equalsIgnoreCase(datos.nombre())
                && categoriaRepository.existsByNombreIgnoreCase(datos.nombre())) {
            throw new ConflictoException("Ya existe una categoria llamada " + datos.nombre());
        }
        categoria.setNombre(datos.nombre());
        categoria.setDescripcion(datos.descripcion());
        log.info("Categoria actualizada: ID {}", id);
        return CategoriaResponse.desde(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Long id, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Categoria categoria = buscar(id);
        if (temaRepository.existsByCategoria_Id(id)) {
            throw new ConflictoException("No se puede eliminar la categoria " + categoria.getNombre()
                    + " porque tiene temas publicados");
        }
        categoriaRepository.delete(categoria);
        log.info("Categoria eliminada: {} (ID {})", categoria.getNombre(), id);
    }

    Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro la categoria con ID " + id));
    }
}

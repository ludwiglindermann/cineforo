package cl.duoc.cineforo.foro.service;

import cl.duoc.cineforo.foro.comun.excepcion.ConflictoException;
import cl.duoc.cineforo.foro.comun.patron.CrudServiceBase;
import cl.duoc.cineforo.foro.dto.CategoriaRequest;
import cl.duoc.cineforo.foro.dto.CategoriaResponse;
import cl.duoc.cineforo.foro.model.Categoria;
import cl.duoc.cineforo.foro.repository.CategoriaRepository;
import cl.duoc.cineforo.foro.repository.TemaRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de categorias. PATRON TEMPLATE METHOD: el flujo CRUD viene de
 * CrudServiceBase (arquetipo); aqui solo se implementan los pasos propios
 * de Categoria y la regla de que solo un ADMINISTRADOR las gestiona.
 */
@Service
public class CategoriaService extends CrudServiceBase<Categoria, Long, CategoriaRequest, CategoriaResponse> {

    private final CategoriaRepository categoriaRepository;
    private final TemaRepository temaRepository;
    private final PermisoService permisoService;

    public CategoriaService(CategoriaRepository categoriaRepository, TemaRepository temaRepository,
                            PermisoService permisoService) {
        this.categoriaRepository = categoriaRepository;
        this.temaRepository = temaRepository;
        this.permisoService = permisoService;
    }

    // ---------- Pasos del Template Method ----------
    @Override
    protected JpaRepository<Categoria, Long> repositorio() {
        return categoriaRepository;
    }

    @Override
    protected Categoria crearEntidad(CategoriaRequest datos) {
        Categoria categoria = new Categoria();
        categoria.setNombre(datos.nombre());
        categoria.setDescripcion(datos.descripcion());
        return categoria;
    }

    @Override
    protected void actualizarEntidad(Categoria categoria, CategoriaRequest datos) {
        categoria.setNombre(datos.nombre());
        categoria.setDescripcion(datos.descripcion());
    }

    @Override
    protected CategoriaResponse aRespuesta(Categoria categoria) {
        return CategoriaResponse.desde(categoria);
    }

    @Override
    protected String nombreRecurso() {
        return "la categoria";
    }

    // ---------- Operaciones con permisos ----------
    @Transactional
    public CategoriaResponse crear(CategoriaRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        if (categoriaRepository.existsByNombreIgnoreCase(datos.nombre())) {
            throw new ConflictoException("Ya existe una categoria llamada " + datos.nombre());
        }
        return crear(datos);
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Categoria actual = buscar(id);
        if (!actual.getNombre().equalsIgnoreCase(datos.nombre())
                && categoriaRepository.existsByNombreIgnoreCase(datos.nombre())) {
            throw new ConflictoException("Ya existe una categoria llamada " + datos.nombre());
        }
        return actualizar(id, datos);
    }

    @Transactional
    public void eliminar(Long id, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Categoria categoria = buscar(id);
        if (temaRepository.existsByCategoria_Id(id)) {
            throw new ConflictoException("No se puede eliminar la categoria " + categoria.getNombre()
                    + " porque tiene temas publicados");
        }
        eliminar(id);
    }

    /** Usado por TemaService para asociar la categoria a un tema. */
    public Categoria buscarCategoria(Long id) {
        return buscar(id);
    }
}

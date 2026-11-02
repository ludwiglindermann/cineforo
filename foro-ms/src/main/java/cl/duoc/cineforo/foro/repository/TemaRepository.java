package cl.duoc.cineforo.foro.repository;

import cl.duoc.cineforo.foro.model.EstadoContenido;
import cl.duoc.cineforo.foro.model.Tema;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TemaRepository extends JpaRepository<Tema, Long> {

    /**
     * Busqueda de temas con filtros opcionales (si un filtro viene null, no se aplica):
     * categoria, autor y texto en el titulo o el contenido.
     */
    @Query("SELECT t FROM Tema t "
            + "WHERE t.estado = :estado "
            + "AND (:categoriaId IS NULL OR t.categoria.id = :categoriaId) "
            + "AND (:autorId IS NULL OR t.usuarioId = :autorId) "
            + "AND (:texto IS NULL "
            + "     OR LOWER(t.titulo) LIKE LOWER(CONCAT('%', :texto, '%')) "
            + "     OR LOWER(t.contenido) LIKE LOWER(CONCAT('%', :texto, '%'))) "
            + "ORDER BY t.fechaCreacion DESC")
    List<Tema> buscar(@Param("estado") EstadoContenido estado,
                      @Param("categoriaId") Long categoriaId,
                      @Param("autorId") Long autorId,
                      @Param("texto") String texto);

    boolean existsByCategoria_Id(Long categoriaId);
}

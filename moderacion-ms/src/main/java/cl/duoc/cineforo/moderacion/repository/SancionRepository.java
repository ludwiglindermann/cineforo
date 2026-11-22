package cl.duoc.cineforo.moderacion.repository;

import cl.duoc.cineforo.moderacion.model.Sancion;
import cl.duoc.cineforo.moderacion.model.TipoContenido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SancionRepository extends JpaRepository<Sancion, Long> {

    List<Sancion> findByVigenteOrderByFechaDesc(Boolean vigente);

    List<Sancion> findAllByOrderByFechaDesc();

    boolean existsByTipoContenidoAndContenidoIdAndVigente(TipoContenido tipo, Long contenidoId, Boolean vigente);
}

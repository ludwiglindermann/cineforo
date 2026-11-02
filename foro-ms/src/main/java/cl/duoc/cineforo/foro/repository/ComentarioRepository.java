package cl.duoc.cineforo.foro.repository;

import cl.duoc.cineforo.foro.model.Comentario;
import cl.duoc.cineforo.foro.model.EstadoContenido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    List<Comentario> findByTema_IdAndEstadoOrderByFechaCreacionAsc(Long temaId, EstadoContenido estado);

    long countByTema_IdAndEstado(Long temaId, EstadoContenido estado);
}

package cl.duoc.cineforo.usuarios.comun.patron;

import cl.duoc.cineforo.usuarios.comun.excepcion.RecursoNoEncontradoException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * PATRON DE DISENO: TEMPLATE METHOD (comportamiento).
 *
 * Define el "esqueleto" de las operaciones CRUD (listar, obtener, crear,
 * actualizar, eliminar) una sola vez. Cada servicio concreto hereda de esta
 * clase e implementa solo los pasos que cambian segun la entidad:
 * como crearla, como actualizarla y como convertirla a la respuesta JSON.
 *
 * @param <E>   entidad JPA
 * @param <ID>  tipo del identificador
 * @param <REQ> DTO de entrada (request)
 * @param <RES> DTO de salida (response)
 */
public abstract class CrudServiceBase<E, ID, REQ, RES> {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    // ---------- Pasos que implementa cada servicio concreto ----------
    protected abstract JpaRepository<E, ID> repositorio();

    protected abstract E crearEntidad(REQ datos);

    protected abstract void actualizarEntidad(E entidad, REQ datos);

    protected abstract RES aRespuesta(E entidad);

    protected abstract String nombreRecurso();

    // ---------- Metodos plantilla (flujo comun, no se modifican) ----------
    @Transactional(readOnly = true)
    public List<RES> listar() {
        log.debug("Listando {}", nombreRecurso());
        return repositorio().findAll().stream().map(this::aRespuesta).toList();
    }

    @Transactional(readOnly = true)
    public RES obtener(ID id) {
        return aRespuesta(buscar(id));
    }

    @Transactional
    public RES crear(REQ datos) {
        E guardada = repositorio().save(crearEntidad(datos));
        log.info("{} creado", nombreRecurso());
        return aRespuesta(guardada);
    }

    @Transactional
    public RES actualizar(ID id, REQ datos) {
        E entidad = buscar(id);
        actualizarEntidad(entidad, datos);
        log.info("{} con ID {} actualizado", nombreRecurso(), id);
        return aRespuesta(repositorio().save(entidad));
    }

    @Transactional
    public void eliminar(ID id) {
        E entidad = buscar(id);
        repositorio().delete(entidad);
        log.info("{} con ID {} eliminado", nombreRecurso(), id);
    }

    protected E buscar(ID id) {
        return repositorio().findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontro " + nombreRecurso() + " con ID " + id));
    }
}

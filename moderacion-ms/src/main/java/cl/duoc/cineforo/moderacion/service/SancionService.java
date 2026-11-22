package cl.duoc.cineforo.moderacion.service;

import cl.duoc.cineforo.moderacion.client.UsuarioRemoto;
import cl.duoc.cineforo.moderacion.comun.excepcion.ConflictoException;
import cl.duoc.cineforo.moderacion.comun.excepcion.RecursoNoEncontradoException;
import cl.duoc.cineforo.moderacion.dto.MotivoRequest;
import cl.duoc.cineforo.moderacion.dto.SancionRequest;
import cl.duoc.cineforo.moderacion.dto.SancionResponse;
import cl.duoc.cineforo.moderacion.estrategia.ModeracionStrategy;
import cl.duoc.cineforo.moderacion.model.Sancion;
import cl.duoc.cineforo.moderacion.model.TipoContenido;
import cl.duoc.cineforo.moderacion.repository.SancionRepository;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logica de moderacion. Usa el patron STRATEGY: recibe todas las estrategias
 * disponibles (una por tipo de contenido) y elige la que corresponde.
 */
@Service
public class SancionService {

    private static final Logger log = LoggerFactory.getLogger(SancionService.class);

    private final SancionRepository sancionRepository;
    private final PermisoService permisoService;
    private final Map<TipoContenido, ModeracionStrategy> estrategias = new EnumMap<>(TipoContenido.class);

    public SancionService(SancionRepository sancionRepository, PermisoService permisoService,
                          List<ModeracionStrategy> estrategiasDisponibles) {
        this.sancionRepository = sancionRepository;
        this.permisoService = permisoService;
        estrategiasDisponibles.forEach(e -> estrategias.put(e.tipo(), e));
    }

    @Transactional(readOnly = true)
    public List<SancionResponse> listar(Boolean vigente) {
        List<Sancion> sanciones = vigente == null
                ? sancionRepository.findAllByOrderByFechaDesc()
                : sancionRepository.findByVigenteOrderByFechaDesc(vigente);
        return sanciones.stream().map(SancionResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public SancionResponse obtener(Long id) {
        return SancionResponse.desde(buscar(id));
    }

    /** Banea un tema o comentario y registra la sancion. */
    @Transactional
    public SancionResponse sancionar(SancionRequest datos, Long actorId) {
        UsuarioRemoto moderador = permisoService.exigirModerador(actorId);
        if (sancionRepository.existsByTipoContenidoAndContenidoIdAndVigente(
                datos.tipoContenido(), datos.contenidoId(), Boolean.TRUE)) {
            throw new ConflictoException("Ese contenido ya tiene una sancion vigente");
        }
        estrategia(datos.tipoContenido()).banear(datos.contenidoId(), moderador.id());

        Sancion sancion = new Sancion();
        sancion.setTipoContenido(datos.tipoContenido());
        sancion.setContenidoId(datos.contenidoId());
        sancion.setMotivo(datos.motivo());
        sancion.setModeradorId(moderador.id());
        sancion.setVigente(Boolean.TRUE);
        Sancion guardada = sancionRepository.save(sancion);
        log.info("{} {} baneado por {}: {}", datos.tipoContenido(), datos.contenidoId(),
                moderador.nombreUsuario(), datos.motivo());
        return SancionResponse.desde(guardada);
    }

    /** Corrige el motivo de una sancion. */
    @Transactional
    public SancionResponse actualizarMotivo(Long id, MotivoRequest datos, Long actorId) {
        permisoService.exigirModerador(actorId);
        Sancion sancion = buscar(id);
        sancion.setMotivo(datos.motivo());
        return SancionResponse.desde(sancionRepository.save(sancion));
    }

    /** Revoca la sancion: restaura el contenido en el foro y elimina el registro. */
    @Transactional
    public void revocar(Long id, Long actorId) {
        UsuarioRemoto moderador = permisoService.exigirModerador(actorId);
        Sancion sancion = buscar(id);
        if (Boolean.TRUE.equals(sancion.getVigente())) {
            estrategia(sancion.getTipoContenido()).restaurar(sancion.getContenidoId(), moderador.id());
        }
        sancionRepository.delete(sancion);
        log.info("Sancion {} revocada por {}", id, moderador.nombreUsuario());
    }

    private ModeracionStrategy estrategia(TipoContenido tipo) {
        ModeracionStrategy e = estrategias.get(tipo);
        if (e == null) {
            throw new IllegalStateException("No hay estrategia de moderacion para " + tipo);
        }
        return e;
    }

    private Sancion buscar(Long id) {
        return sancionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro la sancion con ID " + id));
    }
}

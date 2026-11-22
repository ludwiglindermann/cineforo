package cl.duoc.cineforo.moderacion.client;

import cl.duoc.cineforo.moderacion.comun.excepcion.AccesoDenegadoException;
import cl.duoc.cineforo.moderacion.comun.excepcion.RecursoNoEncontradoException;
import cl.duoc.cineforo.moderacion.comun.excepcion.ServicioNoDisponibleException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/**
 * Cliente REST hacia foro-ms. Cambia el estado (ACTIVO/BANEADO) de un tema o
 * comentario enviando el ID del moderador en el header X-Usuario-Id.
 */
@Component
public class ForoClient {

    private static final Logger log = LoggerFactory.getLogger(ForoClient.class);

    private final RestClient restClient;

    public ForoClient(RestClient.Builder builder, @Value("${foro.service.url}") String url) {
        this.restClient = builder.baseUrl(url).build();
    }

    /** recurso = "temas" o "comentarios". */
    public void cambiarEstado(String recurso, Long contenidoId, String estado, Long moderadorId) {
        log.debug("Solicitando a foro-ms: {} {} -> {}", recurso, contenidoId, estado);
        try {
            restClient.put()
                    .uri("/api/{recurso}/{id}/estado", recurso, contenidoId)
                    .header("X-Usuario-Id", String.valueOf(moderadorId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("estado", estado))
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (req, res) -> {
                        throw new RecursoNoEncontradoException(
                                "No existe en el foro el contenido " + recurso + " con ID " + contenidoId);
                    })
                    .onStatus(status -> status.value() == 403, (req, res) -> {
                        throw new AccesoDenegadoException("El foro rechazo el cambio: el usuario no puede moderar");
                    })
                    .toBodilessEntity();
        } catch (ResourceAccessException ex) {
            throw new ServicioNoDisponibleException("El microservicio de Foro no esta disponible");
        }
    }
}

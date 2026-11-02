package cl.duoc.cineforo.foro.client;

import cl.duoc.cineforo.foro.exception.NoAutenticadoException;
import cl.duoc.cineforo.foro.exception.ServicioNoDisponibleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/**
 * Cliente REST que comunica este microservicio con el de Usuarios.
 * Se usa para saber si quien publica o comenta existe, esta activo y que rol tiene.
 */
@Component
public class UsuarioClient {

    private static final Logger log = LoggerFactory.getLogger(UsuarioClient.class);

    private final RestClient restClient;

    public UsuarioClient(RestClient.Builder builder,
                         @Value("${usuarios.service.url}") String usuariosUrl) {
        this.restClient = builder.baseUrl(usuariosUrl).build();
    }

    public UsuarioRemoto obtenerUsuario(Long id) {
        log.debug("Consultando al microservicio de Usuarios por el usuario {}", id);
        try {
            return restClient.get()
                    .uri("/api/usuarios/{id}", id)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.NOT_FOUND.value(), (request, response) -> {
                        throw new NoAutenticadoException("El usuario con ID " + id + " no existe");
                    })
                    .body(UsuarioRemoto.class);
        } catch (ResourceAccessException ex) {
            log.error("No se pudo conectar con el microservicio de Usuarios: {}", ex.getMessage());
            throw new ServicioNoDisponibleException(
                    "El microservicio de Usuarios no esta disponible. Verifica que este en ejecucion (puerto 8081)");
        }
    }
}

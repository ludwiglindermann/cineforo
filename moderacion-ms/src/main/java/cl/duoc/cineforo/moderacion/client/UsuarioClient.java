package cl.duoc.cineforo.moderacion.client;

import cl.duoc.cineforo.moderacion.comun.excepcion.NoAutenticadoException;
import cl.duoc.cineforo.moderacion.comun.excepcion.ServicioNoDisponibleException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/** Cliente REST hacia usuarios-ms: identifica al moderador y su rol. */
@Component
public class UsuarioClient {

    private final RestClient restClient;

    public UsuarioClient(RestClient.Builder builder, @Value("${usuarios.service.url}") String url) {
        this.restClient = builder.baseUrl(url).build();
    }

    public UsuarioRemoto obtenerUsuario(Long id) {
        try {
            return restClient.get()
                    .uri("/api/usuarios/{id}", id)
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (req, res) -> {
                        throw new NoAutenticadoException("El usuario con ID " + id + " no existe");
                    })
                    .body(UsuarioRemoto.class);
        } catch (ResourceAccessException ex) {
            throw new ServicioNoDisponibleException("El microservicio de Usuarios no esta disponible");
        }
    }
}

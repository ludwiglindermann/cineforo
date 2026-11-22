package cl.duoc.cineforo.moderacion.estrategia;

import cl.duoc.cineforo.moderacion.client.ForoClient;
import cl.duoc.cineforo.moderacion.model.TipoContenido;
import org.springframework.stereotype.Component;

/** Estrategia concreta para moderar comentarios del foro. */
@Component
public class ComentarioModeracionStrategy implements ModeracionStrategy {

    private final ForoClient foroClient;

    public ComentarioModeracionStrategy(ForoClient foroClient) {
        this.foroClient = foroClient;
    }

    @Override
    public TipoContenido tipo() {
        return TipoContenido.COMENTARIO;
    }

    @Override
    public void banear(Long contenidoId, Long moderadorId) {
        foroClient.cambiarEstado("comentarios", contenidoId, "BANEADO", moderadorId);
    }

    @Override
    public void restaurar(Long contenidoId, Long moderadorId) {
        foroClient.cambiarEstado("comentarios", contenidoId, "ACTIVO", moderadorId);
    }
}

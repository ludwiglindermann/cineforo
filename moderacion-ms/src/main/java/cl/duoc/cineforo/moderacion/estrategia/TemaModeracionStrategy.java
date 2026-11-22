package cl.duoc.cineforo.moderacion.estrategia;

import cl.duoc.cineforo.moderacion.client.ForoClient;
import cl.duoc.cineforo.moderacion.model.TipoContenido;
import org.springframework.stereotype.Component;

/** Estrategia concreta para moderar temas del foro. */
@Component
public class TemaModeracionStrategy implements ModeracionStrategy {

    private final ForoClient foroClient;

    public TemaModeracionStrategy(ForoClient foroClient) {
        this.foroClient = foroClient;
    }

    @Override
    public TipoContenido tipo() {
        return TipoContenido.TEMA;
    }

    @Override
    public void banear(Long contenidoId, Long moderadorId) {
        foroClient.cambiarEstado("temas", contenidoId, "BANEADO", moderadorId);
    }

    @Override
    public void restaurar(Long contenidoId, Long moderadorId) {
        foroClient.cambiarEstado("temas", contenidoId, "ACTIVO", moderadorId);
    }
}

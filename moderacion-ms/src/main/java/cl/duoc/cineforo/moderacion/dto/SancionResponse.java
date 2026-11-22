package cl.duoc.cineforo.moderacion.dto;

import cl.duoc.cineforo.moderacion.model.Sancion;
import java.time.LocalDateTime;

public record SancionResponse(
        Long id,
        String tipoContenido,
        Long contenidoId,
        String motivo,
        Long moderadorId,
        LocalDateTime fecha,
        boolean vigente) {

    public static SancionResponse desde(Sancion s) {
        return new SancionResponse(s.getId(), s.getTipoContenido().name(), s.getContenidoId(),
                s.getMotivo(), s.getModeradorId(), s.getFecha(), Boolean.TRUE.equals(s.getVigente()));
    }
}

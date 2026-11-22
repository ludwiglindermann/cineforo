package cl.duoc.cineforo.moderacion.model;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.type.NumericBooleanConverter;

/**
 * Registro de una sancion (baneo) aplicada por un moderador a un tema o comentario.
 * CONTENIDO_ID y MODERADOR_ID son IDs de otros microservicios (foro-ms y usuarios-ms):
 * no hay FOREIGN KEY porque cada microservicio es dueno de sus datos.
 */
@Entity
@Table(name = "SANCION")
public class Sancion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_CONTENIDO", nullable = false, length = 20)
    private TipoContenido tipoContenido;

    @Column(name = "CONTENIDO_ID", nullable = false)
    private Long contenidoId;

    @Column(name = "MOTIVO", nullable = false, length = 300)
    private String motivo;

    @Column(name = "MODERADOR_ID", nullable = false)
    private Long moderadorId;

    @Column(name = "FECHA", nullable = false, updatable = false)
    private LocalDateTime fecha;

    @Convert(converter = NumericBooleanConverter.class)
    @Column(name = "VIGENTE", nullable = false)
    private Boolean vigente;

    @PrePersist
    void antesDeInsertar() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
        if (vigente == null) {
            vigente = Boolean.TRUE;
        }
    }

    public Long getId() {
        return id;
    }

    public TipoContenido getTipoContenido() {
        return tipoContenido;
    }

    public void setTipoContenido(TipoContenido tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public Long getContenidoId() {
        return contenidoId;
    }

    public void setContenidoId(Long contenidoId) {
        this.contenidoId = contenidoId;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Long getModeradorId() {
        return moderadorId;
    }

    public void setModeradorId(Long moderadorId) {
        this.moderadorId = moderadorId;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public Boolean getVigente() {
        return vigente;
    }

    public void setVigente(Boolean vigente) {
        this.vigente = vigente;
    }
}

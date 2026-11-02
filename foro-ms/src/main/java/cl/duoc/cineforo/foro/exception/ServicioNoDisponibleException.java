package cl.duoc.cineforo.foro.exception;

/** HTTP 503: el microservicio de Usuarios no responde. */
public class ServicioNoDisponibleException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ServicioNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}

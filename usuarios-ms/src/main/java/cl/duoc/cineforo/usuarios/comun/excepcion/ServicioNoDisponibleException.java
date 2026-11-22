package cl.duoc.cineforo.usuarios.comun.excepcion;

/** HTTP 503: otro microservicio del que se depende no responde. */
public class ServicioNoDisponibleException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ServicioNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}

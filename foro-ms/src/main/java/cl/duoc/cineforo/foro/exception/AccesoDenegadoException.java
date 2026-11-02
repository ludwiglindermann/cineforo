package cl.duoc.cineforo.foro.exception;

/** HTTP 403: el usuario existe, pero su rol no le permite hacer esta operacion. */
public class AccesoDenegadoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}

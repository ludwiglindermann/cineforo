package ${package}.comun.excepcion;

/** HTTP 403: el rol del usuario no le permite esta operacion. */
public class AccesoDenegadoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}

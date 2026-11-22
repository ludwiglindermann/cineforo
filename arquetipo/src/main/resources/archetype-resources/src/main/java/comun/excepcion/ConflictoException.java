package ${package}.comun.excepcion;

/** HTTP 409: la operacion choca con datos existentes (duplicados, recurso en uso). */
public class ConflictoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}

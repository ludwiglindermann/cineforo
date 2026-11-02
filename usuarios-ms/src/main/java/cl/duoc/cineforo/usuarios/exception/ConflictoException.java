package cl.duoc.cineforo.usuarios.exception;

/** HTTP 409: la operacion choca con datos existentes (duplicados, rol en uso...). */
public class ConflictoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}

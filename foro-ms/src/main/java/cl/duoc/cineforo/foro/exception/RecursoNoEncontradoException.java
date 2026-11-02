package cl.duoc.cineforo.foro.exception;

/** HTTP 404: el recurso buscado no existe. */
public class RecursoNoEncontradoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}

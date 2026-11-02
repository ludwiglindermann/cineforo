package cl.duoc.cineforo.foro.exception;

/** HTTP 401: no se sabe quien hace la peticion, o las credenciales son incorrectas. */
public class NoAutenticadoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public NoAutenticadoException(String mensaje) {
        super(mensaje);
    }
}

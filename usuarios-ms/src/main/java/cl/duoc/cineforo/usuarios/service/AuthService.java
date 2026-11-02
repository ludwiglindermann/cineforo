package cl.duoc.cineforo.usuarios.service;

import cl.duoc.cineforo.usuarios.dto.LoginRequest;
import cl.duoc.cineforo.usuarios.dto.LoginResponse;
import cl.duoc.cineforo.usuarios.dto.UsuarioResponse;
import cl.duoc.cineforo.usuarios.exception.AccesoDenegadoException;
import cl.duoc.cineforo.usuarios.exception.NoAutenticadoException;
import cl.duoc.cineforo.usuarios.model.Usuario;
import cl.duoc.cineforo.usuarios.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Valida usuario (nombre o email) y contrasena contra el hash BCrypt guardado en Oracle.
     */
    @Transactional(readOnly = true)
    public LoginResponse iniciarSesion(LoginRequest credenciales) {
        Usuario usuario = usuarioRepository.buscarPorNombreOEmail(credenciales.usuario().trim())
                .filter(u -> passwordEncoder.matches(credenciales.password(), u.getPassword()))
                .orElseThrow(() -> {
                    log.warn("Intento de inicio de sesion fallido para '{}'", credenciales.usuario());
                    // Mismo mensaje si falla el usuario o la clave: no revela cual de los dos esta mal
                    return new NoAutenticadoException("Usuario o contrasena incorrectos");
                });

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new AccesoDenegadoException("La cuenta esta desactivada. Contacta a un administrador");
        }

        log.info("Inicio de sesion exitoso: {} ({})", usuario.getNombreUsuario(), usuario.getRol().getNombre());
        return new LoginResponse("Inicio de sesion exitoso. Bienvenido/a, " + usuario.getNombreUsuario(),
                UsuarioResponse.desde(usuario));
    }
}

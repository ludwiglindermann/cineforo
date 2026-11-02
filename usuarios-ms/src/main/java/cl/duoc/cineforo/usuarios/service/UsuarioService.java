package cl.duoc.cineforo.usuarios.service;

import cl.duoc.cineforo.usuarios.dto.UsuarioRequest;
import cl.duoc.cineforo.usuarios.dto.UsuarioResponse;
import cl.duoc.cineforo.usuarios.dto.UsuarioUpdateRequest;
import cl.duoc.cineforo.usuarios.exception.AccesoDenegadoException;
import cl.duoc.cineforo.usuarios.exception.ConflictoException;
import cl.duoc.cineforo.usuarios.exception.RecursoNoEncontradoException;
import cl.duoc.cineforo.usuarios.model.Rol;
import cl.duoc.cineforo.usuarios.model.Usuario;
import cl.duoc.cineforo.usuarios.repository.RolRepository;
import cl.duoc.cineforo.usuarios.repository.UsuarioRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reglas de negocio de los usuarios:
 * - Cualquiera puede registrarse (queda con rol USUARIO).
 * - Solo un ADMINISTRADOR puede crear usuarios con otro rol, cambiar roles,
 *   activar/desactivar cuentas o eliminar usuarios.
 * - Cada usuario puede modificar sus propios datos.
 */
@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PermisoService permisoService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                          PermisoService permisoService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.permisoService = permisoService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(String rol) {
        List<Usuario> usuarios = (rol == null || rol.isBlank())
                ? usuarioRepository.findAll()
                : usuarioRepository.findByRol_NombreOrderByIdAsc(rol.trim().toUpperCase());
        return usuarios.stream().map(UsuarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.desde(buscar(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest datos, Long actorId) {
        validarNombreDisponible(datos.nombreUsuario());
        validarEmailDisponible(datos.email());

        Rol rol;
        if (datos.rolId() == null) {
            rol = rolRepository.findByNombre(Rol.USUARIO)
                    .orElseThrow(() -> new RecursoNoEncontradoException("No existe el rol USUARIO en la base de datos"));
        } else {
            rol = buscarRol(datos.rolId());
            if (!Rol.USUARIO.equals(rol.getNombre())) {
                // Crear moderadores o administradores es privilegio del ADMINISTRADOR
                permisoService.exigirAdministrador(actorId);
            }
        }

        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(datos.nombreUsuario());
        usuario.setEmail(datos.email().toLowerCase());
        usuario.setPassword(passwordEncoder.encode(datos.password()));
        usuario.setRol(rol);
        usuario.setActivo(Boolean.TRUE);

        Usuario guardado = usuarioRepository.save(usuario);
        log.info("Usuario registrado: {} (ID {}, rol {})", guardado.getNombreUsuario(), guardado.getId(), rol.getNombre());
        return UsuarioResponse.desde(guardado);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest datos, Long actorId) {
        Usuario actor = permisoService.obtenerActor(actorId);
        Usuario usuario = buscar(id);

        boolean esElMismo = actor.getId().equals(usuario.getId());
        if (!esElMismo && !actor.esAdministrador()) {
            throw new AccesoDenegadoException("Solo puedes modificar tu propia cuenta");
        }
        if ((datos.rolId() != null || datos.activo() != null) && !actor.esAdministrador()) {
            throw new AccesoDenegadoException("Solo un ADMINISTRADOR puede cambiar el rol o el estado de una cuenta");
        }

        if (datos.nombreUsuario() != null && !datos.nombreUsuario().equalsIgnoreCase(usuario.getNombreUsuario())) {
            validarNombreDisponible(datos.nombreUsuario());
            usuario.setNombreUsuario(datos.nombreUsuario());
        }
        if (datos.email() != null && !datos.email().equalsIgnoreCase(usuario.getEmail())) {
            validarEmailDisponible(datos.email());
            usuario.setEmail(datos.email().toLowerCase());
        }
        if (datos.password() != null) {
            usuario.setPassword(passwordEncoder.encode(datos.password()));
        }
        if (datos.rolId() != null) {
            usuario.setRol(buscarRol(datos.rolId()));
        }
        if (datos.activo() != null) {
            usuario.setActivo(datos.activo());
        }

        Usuario guardado = usuarioRepository.save(usuario);
        log.info("Usuario actualizado: {} (ID {}) por {}", guardado.getNombreUsuario(), id, actor.getNombreUsuario());
        return UsuarioResponse.desde(guardado);
    }

    @Transactional
    public void eliminar(Long id, Long actorId) {
        Usuario actor = permisoService.exigirAdministrador(actorId);
        Usuario usuario = buscar(id);
        if (actor.getId().equals(usuario.getId())) {
            throw new ConflictoException("Un administrador no puede eliminar su propia cuenta");
        }
        usuarioRepository.delete(usuario);
        log.info("Usuario eliminado: {} (ID {}) por {}", usuario.getNombreUsuario(), id, actor.getNombreUsuario());
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el usuario con ID " + id));
    }

    private Rol buscarRol(Long rolId) {
        return rolRepository.findById(rolId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el rol con ID " + rolId));
    }

    private void validarNombreDisponible(String nombreUsuario) {
        if (usuarioRepository.existsByNombreUsuarioIgnoreCase(nombreUsuario)) {
            throw new ConflictoException("El nombre de usuario '" + nombreUsuario + "' ya esta en uso");
        }
    }

    private void validarEmailDisponible(String email) {
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictoException("El email '" + email + "' ya esta registrado");
        }
    }
}

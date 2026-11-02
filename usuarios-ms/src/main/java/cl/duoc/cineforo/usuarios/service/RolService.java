package cl.duoc.cineforo.usuarios.service;

import cl.duoc.cineforo.usuarios.dto.RolRequest;
import cl.duoc.cineforo.usuarios.dto.RolResponse;
import cl.duoc.cineforo.usuarios.exception.ConflictoException;
import cl.duoc.cineforo.usuarios.exception.RecursoNoEncontradoException;
import cl.duoc.cineforo.usuarios.model.Rol;
import cl.duoc.cineforo.usuarios.repository.RolRepository;
import cl.duoc.cineforo.usuarios.repository.UsuarioRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RolService {

    private static final Logger log = LoggerFactory.getLogger(RolService.class);

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PermisoService permisoService;

    public RolService(RolRepository rolRepository, UsuarioRepository usuarioRepository,
                      PermisoService permisoService) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.permisoService = permisoService;
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listar() {
        return rolRepository.findAll().stream().map(RolResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public RolResponse obtener(Long id) {
        return RolResponse.desde(buscar(id));
    }

    @Transactional
    public RolResponse crear(RolRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        if (rolRepository.existsByNombre(datos.nombre())) {
            throw new ConflictoException("Ya existe un rol llamado " + datos.nombre());
        }
        Rol rol = new Rol();
        rol.setNombre(datos.nombre());
        rol.setDescripcion(datos.descripcion());
        Rol guardado = rolRepository.save(rol);
        log.info("Rol creado: {} (ID {})", guardado.getNombre(), guardado.getId());
        return RolResponse.desde(guardado);
    }

    @Transactional
    public RolResponse actualizar(Long id, RolRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Rol rol = buscar(id);
        if (!rol.getNombre().equals(datos.nombre()) && rolRepository.existsByNombre(datos.nombre())) {
            throw new ConflictoException("Ya existe un rol llamado " + datos.nombre());
        }
        rol.setNombre(datos.nombre());
        rol.setDescripcion(datos.descripcion());
        log.info("Rol actualizado: ID {}", id);
        return RolResponse.desde(rolRepository.save(rol));
    }

    @Transactional
    public void eliminar(Long id, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Rol rol = buscar(id);
        if (usuarioRepository.existsByRol_Id(id)) {
            throw new ConflictoException("No se puede eliminar el rol " + rol.getNombre()
                    + " porque hay usuarios que lo tienen asignado");
        }
        rolRepository.delete(rol);
        log.info("Rol eliminado: {} (ID {})", rol.getNombre(), id);
    }

    Rol buscar(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontro el rol con ID " + id));
    }
}

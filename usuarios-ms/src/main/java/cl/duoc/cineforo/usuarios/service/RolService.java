package cl.duoc.cineforo.usuarios.service;

import cl.duoc.cineforo.usuarios.comun.excepcion.ConflictoException;
import cl.duoc.cineforo.usuarios.comun.patron.CrudServiceBase;
import cl.duoc.cineforo.usuarios.dto.RolRequest;
import cl.duoc.cineforo.usuarios.dto.RolResponse;
import cl.duoc.cineforo.usuarios.model.Rol;
import cl.duoc.cineforo.usuarios.repository.RolRepository;
import cl.duoc.cineforo.usuarios.repository.UsuarioRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de roles. PATRON TEMPLATE METHOD: hereda de CrudServiceBase
 * (incluido en el arquetipo) el flujo comun de listar, obtener, crear,
 * actualizar y eliminar, e implementa solo los pasos propios de Rol.
 * Antes de cada escritura agrega la regla de negocio: solo un ADMINISTRADOR.
 */
@Service
public class RolService extends CrudServiceBase<Rol, Long, RolRequest, RolResponse> {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PermisoService permisoService;

    public RolService(RolRepository rolRepository, UsuarioRepository usuarioRepository,
                      PermisoService permisoService) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.permisoService = permisoService;
    }

    // ---------- Pasos del Template Method ----------
    @Override
    protected JpaRepository<Rol, Long> repositorio() {
        return rolRepository;
    }

    @Override
    protected Rol crearEntidad(RolRequest datos) {
        Rol rol = new Rol();
        rol.setNombre(datos.nombre());
        rol.setDescripcion(datos.descripcion());
        return rol;
    }

    @Override
    protected void actualizarEntidad(Rol rol, RolRequest datos) {
        rol.setNombre(datos.nombre());
        rol.setDescripcion(datos.descripcion());
    }

    @Override
    protected RolResponse aRespuesta(Rol rol) {
        return RolResponse.desde(rol);
    }

    @Override
    protected String nombreRecurso() {
        return "el rol";
    }

    // ---------- Operaciones con permisos ----------
    @Transactional
    public RolResponse crear(RolRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        if (rolRepository.existsByNombre(datos.nombre())) {
            throw new ConflictoException("Ya existe un rol llamado " + datos.nombre());
        }
        return crear(datos);
    }

    @Transactional
    public RolResponse actualizar(Long id, RolRequest datos, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Rol actual = buscar(id);
        if (!actual.getNombre().equals(datos.nombre()) && rolRepository.existsByNombre(datos.nombre())) {
            throw new ConflictoException("Ya existe un rol llamado " + datos.nombre());
        }
        return actualizar(id, datos);
    }

    @Transactional
    public void eliminar(Long id, Long actorId) {
        permisoService.exigirAdministrador(actorId);
        Rol rol = buscar(id);
        if (usuarioRepository.existsByRol_Id(id)) {
            throw new ConflictoException("No se puede eliminar el rol " + rol.getNombre()
                    + " porque hay usuarios que lo tienen asignado");
        }
        eliminar(id);
    }
}

package cl.duoc.cineforo.usuarios.controller;

import cl.duoc.cineforo.usuarios.dto.RolRequest;
import cl.duoc.cineforo.usuarios.dto.RolResponse;
import cl.duoc.cineforo.usuarios.service.RolService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET    /api/roles          lista los roles
 * GET    /api/roles/{id}     obtiene un rol
 * POST   /api/roles          crea un rol            (solo ADMINISTRADOR)
 * PUT    /api/roles/{id}     actualiza un rol       (solo ADMINISTRADOR)
 * DELETE /api/roles/{id}     elimina un rol sin uso (solo ADMINISTRADOR)
 */
@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public List<RolResponse> listar() {
        return rolService.listar();
    }

    @GetMapping("/{id}")
    public RolResponse obtener(@PathVariable Long id) {
        return rolService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<RolResponse> crear(
            @Valid @RequestBody RolRequest datos,
            @RequestHeader(value = UsuarioController.HEADER_ACTOR, required = false) Long actorId) {
        RolResponse creado = rolService.crear(datos, actorId);
        return ResponseEntity.created(URI.create("/api/roles/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public RolResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody RolRequest datos,
            @RequestHeader(value = UsuarioController.HEADER_ACTOR, required = false) Long actorId) {
        return rolService.actualizar(id, datos, actorId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = UsuarioController.HEADER_ACTOR, required = false) Long actorId) {
        rolService.eliminar(id, actorId);
        return ResponseEntity.noContent().build();
    }
}

package cl.duoc.cineforo.usuarios.controller;

import cl.duoc.cineforo.usuarios.dto.UsuarioRequest;
import cl.duoc.cineforo.usuarios.dto.UsuarioResponse;
import cl.duoc.cineforo.usuarios.dto.UsuarioUpdateRequest;
import cl.duoc.cineforo.usuarios.service.UsuarioService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET    /api/usuarios            lista usuarios (filtro opcional ?rol=MODERADOR)
 * GET    /api/usuarios/{id}       obtiene un usuario
 * POST   /api/usuarios            registra un usuario
 * PUT    /api/usuarios/{id}       modifica un usuario (header X-Usuario-Id)
 * DELETE /api/usuarios/{id}       elimina un usuario (header X-Usuario-Id de un ADMINISTRADOR)
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    public static final String HEADER_ACTOR = "X-Usuario-Id";

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioResponse> listar(@RequestParam(required = false) String rol) {
        return usuarioService.listar(rol);
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @Valid @RequestBody UsuarioRequest datos,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        UsuarioResponse creado = usuarioService.crear(datos, actorId);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest datos,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        return usuarioService.actualizar(id, datos, actorId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        usuarioService.eliminar(id, actorId);
        return ResponseEntity.noContent().build();
    }
}

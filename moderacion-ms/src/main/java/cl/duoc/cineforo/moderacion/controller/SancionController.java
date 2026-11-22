package cl.duoc.cineforo.moderacion.controller;

import cl.duoc.cineforo.moderacion.dto.MotivoRequest;
import cl.duoc.cineforo.moderacion.dto.SancionRequest;
import cl.duoc.cineforo.moderacion.dto.SancionResponse;
import cl.duoc.cineforo.moderacion.service.SancionService;
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
 * GET    /api/sanciones           lista sanciones (?vigente=true para solo las vigentes)
 * GET    /api/sanciones/{id}      obtiene una sancion
 * POST   /api/sanciones           banea un tema o comentario     (MODERADOR o ADMINISTRADOR)
 * PUT    /api/sanciones/{id}      corrige el motivo              (MODERADOR o ADMINISTRADOR)
 * DELETE /api/sanciones/{id}      revoca la sancion y restaura   (MODERADOR o ADMINISTRADOR)
 */
@RestController
@RequestMapping("/api/sanciones")
public class SancionController {

    private static final String HEADER_ACTOR = "X-Usuario-Id";

    private final SancionService sancionService;

    public SancionController(SancionService sancionService) {
        this.sancionService = sancionService;
    }

    @GetMapping
    public List<SancionResponse> listar(@RequestParam(required = false) Boolean vigente) {
        return sancionService.listar(vigente);
    }

    @GetMapping("/{id}")
    public SancionResponse obtener(@PathVariable Long id) {
        return sancionService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<SancionResponse> sancionar(
            @Valid @RequestBody SancionRequest datos,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        SancionResponse creada = sancionService.sancionar(datos, actorId);
        return ResponseEntity.created(URI.create("/api/sanciones/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public SancionResponse actualizarMotivo(
            @PathVariable Long id,
            @Valid @RequestBody MotivoRequest datos,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        return sancionService.actualizarMotivo(id, datos, actorId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revocar(
            @PathVariable Long id,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        sancionService.revocar(id, actorId);
        return ResponseEntity.noContent().build();
    }
}

package cl.duoc.cineforo.foro.controller;

import cl.duoc.cineforo.foro.dto.ComentarioRequest;
import cl.duoc.cineforo.foro.dto.ComentarioResponse;
import cl.duoc.cineforo.foro.service.ComentarioService;
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
 * GET    /api/temas/{temaId}/comentarios    lista los comentarios de un tema
 * POST   /api/temas/{temaId}/comentarios    comenta un tema            (header X-Usuario-Id)
 * GET    /api/comentarios/{id}              obtiene un comentario
 * PUT    /api/comentarios/{id}              edita un comentario        (autor, MODERADOR o ADMINISTRADOR)
 * DELETE /api/comentarios/{id}              elimina un comentario      (autor, MODERADOR o ADMINISTRADOR)
 */
@RestController
@RequestMapping("/api")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @GetMapping("/temas/{temaId}/comentarios")
    public List<ComentarioResponse> listarPorTema(@PathVariable Long temaId) {
        return comentarioService.listarPorTema(temaId);
    }

    @PostMapping("/temas/{temaId}/comentarios")
    public ResponseEntity<ComentarioResponse> comentar(
            @PathVariable Long temaId,
            @Valid @RequestBody ComentarioRequest datos,
            @RequestHeader(value = CategoriaController.HEADER_ACTOR, required = false) Long actorId) {
        ComentarioResponse creado = comentarioService.comentar(temaId, datos, actorId);
        return ResponseEntity.created(URI.create("/api/comentarios/" + creado.id())).body(creado);
    }

    @GetMapping("/comentarios/{id}")
    public ComentarioResponse obtener(@PathVariable Long id) {
        return comentarioService.obtener(id);
    }

    @PutMapping("/comentarios/{id}")
    public ComentarioResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ComentarioRequest datos,
            @RequestHeader(value = CategoriaController.HEADER_ACTOR, required = false) Long actorId) {
        return comentarioService.actualizar(id, datos, actorId);
    }

    @DeleteMapping("/comentarios/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = CategoriaController.HEADER_ACTOR, required = false) Long actorId) {
        comentarioService.eliminar(id, actorId);
        return ResponseEntity.noContent().build();
    }
}

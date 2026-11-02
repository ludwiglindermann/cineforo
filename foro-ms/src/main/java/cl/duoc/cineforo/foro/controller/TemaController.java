package cl.duoc.cineforo.foro.controller;

import cl.duoc.cineforo.foro.dto.TemaDetalleResponse;
import cl.duoc.cineforo.foro.dto.TemaRequest;
import cl.duoc.cineforo.foro.dto.TemaResponse;
import cl.duoc.cineforo.foro.service.TemaService;
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
 * GET    /api/temas                      busca temas (filtros opcionales: ?categoriaId= &autorId= &q=)
 * GET    /api/temas/{id}                 ve un tema con sus comentarios
 * POST   /api/temas                      publica un tema           (header X-Usuario-Id)
 * PUT    /api/temas/{id}                 edita un tema             (autor, MODERADOR o ADMINISTRADOR)
 * DELETE /api/temas/{id}                 elimina un tema           (autor, MODERADOR o ADMINISTRADOR)
 */
@RestController
@RequestMapping("/api/temas")
public class TemaController {

    private final TemaService temaService;

    public TemaController(TemaService temaService) {
        this.temaService = temaService;
    }

    @GetMapping
    public List<TemaResponse> buscar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long autorId,
            @RequestParam(name = "q", required = false) String texto) {
        return temaService.buscar(categoriaId, autorId, texto);
    }

    @GetMapping("/{id}")
    public TemaDetalleResponse obtener(@PathVariable Long id) {
        return temaService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<TemaResponse> publicar(
            @Valid @RequestBody TemaRequest datos,
            @RequestHeader(value = CategoriaController.HEADER_ACTOR, required = false) Long actorId) {
        TemaResponse creado = temaService.publicar(datos, actorId);
        return ResponseEntity.created(URI.create("/api/temas/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public TemaResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TemaRequest datos,
            @RequestHeader(value = CategoriaController.HEADER_ACTOR, required = false) Long actorId) {
        return temaService.actualizar(id, datos, actorId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = CategoriaController.HEADER_ACTOR, required = false) Long actorId) {
        temaService.eliminar(id, actorId);
        return ResponseEntity.noContent().build();
    }
}

package cl.duoc.cineforo.foro.controller;

import cl.duoc.cineforo.foro.dto.CategoriaRequest;
import cl.duoc.cineforo.foro.dto.CategoriaResponse;
import cl.duoc.cineforo.foro.service.CategoriaService;
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
 * GET    /api/categorias          lista las categorias
 * GET    /api/categorias/{id}     obtiene una categoria
 * POST   /api/categorias          crea una categoria       (solo ADMINISTRADOR)
 * PUT    /api/categorias/{id}     actualiza una categoria  (solo ADMINISTRADOR)
 * DELETE /api/categorias/{id}     elimina una categoria    (solo ADMINISTRADOR, sin temas)
 */
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    public static final String HEADER_ACTOR = "X-Usuario-Id";

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public CategoriaResponse obtener(@PathVariable Long id) {
        return categoriaService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> crear(
            @Valid @RequestBody CategoriaRequest datos,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        CategoriaResponse creada = categoriaService.crear(datos, actorId);
        return ResponseEntity.created(URI.create("/api/categorias/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public CategoriaResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest datos,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        return categoriaService.actualizar(id, datos, actorId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = HEADER_ACTOR, required = false) Long actorId) {
        categoriaService.eliminar(id, actorId);
        return ResponseEntity.noContent().build();
    }
}

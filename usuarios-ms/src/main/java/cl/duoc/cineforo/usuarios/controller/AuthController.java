package cl.duoc.cineforo.usuarios.controller;

import cl.duoc.cineforo.usuarios.dto.LoginRequest;
import cl.duoc.cineforo.usuarios.dto.LoginResponse;
import cl.duoc.cineforo.usuarios.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/auth/login   inicio de sesion con nombre de usuario (o email) y contrasena
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest credenciales) {
        return authService.iniciarSesion(credenciales);
    }
}

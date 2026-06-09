package org.tfg.backend.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST que maneja el ciclo de autenticación y registro de usuarios del taller.
 * Proporciona endpoints para el inicio de sesión (Login) y el alta de cuentas de tipo Cliente y Propietario.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint para autenticar a un usuario mediante sus credenciales (email y contraseña).
     *
     * @param request Datos del login (email y password).
     * @return ResponseEntity con {@link AuthResponse} conteniendo el token JWT y el rol del usuario.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Endpoint para dar de alta y registrar a un nuevo Cliente.
     *
     * @param request Datos del registro del cliente.
     * @return ResponseEntity con mensaje informativo sobre la verificación por email.
     */
    @PostMapping("/register/client")
    public ResponseEntity<String> registerClient(@Valid @RequestBody ClientRegisterRequest request) {
        return ResponseEntity.ok(authService.registerClient(request));
    }

    /**
     * Endpoint para registrar a un propietario de taller (Workshop Owner).
     *
     * @param request Datos del registro del propietario.
     * @return ResponseEntity con mensaje informativo sobre la verificación por email.
     */
    @PostMapping("/register/workshop")
    public ResponseEntity<String> registerWorkshop(@Valid @RequestBody OwnerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerWorkshop(request));
    }
}
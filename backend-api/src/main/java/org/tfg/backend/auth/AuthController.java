package org.tfg.backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/client")
    public ResponseEntity<String> registerClient(@RequestBody ClientRegisterRequest request) {
        return ResponseEntity.ok(authService.registerClient(request));
    }

    @PostMapping({"/register/workshop", "/register/owner"})
    public ResponseEntity<String> registerOwner(@RequestBody OwnerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerOwner(request));
    }
}
package org.tfg.backend.identity;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tfg.backend.auth.AuthResponse;

/**
 * Controlador REST que gestiona las operaciones de autenticación de cuenta e identidad.
 * Expone endpoints para la verificación de correo electrónico, inicio de sesión mediante Google,
 * solicitud de recuperación y restablecimiento de contraseña.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class IdentityController {

    private final IdentityService identityService;

    /**
     * Verifica la cuenta de un usuario recién registrado utilizando su token único enviado por correo.
     *
     * @param token Token de verificación.
     * @return Mensaje de éxito al verificar la cuenta.
     */
    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam String token) {
        return ResponseEntity.ok(identityService.verifyAccount(token));
    }

    /**
     * Inicia sesión o vincula una cuenta utilizando el token de identidad de Google.
     *
     * @param request Petición con el ID token de Google.
     * @return Respuesta con el token JWT de acceso y el rol del usuario.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(identityService.loginWithGoogle(request));
    }

    /**
     * Procesa la solicitud de recuperación de contraseña enviando un correo con un token único.
     *
     * @param request Petición con el correo electrónico del usuario.
     * @return Mensaje de confirmación del envío del correo de recuperación.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(identityService.forgotPassword(request));
    }

    /**
     * Restablece la contraseña del usuario a partir del token de seguridad recibido.
     *
     * @param request Petición con el token y la nueva contraseña elegida.
     * @return Mensaje confirmando la actualización de la contraseña.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(identityService.resetPassword(request));
    }
}

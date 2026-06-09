package org.tfg.backend.identity;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.tfg.backend.auth.AuthResponse;
import org.tfg.backend.config.JwtService;
import org.tfg.backend.user.AuthProvider;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio central para la gestión de identidad y flujos de autenticación avanzados.
 * Contiene la lógica de negocio para la verificación de cuentas, autenticación híbrida con Google,
 * generación de tokens de restablecimiento de contraseña y actualización de la misma.
 */
@Service
@RequiredArgsConstructor
public class IdentityService {

    private final UserRepository userRepository;
    private final OAuth2GoogleService googleService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Verifica una cuenta de usuario a partir del token de verificación.
     * Al realizarse la verificación, el token se anula y la cuenta queda activa.
     *
     * @param token Token de verificación único.
     * @return Mensaje confirmando el éxito de la verificación.
     * @throws ResponseStatusException Si el token es inválido o ha expirado.
     */
    @Transactional
    public String verifyAccount(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de verificación no válido o expirado."));

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return "Cuenta verificada con éxito. Ya puedes iniciar sesión.";
    }

    /**
     * Autentica a un usuario utilizando el inicio de sesión de Google (OAuth2).
     * Si el usuario existe, se asocia su ID de Google, se activa el proveedor GOOGLE y se genera su JWT.
     *
     * @param request Datos de la petición con el ID Token de Google.
     * @return Respuesta con el token JWT de acceso y el rol asignado.
     * @throws ResponseStatusException Si la cuenta no está registrada o no está verificada previamente.
     */
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        OAuth2GoogleService.GoogleUserInfo googleUser = googleService.validateToken(request.getIdToken());
        String cleanEmail = googleUser.getEmail().trim().toLowerCase();
        
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                        "Acceso no autorizado. Tu cuenta debe ser registrada previamente"));

        if (!user.isVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "La cuenta no está verificada. Por favor, verifica tu cuenta a través del enlace de correo antes de iniciar sesión.");
        }

        // Vinculación híbrida automática
        user.setGoogleId(googleUser.getGoogleId());
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setVerified(true); // Verificado automáticamente por Google
        userRepository.save(user);

        String jwtToken = jwtService.generarToken(user.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    /**
     * Inicia el flujo de recuperación de contraseña.
     * Genera un token aleatorio con validez de 15 minutos y envía un correo electrónico de recuperación.
     *
     * @param request Datos con el correo electrónico del usuario.
     * @return Mensaje indicando que el correo ha sido enviado.
     * @throws ResponseStatusException Si el correo no existe o la cuenta usa Google.
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe ninguna cuenta asociada a este correo electrónico."));

        if (user.getAuthProvider() == AuthProvider.GOOGLE || user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Esta cuenta se autentica a través de Google. Inicia sesión directamente con Google.");
        }

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);

        return "Enlace de recuperación enviado. Revisa tu correo electrónico.";
    }

    /**
     * Restablece la contraseña por una nueva a partir de un token de recuperación válido y no expirado.
     *
     * @param request Datos con el token y la nueva contraseña.
     * @return Mensaje confirmando que la contraseña ha sido actualizada.
     * @throws ResponseStatusException Si el token es inválido o ha expirado.
     */
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de recuperación no válido o expirado."));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El token de recuperación ha expirado (validez de 15 minutos).");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return "Contraseña actualizada correctamente.";
    }
}

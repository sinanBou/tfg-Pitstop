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
 * Servicio encargado de gestionar los procesos de identidad de los usuarios.
 * Esto incluye la verificación de cuentas, inicio de sesión federado con Google,
 * y los flujos de recuperación/restablecimiento de contraseñas.
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
     * Verifica la cuenta de un usuario mediante el token recibido por correo electrónico.
     *
     * @param token Token único de verificación.
     * @return Mensaje indicando que la cuenta ha sido verificada.
     * @throws ResponseStatusException si el token no es válido o ha expirado.
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
     * Inicia sesión o vincula una cuenta existente a través del token ID de Google.
     *
     * @param request Datos de la petición con el token de Google.
     * @return Respuesta con el token JWT de acceso y el rol asignado.
     * @throws ResponseStatusException si el token de Google no es válido o el usuario no existe/no está verificado.
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

        user.setGoogleId(googleUser.getGoogleId());
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setVerified(true);
        userRepository.save(user);

        String jwtToken = jwtService.generarToken(user.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    /**
     * Genera un token único de recuperación de contraseña y lo envía por correo electrónico.
     *
     * @param request Datos del usuario incluyendo el correo electrónico.
     * @return Mensaje confirmando el envío del correo de recuperación.
     * @throws ResponseStatusException si el correo no existe o si la cuenta está vinculada a Google.
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
     * Restablece la contraseña del usuario a partir del token de seguridad recibido.
     *
     * @param request Petición con el token y la nueva contraseña elegida.
     * @return Mensaje confirmando la actualización de la contraseña.
     * @throws ResponseStatusException si el token no es válido o ha expirado.
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

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

@Service
@RequiredArgsConstructor
public class IdentityService {

    private final UserRepository userRepository;
    private final OAuth2GoogleService googleService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String verifyAccount(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de verificación no válido o expirado."));

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return "Cuenta verificada con éxito. Ya puedes iniciar sesión.";
    }

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

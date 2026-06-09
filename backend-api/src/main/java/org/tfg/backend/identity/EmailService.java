package org.tfg.backend.identity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Servicio encargado del envío de correos electrónicos del sistema (verificación de cuentas, restablecimiento de contraseña).
 * Incluye un simulador de envío (Mock) para direcciones de correo de prueba o desarrollo local.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.backend.url:http://localhost:9091}")
    private String backendUrl;

    /**
     * Determina si un correo electrónico corresponde a una dirección de prueba o de simulación (Mock).
     *
     * @param email Correo electrónico a evaluar.
     * @return True si es una dirección simulada, False de lo contrario.
     */
    private boolean isMockEmail(String email) {
        if (email == null) return true;
        String lower = email.toLowerCase();
        return lower.endsWith("@pitstop.com")
                || lower.endsWith("@example.com")
                || lower.contains("test")
                || lower.contains("mock")
                || lower.endsWith(".local")
                || lower.endsWith(".test");
    }

    /**
     * Envía un correo electrónico de verificación al usuario recién registrado.
     * En caso de error, el token se imprime en el log del servidor para depuración local.
     *
     * @param toEmail Correo electrónico del destinatario.
     * @param token Token de verificación único.
     */
    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = backendUrl + "/api/auth/verify?token=" + token;
        String subject = "Verifica tu cuenta - PitStop";
        String messageBody = "Hola,\n\n" +
                "Gracias por registrarte en PitStop. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:\n" +
                verificationUrl + "\n\n" +
                "Este enlace es necesario para poder iniciar sesión.\n\n" +
                "Atentamente,\nEl equipo de PitStop";

        if (isMockEmail(toEmail)) {
            log.info("[MOCK EMAIL] Simulación de envío de correo de verificación a {}", toEmail);
            log.warn("\n==================================================\n" +
                     "TOKEN DE VERIFICACIÓN (MOCK) PARA {}: {}\n" +
                     "ENLACE: {}\n" +
                     "==================================================", toEmail, token, verificationUrl);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(messageBody);
            mailMessage.setFrom(fromEmail);
            
            mailSender.send(mailMessage);
            log.info("Email de verificación enviado con éxito a {}", toEmail);
        } catch (Exception e) {
            log.error("Fallo al enviar email a {} usando JavaMailSender. Imprimiendo token en consola para desarrollo:", toEmail, e);
            log.warn("\n==================================================\n" +
                     "TOKEN DE VERIFICACIÓN PARA {}: {}\n" +
                     "ENLACE: {}\n" +
                     "==================================================", toEmail, token, verificationUrl);
        }
    }

    /**
     * Envía un correo electrónico para restablecer la contraseña del usuario.
     * En caso de error, el token se imprime en el log del servidor para depuración local.
     *
     * @param toEmail Correo electrónico del destinatario.
     * @param token Token de restablecimiento único.
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Recuperación de contraseña - PitStop";
        String messageBody = "Hola,\n\n" +
                "Has solicitado restablecer tu contraseña. Por favor, utiliza el siguiente enlace para crear una nueva contraseña:\n" +
                resetUrl + "\n\n" +
                "Este enlace expirará en 15 minutos.\n\n" +
                "Si no has solicitado este cambio, por favor ignora este correo.\n\n" +
                "Atentamente,\nEl equipo de PitStop";

        if (isMockEmail(toEmail)) {
            log.info("[MOCK EMAIL] Simulación de envío de correo de restablecimiento a {}", toEmail);
            log.warn("\n==================================================\n" +
                     "TOKEN DE RESET (MOCK) PARA {}: {}\n" +
                     "ENLACE: {}\n" +
                     "==================================================", toEmail, token, resetUrl);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(messageBody);
            mailMessage.setFrom(fromEmail);

            mailSender.send(mailMessage);
            log.info("Email de restablecimiento enviado con éxito a {}", toEmail);
        } catch (Exception e) {
            log.error("Fallo al enviar email de restablecimiento a {} usando JavaMailSender. Imprimiendo token en consola:", toEmail, e);
            log.warn("\n==================================================\n" +
                     "TOKEN DE RESET PARA {}: {}\n" +
                     "ENLACE: {}\n" +
                     "==================================================", toEmail, token, resetUrl);
        }
    }
}
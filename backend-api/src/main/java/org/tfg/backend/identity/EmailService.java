package org.tfg.backend.identity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = "http://localhost:9091/api/auth/verify?token=" + token;
        String subject = "Verifica tu cuenta - PitStop";
        String messageBody = "Hola,\n\n" +
                "Gracias por registrarte en PitStop. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:\n" +
                verificationUrl + "\n\n" +
                "Este enlace es necesario para poder iniciar sesión.\n\n" +
                "Atentamente,\nEl equipo de PitStop";

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

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token; // Puerto frontend por defecto
        String subject = "Recuperación de contraseña - PitStop";
        String messageBody = "Hola,\n\n" +
                "Has solicitado restablecer tu contraseña. Por favor, utiliza el siguiente enlace para crear una nueva contraseña:\n" +
                resetUrl + "\n\n" +
                "Este enlace expirará en 15 minutos.\n\n" +
                "Si no has solicitado este cambio, por favor ignora este correo.\n\n" +
                "Atentamente,\nEl equipo de PitStop";

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

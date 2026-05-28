package org.tfg.backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;
import org.tfg.backend.config.JwtService;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.user.AuthProvider;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final WorkshopRepository workshopRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OAuth2GoogleService googleService;
    private final EmailService emailService;

    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        var user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos."));

        if (!user.isVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta no está verificada. Por favor, revisa tu correo electrónico.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        cleanEmail,
                        request.getPassword()
                )
        );

        var jwtToken = jwtService.generarToken(user.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public String registerClient(RegisterRequest request) {
        validateCommonData(request);
        if (clientRepository.existsByNif(request.getNif())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El NIF ya está registrado.");
        }

        String verificationToken = UUID.randomUUID().toString();
        User user = createBaseUser(request, Role.CLIENT, verificationToken);

        Client client = Client.builder()
                .user(user)
                .nif(request.getNif())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .build();
        clientRepository.save(client);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        return "Cliente registrado. Por favor, verifica tu cuenta en el correo electrónico enviado.";
    }

    @Transactional
    public String registerWorkshop(RegisterRequest request) {
        validateCommonData(request);

        String verificationToken = UUID.randomUUID().toString();
        User user = createBaseUser(request, Role.WORKSHOP_OWNER, verificationToken);

        Employee ownerEmployee = Employee.builder()
                .user(user)
                .build();
        employeeRepository.save(ownerEmployee);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        return "Dueño registrado. Por favor, verifica tu cuenta en el correo electrónico enviado.";
    }

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
                        "Acceso no autorizado. Tu cuenta debe ser registrada previamente por el administrador."));

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

    private void validateCommonData(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está en uso.");
        }
    }

    private User createBaseUser(RegisterRequest request, Role role, String token) {
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .address(request.getAddress())
                .authProvider(AuthProvider.LOCAL)
                .isVerified(false)
                .verificationToken(token)
                .build();
        return userRepository.save(user);
    }
}
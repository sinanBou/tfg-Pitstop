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
import org.tfg.backend.identity.EmailService;
import org.tfg.backend.user.AuthProvider;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio encargado de gestionar los procesos de autenticación y registro en el sistema.
 * Valida contraseñas encriptadas, gestiona roles, genera tokens JWT y despacha correos de verificación.
 */
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
    private final EmailService emailService;

    /**
     * Realiza el proceso de login. Verifica la existencia de usuario, valida el estado de verificación
     * de cuenta, autentica las credenciales y genera un token JWT de sesión.
     *
     * @param request Datos con el email y contraseña provistos.
     * @return {@link AuthResponse} con el token JWT y el rol del usuario.
     * @throws ResponseStatusException si el usuario/contraseña son inválidos (UNAUTHORIZED) o la cuenta no está verificada (FORBIDDEN).
     */
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

    /**
     * Registra un nuevo cliente (Client) en el sistema.
     * Genera un token de verificación de cuenta y envía un correo electrónico al destinatario.
     *
     * @param request Datos del registro de cliente.
     * @return Mensaje de confirmación del registro.
     * @throws ResponseStatusException si el email o NIF ya se encuentran en uso.
     */
    @Transactional
    public String registerClient(ClientRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está en uso.");
        }
        if (clientRepository.existsByNif(request.getNif())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El NIF ya está registrado.");
        }

        String verificationToken = UUID.randomUUID().toString();
        
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CLIENT)
                .address(request.getAddress())
                .authProvider(AuthProvider.LOCAL)
                .isVerified(false)
                .verificationToken(verificationToken)
                .build();
        userRepository.save(user);

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

    /**
     * Registra un nuevo propietario de taller (Workshop Owner) en el sistema.
     * Genera un token de verificación y despacha el correo electrónico de confirmación.
     *
     * @param request Datos del registro del dueño.
     * @return Mensaje de confirmación del registro.
     * @throws ResponseStatusException si el email ya se encuentra en uso.
     */
    @Transactional
    public String registerWorkshop(OwnerRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está en uso.");
        }

        String verificationToken = UUID.randomUUID().toString();
        
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.WORKSHOP_OWNER)
                .address(request.getAddress())
                .authProvider(AuthProvider.LOCAL)
                .isVerified(false)
                .verificationToken(verificationToken)
                .build();
        userRepository.save(user);

        Employee ownerEmployee = Employee.builder()
                .user(user)
                .nif(request.getNif())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .build();
        employeeRepository.save(ownerEmployee);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        return "Dueño registrado. Por favor, verifica tu cuenta en el correo electrónico enviado.";
    }
}
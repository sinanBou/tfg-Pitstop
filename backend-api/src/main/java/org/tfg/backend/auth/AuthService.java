package org.tfg.backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;
import org.tfg.backend.config.JwtService;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.time.LocalTime;

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


    public AuthResponse login(LoginRequest request) {
        // 1. Autenticar (si falla, Spring lanza una excepción 403 automáticamente)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Buscar al usuario
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Generar Token
        var jwtToken = jwtService.generarToken(user.getUsername());

        // 4. Devolver Token y Rol
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }
    // --- REGISTRO DE CLIENTE ---
    @Transactional
    public String registerClient(RegisterRequest request) {
        validateCommonData(request);
        if (clientRepository.existsByNif(request.getNif())) {
            throw new RuntimeException("El NIF ya está registrado.");
        }

        User user = createBaseUser(request, Role.CLIENT);

        Client client = Client.builder()
                .user(user)
                .nif(request.getNif())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .build();
        clientRepository.save(client);

        return "Cliente registrado correctamente";
    }

    // --- REGISTRO DE DUEÑO + TALLER ---
    // En backend/auth/AuthService.java

    @Transactional
    public String registerWorkshop(RegisterRequest request) {
        validateCommonData(request);

        User user = createBaseUser(request, Role.WORKSHOP_OWNER);

        Employee ownerEmployee = Employee.builder()
                .user(user)
                .build();
        employeeRepository.save(ownerEmployee);

        return "Dueño registrado correctamente";
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    private void validateCommonData(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está en uso.");
        }
    }

    private User createBaseUser(RegisterRequest request, Role role) {
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        return userRepository.save(user);
    }
}
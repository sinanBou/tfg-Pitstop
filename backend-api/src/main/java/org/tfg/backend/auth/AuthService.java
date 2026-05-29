package org.tfg.backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.auth.strategy.RegistrationStrategyFactory;
import org.tfg.backend.config.JwtService;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RegistrationStrategyFactory strategyFactory;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        var jwtToken = jwtService.generarToken(user.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    // --- REGISTRO DE CLIENTE ---
    @Transactional
    public String registerClient(RegisterRequest request) {
        return registerUser(request, Role.CLIENT);
    }

    // --- REGISTRO DE DUEÑO ---
    @Transactional
    public String registerWorkshop(RegisterRequest request) {
        return registerUser(request, Role.WORKSHOP_OWNER);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    private String registerUser(RegisterRequest request, Role role) {
        validateCommonData(request);

        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);

        // Delegar la creación del perfil específico a la estrategia correspondiente
        strategyFactory.getStrategy(role).register(request, user);

        return role == Role.CLIENT ? "Cliente registrado correctamente" : "Dueño registrado correctamente";
    }

    private void validateCommonData(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está en uso.");
        }
    }
}
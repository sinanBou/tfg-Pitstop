package org.tfg.backend.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.config.JwtService;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.auth.strategy.RegistrationStrategy;
import org.tfg.backend.auth.strategy.RegistrationStrategyFactory;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private RegistrationStrategyFactory strategyFactory;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;
    private RegisterRequest clientRegisterRequest;
    private RegisterRequest workshopRegisterRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .password("encodedPassword")
                .role(Role.CLIENT)
                .build();

        loginRequest = new LoginRequest();
        loginRequest.setEmail("sinan@pitstop.com");
        loginRequest.setPassword("rawPassword");

        clientRegisterRequest = RegisterRequest.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .password("rawPassword")
                .nif("12345678A")
                .phoneNumber("666777888")
                .address("Calle Pitstop 123")
                .build();

        workshopRegisterRequest = RegisterRequest.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .password("rawPassword")
                .nif("12345678A")
                .phoneNumber("666777888")
                .address("Calle Pitstop 123")
                .cif("B12345678")
                .companyName("Taller Sinan")
                .build();
    }

    @Test
    void login_ShouldReturnAuthResponseOnSuccess() {
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generarToken("sinan@pitstop.com")).thenReturn("mockedJwtToken");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mockedJwtToken", response.getToken());
        assertEquals("CLIENT", response.getRole());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail("sinan@pitstop.com");
        verify(jwtService, times(1)).generarToken("sinan@pitstop.com");
    }

    @Test
    void login_ShouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("Usuario no encontrado", exception.getMessage());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, never()).generarToken(anyString());
    }

    @Test
    void registerClient_ShouldCreateUserAndSaveClient() {
        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        RegistrationStrategy clientStrategy = mock(RegistrationStrategy.class);
        when(strategyFactory.getStrategy(Role.CLIENT)).thenReturn(clientStrategy);

        String result = authService.registerClient(clientRegisterRequest);

        assertEquals("Cliente registrado correctamente", result);

        verify(userRepository, times(1)).existsByEmail("sinan@pitstop.com");
        verify(passwordEncoder, times(1)).encode("rawPassword");
        verify(userRepository, times(1)).save(any(User.class));
        verify(clientStrategy, times(1)).register(eq(clientRegisterRequest), any(User.class));
    }

    @Test
    void registerClient_ShouldThrowExceptionWhenEmailExists() {
        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(true);

        Exception exception = assertThrows(RuntimeException.class, () -> authService.registerClient(clientRegisterRequest));
        assertEquals("El email ya está en uso.", exception.getMessage());

        verify(userRepository, times(1)).existsByEmail("sinan@pitstop.com");
        verify(userRepository, never()).save(any(User.class));
        verify(strategyFactory, never()).getStrategy(any(Role.class));
    }

    @Test
    void registerWorkshop_ShouldCreateUserAndSaveEmployee() {
        testUser.setRole(Role.WORKSHOP_OWNER);
        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        RegistrationStrategy workshopStrategy = mock(RegistrationStrategy.class);
        when(strategyFactory.getStrategy(Role.WORKSHOP_OWNER)).thenReturn(workshopStrategy);

        String result = authService.registerWorkshop(workshopRegisterRequest);

        assertEquals("Dueño registrado correctamente", result);

        verify(userRepository, times(1)).existsByEmail("sinan@pitstop.com");
        verify(passwordEncoder, times(1)).encode("rawPassword");
        verify(userRepository, times(1)).save(any(User.class));
        verify(workshopStrategy, times(1)).register(eq(workshopRegisterRequest), any(User.class));
    }
}

package org.tfg.backend.auth;

import org.tfg.backend.identity.EmailService;

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
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

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
    private WorkshopRepository workshopRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;
    private ClientRegisterRequest clientRegisterRequest;
    private OwnerRegisterRequest ownerRegisterRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .password("encodedPassword")
                .role(Role.CLIENT)
                .isVerified(true)
                .build();

        loginRequest = new LoginRequest("sinan@pitstop.com", "rawPassword");

        clientRegisterRequest = ClientRegisterRequest.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .password("rawPassword")
                .nif("12345678A")
                .phoneNumber("600123456")
                .address("Calle Principal 123")
                .build();

        ownerRegisterRequest = OwnerRegisterRequest.builder()
                .firstname("Sinan")
                .lastname("Bou")
                .email("sinan@pitstop.com")
                .password("rawPassword")
                .nif("12345678A")
                .phoneNumber("600123456")
                .address("Calle Principal 123")
                .build();
    }

    @Test
    void login_ShouldAuthenticateAndReturnAuthResponse() {
        when(userRepository.findByEmail("sinan@pitstop.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generarToken("sinan@pitstop.com")).thenReturn("mockedJwtToken");

        AuthResponse result = authService.login(loginRequest);

        assertNotNull(result);
        assertEquals("mockedJwtToken", result.getToken());
        assertEquals("CLIENT", result.getRole());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail("sinan@pitstop.com");
        verify(jwtService, times(1)).generarToken("sinan@pitstop.com");
    }

    @Test
    void registerClient_ShouldCreateUserAndSaveClient() {
        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(false);
        when(clientRepository.existsByNif("12345678A")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        String result = authService.registerClient(clientRegisterRequest);

        assertTrue(result.contains("Cliente registrado"));

        verify(userRepository, times(1)).existsByEmail("sinan@pitstop.com");
        verify(clientRepository, times(1)).existsByNif("12345678A");
        verify(passwordEncoder, times(1)).encode("rawPassword");
        verify(userRepository, times(1)).save(any(User.class)); 
        verify(clientRepository, times(1)).save(any(Client.class));
        verify(emailService, times(1)).sendVerificationEmail(eq("sinan@pitstop.com"), anyString());
    }

    @Test
    void registerWorkshop_ShouldCreateUserAndSaveEmployee() {
        testUser.setRole(Role.WORKSHOP_OWNER);
        Employee mockEmployee = Employee.builder().id(java.util.UUID.randomUUID()).user(testUser).build();

        when(userRepository.existsByEmail("sinan@pitstop.com")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(employeeRepository.save(any(Employee.class))).thenReturn(mockEmployee);

        String result = authService.registerWorkshop(ownerRegisterRequest);

        assertTrue(result.contains("Dueño registrado"));

        verify(userRepository, times(1)).existsByEmail("sinan@pitstop.com");
        verify(passwordEncoder, times(1)).encode("rawPassword");
        verify(userRepository, times(1)).save(any(User.class));
        verify(employeeRepository, times(1)).save(any(Employee.class));
        verify(emailService, times(1)).sendVerificationEmail(eq("sinan@pitstop.com"), anyString());
    }
}

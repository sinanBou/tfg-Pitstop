package org.tfg.backend.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void login_ShouldReturnAuthResponse() throws Exception {
        AuthResponse mockResponse = AuthResponse.builder()
                .token("mockedJwtToken")
                .role("CLIENT")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        String loginPayload = "{\"email\":\"sinan@pitstop.com\",\"password\":\"rawPassword\"}";

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("mockedJwtToken")))
                .andExpect(jsonPath("$.role", is("CLIENT")));

        verify(authService, times(1)).login(any(LoginRequest.class));
    }

    @Test
    void registerClient_ShouldReturnSuccessMessage() throws Exception {
        when(authService.registerClient(any(ClientRegisterRequest.class))).thenReturn("Cliente registrado correctamente");

        String registerPayload = "{\"firstname\":\"Sinan\",\"lastname\":\"Bou\",\"email\":\"sinan@pitstop.com\",\"password\":\"rawPassword\",\"nif\":\"12345678A\"}";

        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isOk())
                .andExpect(content().string("Cliente registrado correctamente"));

        verify(authService, times(1)).registerClient(any(ClientRegisterRequest.class));
    }

    @Test
    void registerOwner_ShouldReturnSuccessMessage() throws Exception {
        when(authService.registerOwner(any(OwnerRegisterRequest.class))).thenReturn("Dueño registrado correctamente");

        String registerPayload = "{\"firstname\":\"Sinan\",\"lastname\":\"Bou\",\"email\":\"sinan@pitstop.com\",\"password\":\"rawPassword\",\"nif\":\"12345678A\"}";

        mockMvc.perform(post("/api/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isOk())
                .andExpect(content().string("Dueño registrado correctamente"));

        verify(authService, times(1)).registerOwner(any(OwnerRegisterRequest.class));
    }
}

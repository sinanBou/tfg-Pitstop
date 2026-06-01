package org.tfg.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.tfg.backend.auth.AuthResponse;
import org.tfg.backend.auth.ClientRegisterRequest;
import org.tfg.backend.auth.LoginRequest;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.User;

import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AuthIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void endToEnd_RegistrationAndAuthenticationFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String uniqueEmail = "integration.user." + randomSuffix + "@pitstop.com";

        ClientRegisterRequest registerRequest = ClientRegisterRequest.builder()
                .firstname("Integration")
                .lastname("Tester")
                .email(uniqueEmail)
                .password("securePassword123")
                .nif("NIF" + randomSuffix.toUpperCase())
                .phoneNumber("600123456")
                .address("Calle Ficticia 123")
                .build();

        // 1. Registro
        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // 1.5. Verificar el usuario para poder iniciar sesión
        User registeredUser = userRepository.findByEmail(uniqueEmail).orElseThrow();
        registeredUser.setVerified(true);
        userRepository.save(registeredUser);

        // 2. Login para obtener el Token
        LoginRequest loginRequest = new LoginRequest(uniqueEmail, "securePassword123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role", is("CLIENT")))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);
        String jwtToken = authResponse.getToken();

        // 3. Consumir Endpoint Seguro usando el Bearer Token obtenido
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(uniqueEmail)))
                .andExpect(jsonPath("$.firstname", is("Integration")))
                .andExpect(jsonPath("$.lastname", is("Tester")))
                .andExpect(jsonPath("$.role", is("CLIENT")));
    }
}

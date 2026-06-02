package org.tfg.backend.integration;

import com.fasterxml.jackson.core.type.TypeReference;
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
import org.tfg.backend.auth.AuthResponse;
import org.tfg.backend.auth.LoginRequest;
import org.tfg.backend.auth.RegisterRequest;
import org.tfg.backend.auth.RegisterRequest;
import org.tfg.backend.client.ClientDTO;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.User;

/**
 * Integration test for the Client Profile screen:
 * - Get own profile (GET /api/clients/me)
 * - Update profile fields (PUT /api/clients/me)
 * - Search clients (GET /api/clients/search) — used by workshop staff
 * - Manual client registration (POST /api/clients/manual-register) — used by workshop staff
 */
@SpringBootTest
class ClientProfileIntegrationTest {

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
    void endToEnd_ClientProfileManagementFlow() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String clientEmail = "profile." + suffix + "@pitstop.com";

        // 1. Register a client
        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .firstname("ProfileUser")
                                .lastname("TestSurname")
                                .email(clientEmail)
                                .password("securePass123")
                                .nif("NIF-P-" + suffix.toUpperCase())
                                .phoneNumber("611222333")
                                .address("Calle del Perfil 10")
                                .build())))
                .andExpect(status().isOk());

        // Verificar el cliente en la BD para poder loguear
        User clientUser = userRepository.findByEmail(clientEmail).orElseThrow();
        clientUser.setVerified(true);
        userRepository.save(clientUser);

        // 2. Login
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(clientEmail, "securePass123"))))
                .andExpect(status().isOk())
                .andReturn();
        String jwt = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 3. GET /api/clients/me — verify profile data matches registration
        mockMvc.perform(get("/api/clients/me")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(clientEmail)))
                .andExpect(jsonPath("$.firstname", is("ProfileUser")))
                .andExpect(jsonPath("$.lastname", is("TestSurname")));

        // 4. PUT /api/clients/me — update phone number and address
        MvcResult getResult = mockMvc.perform(get("/api/clients/me")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> currentProfile = objectMapper.readValue(
                getResult.getResponse().getContentAsString(), new TypeReference<>() {});

        // Build update request maintaining required fields and changing phone/address
        ClientDTO updateRequest = ClientDTO.builder()
                .firstname((String) currentProfile.get("firstname"))
                .lastname((String) currentProfile.get("lastname"))
                .email(clientEmail)
                .phoneNumber("699888777")
                .address("Avenida Actualizada 55")
                .build();

        mockMvc.perform(put("/api/clients/me")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phoneNumber", is("699888777")))
                .andExpect(jsonPath("$.address", is("Avenida Actualizada 55")));

        // 5. GET /api/clients/me again — confirm update persisted
        mockMvc.perform(get("/api/clients/me")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phoneNumber", is("699888777")))
                .andExpect(jsonPath("$.address", is("Avenida Actualizada 55")));
    }

    @Test
    void endToEnd_WorkshopSearchAndManualClientRegistrationFlow() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner.clt." + suffix + "@pitstop.com";

        // 1. Register a workshop owner (who can search/register clients)
        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .firstname("OwnerClient").lastname("Search")
                                .email(ownerEmail).password("pass1234")
                                .nif("NIF-WC-" + suffix.toUpperCase())
                                .phoneNumber("622333444")
                                .address("Calle Taller Principal 12")
                                .cif("CIF-TALLER-" + suffix.toUpperCase())
                                .companyName("Taller Principal")
                                .build())))
                .andExpect(status().isOk());

        // Verificar el dueño en la BD para poder loguear
        User ownerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        ownerUser.setVerified(true);
        userRepository.save(ownerUser);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(ownerEmail, "pass1234"))))
                .andExpect(status().isOk())
                .andReturn();
        String ownerJwt = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 2. Search clients (empty query returns paginated results)
        mockMvc.perform(get("/api/clients/search")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("query", "")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));

        // 3. Manual registration of a walk-in client by the workshop
        Map<String, Object> manualClientPayload = Map.of(
                "firstname", "WalkIn",
                "lastname", "Customer",
                "nif", "NIFManual" + suffix.toUpperCase(),
                "phoneNumber", "600111222",
                "email", "walkin." + suffix + "@pitstop.com"
        );

        mockMvc.perform(post("/api/clients/manual-register")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(manualClientPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstname", is("WalkIn")))
                .andExpect(jsonPath("$.lastname", is("Customer")));

        // 4. Search with the new client's name to confirm it's now searchable
        mockMvc.perform(get("/api/clients/search")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("query", "WalkIn")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }
}

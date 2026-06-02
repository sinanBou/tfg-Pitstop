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

import java.util.HashMap;
import java.util.List;
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
 * Integration test for Workshop configuration and search:
 * - Create workshop (POST /api/workshops)
 * - List all workshops (GET /api/workshops)
 * - Get workshop by ID (GET /api/workshops/{id})
 * - Get workshops by owner (GET /api/workshops/owner/{ownerId})
 * - Search workshops (GET /api/workshops/search)
 * - Update workshop settings (PUT /api/workshops/{id}/settings)
 */
@SpringBootTest
class WorkshopSettingsIntegrationTest {

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
    void endToEnd_WorkshopSearchAndSettingsFlow() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner.ws." + suffix + "@pitstop.com";
        String workshopName = "Taller Settings " + suffix;

        // 1. Register workshop owner
        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .firstname("OwnerWS").lastname("Settings")
                                .email(ownerEmail).password("pass1234")
                                .nif("NIF-WS-" + suffix.toUpperCase())
                                .phoneNumber("655555444")
                                .address("Calle Settings 5")
                                .cif("SET" + suffix.toUpperCase())
                                .companyName(workshopName)
                                .build())))
                .andExpect(status().isOk());

        // Verificar dueño en BD
        User ownerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        ownerUser.setVerified(true);
        userRepository.save(ownerUser);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(ownerEmail, "pass1234"))))
                .andExpect(status().isOk())
                .andReturn();
        String ownerJwt = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 2. Get employee ID
        MvcResult empResult = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();
        Map<String, Object> empMap = objectMapper.readValue(
                empResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID ownerId = UUID.fromString((String) empMap.get("id"));

        // 3. Create workshop
        Map<String, Object> createPayload = new HashMap<>();
        createPayload.put("cif", "SET" + suffix.toUpperCase());
        createPayload.put("companyName", workshopName);
        createPayload.put("address", "Calle Configuración 3");
        createPayload.put("ownerId", ownerId.toString());
        createPayload.put("openTime", "09:00:00");
        createPayload.put("closeTime", "17:00:00");
        createPayload.put("slotDurationMinutes", 60);
        createPayload.put("workingDays", "1,2,3,4,5");
        createPayload.put("hourlyRate", 45.0);
        createPayload.put("includeOwnerInPlanning", false);

        MvcResult createResult = mockMvc.perform(post("/api/workshops")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is(workshopName)))
                .andExpect(jsonPath("$.hourlyRate", is(45.0)))
                .andReturn();

        Map<String, Object> workshopMap = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID workshopId = UUID.fromString((String) workshopMap.get("id"));

        // 4. GET /api/workshops — verify workshop appears in the full list
        MvcResult allResult = mockMvc.perform(get("/api/workshops")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> allWorkshops = objectMapper.readValue(
                allResult.getResponse().getContentAsString(), new TypeReference<>() {});
        assertTrue(allWorkshops.stream().anyMatch(w -> workshopId.toString().equals(w.get("id"))),
                "El taller recién creado debe aparecer en la lista global");

        // 5. GET /api/workshops/{id} — get by specific ID
        mockMvc.perform(get("/api/workshops/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(workshopId.toString())))
                .andExpect(jsonPath("$.companyName", is(workshopName)));

        // 6. GET /api/workshops/owner/{ownerId} — get workshops by owner
        MvcResult ownerResult = mockMvc.perform(get("/api/workshops/owner/" + ownerId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> ownerWorkshops = objectMapper.readValue(
                ownerResult.getResponse().getContentAsString(), new TypeReference<>() {});
        assertTrue(ownerWorkshops.stream().anyMatch(w -> workshopId.toString().equals(w.get("id"))),
                "El taller debe aparecer en la lista de talleres del propietario");

        // 7. GET /api/workshops/search — search by name fragment
        mockMvc.perform(get("/api/workshops/search")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("query", "Settings " + suffix)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));

        // 8. PUT /api/workshops/{id}/settings — update hourly rate and slot duration
        Map<String, Object> settingsPayload = new HashMap<>();
        settingsPayload.put("companyName", workshopName);
        settingsPayload.put("address", "Calle Configuración 3");
        settingsPayload.put("ownerId", ownerId.toString());
        settingsPayload.put("cif", "SET" + suffix.toUpperCase());
        settingsPayload.put("openTime", "08:00:00");
        settingsPayload.put("closeTime", "20:00:00");
        settingsPayload.put("slotDurationMinutes", 30);
        settingsPayload.put("workingDays", "1,2,3,4,5,6");
        settingsPayload.put("hourlyRate", 65.0);
        settingsPayload.put("includeOwnerInPlanning", true);

        mockMvc.perform(put("/api/workshops/" + workshopId + "/settings")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settingsPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hourlyRate", is(65.0)))
                .andExpect(jsonPath("$.slotDurationMinutes", is(30)));

        // 9. Verify settings persisted with a fresh GET
        mockMvc.perform(get("/api/workshops/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hourlyRate", is(65.0)))
                .andExpect(jsonPath("$.slotDurationMinutes", is(30)));
    }
}

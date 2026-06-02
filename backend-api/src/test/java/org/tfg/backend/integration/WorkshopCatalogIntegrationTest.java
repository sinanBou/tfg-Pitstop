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
 * Integration test for the Service Catalog screen of the workshop:
 * - Get the full catalog (GET /api/catalog/workshop/{id})
 * - Create a custom category (POST /api/catalog/workshop/{id}/categories)
 * - Create a task within that category (POST /api/catalog/workshop/{id}/categories/{catId}/tasks)
 * - Update the task (PUT /api/catalog/tasks/{taskId})
 * - Delete the task (DELETE /api/catalog/tasks/{taskId})
 */
@SpringBootTest
class WorkshopCatalogIntegrationTest {

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
    void endToEnd_WorkshopServiceCatalogFlow() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner.cat." + suffix + "@pitstop.com";

        // 1. Register workshop owner
        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .firstname("OwnerCat").lastname("Test")
                                .email(ownerEmail).password("pass1234")
                                .nif("NIF-CT-" + suffix.toUpperCase())
                                .phoneNumber("677888999")
                                .address("Calle Catálogo 123")
                                .cif("CIF-CT-" + suffix.toUpperCase())
                                .companyName("Taller Cat " + suffix)
                                .build())))
                .andExpect(status().isOk());

        // Verificar el dueño en la base de datos para poder iniciar sesión
        User ownerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        ownerUser.setVerified(true);
        userRepository.save(ownerUser);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(ownerEmail, "pass1234"))))
                .andExpect(status().isOk())
                .andReturn();
        String ownerJwt = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 2. Get employee ID and create workshop
        MvcResult empResult = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();
        UUID ownerId = UUID.fromString((String) objectMapper.readValue(
                empResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {}).get("id"));

        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("cif", "CAT" + suffix.toUpperCase());
        wsPayload.put("companyName", "Taller Cat " + suffix);
        wsPayload.put("address", "Calle Catálogo 7");
        wsPayload.put("ownerId", ownerId.toString());
        wsPayload.put("openTime", "08:00:00");
        wsPayload.put("closeTime", "18:00:00");
        wsPayload.put("slotDurationMinutes", 60);
        wsPayload.put("workingDays", "1,2,3,4,5");
        wsPayload.put("hourlyRate", 55.0);
        wsPayload.put("includeOwnerInPlanning", true);

        MvcResult wsResult = mockMvc.perform(post("/api/workshops")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wsPayload)))
                .andExpect(status().isOk())
                .andReturn();

        UUID workshopId = UUID.fromString((String) objectMapper.readValue(
                wsResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {}).get("id"));

        // 3. GET catalog — workshop has a default seeded catalog
        MvcResult catalogResult = mockMvc.perform(get("/api/catalog/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> catalog = objectMapper.readValue(
                catalogResult.getResponse().getContentAsString(), new TypeReference<>() {});
        assertFalse(catalog.isEmpty(), "El taller debe tener categorías de catálogo por defecto");

        // 4. Create a custom category
        MvcResult categoryResult = mockMvc.perform(post("/api/catalog/workshop/" + workshopId + "/categories")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("displayName", "Especiales " + suffix))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName", is("Especiales " + suffix)))
                .andReturn();

        Map<String, Object> newCategory = objectMapper.readValue(
                categoryResult.getResponse().getContentAsString(), new TypeReference<>() {});
        UUID categoryId = UUID.fromString((String) newCategory.get("id"));

        // 5. Create a task within that custom category
        Map<String, Object> taskPayload = new HashMap<>();
        taskPayload.put("code", "ESP-" + suffix.toUpperCase().substring(0, 4));
        taskPayload.put("name", "Diagnóstico especial de motor");
        taskPayload.put("hours", 1.5);

        MvcResult taskResult = mockMvc.perform(post("/api/catalog/workshop/" + workshopId + "/categories/" + categoryId + "/tasks")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(taskPayload.get("code"))))
                .andExpect(jsonPath("$.name", is("Diagnóstico especial de motor")))
                .andReturn();

        Map<String, Object> createdTask = objectMapper.readValue(
                taskResult.getResponse().getContentAsString(), new TypeReference<>() {});
        UUID taskId = UUID.fromString((String) createdTask.get("id"));

        // 6. Update the task
        Map<String, Object> updatePayload = new HashMap<>();
        updatePayload.put("id", taskId.toString());
        updatePayload.put("code", taskPayload.get("code"));
        updatePayload.put("name", "Diagnóstico avanzado de motor y transmisión");
        updatePayload.put("hours", 2.0);

        mockMvc.perform(put("/api/catalog/tasks/" + taskId)
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Diagnóstico avanzado de motor y transmisión")))
                .andExpect(jsonPath("$.hours", is(2.0)));

        // 7. Verify the updated task appears in the catalog
        MvcResult updatedCatalogResult = mockMvc.perform(get("/api/catalog/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> updatedCatalog = objectMapper.readValue(
                updatedCatalogResult.getResponse().getContentAsString(), new TypeReference<>() {});

        boolean taskFoundInCatalog = updatedCatalog.stream()
                .filter(cat -> categoryId.toString().equals(cat.get("id")))
                .findFirst()
                .map(cat -> {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> tasks = (List<Map<String, Object>>) cat.get("tasks");
                    return tasks != null && tasks.stream().anyMatch(t -> taskId.toString().equals(t.get("id")));
                })
                .orElse(false);

        assertTrue(taskFoundInCatalog, "La tarea actualizada debe aparecer en el catálogo del taller");

        // 8. Delete the task
        mockMvc.perform(delete("/api/catalog/tasks/" + taskId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // 9. Verify task is gone from catalog
        MvcResult finalCatalogResult = mockMvc.perform(get("/api/catalog/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> finalCatalog = objectMapper.readValue(
                finalCatalogResult.getResponse().getContentAsString(), new TypeReference<>() {});

        boolean taskStillPresent = finalCatalog.stream()
                .filter(cat -> categoryId.toString().equals(cat.get("id")))
                .findFirst()
                .map(cat -> {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> tasks = (List<Map<String, Object>>) cat.get("tasks");
                    return tasks != null && tasks.stream().anyMatch(t -> taskId.toString().equals(t.get("id")));
                })
                .orElse(false);

        assertFalse(taskStillPresent, "La tarea eliminada no debe aparecer en el catálogo");
    }
}

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
import org.tfg.backend.auth.OwnerRegisterRequest;
import org.tfg.backend.auth.LoginRequest;
import org.tfg.backend.employee.EmployeeDTO;

import org.tfg.backend.user.UserRepository;
import org.tfg.backend.user.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class WorkshopIntegrationTest {

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
    void endToEnd_WorkshopAndCatalogManagementFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner." + randomSuffix + "@pitstop.com";

        // 1. Registrar dueño del taller
        OwnerRegisterRequest registerOwner = OwnerRegisterRequest.builder()
                .firstname("OwnerName")
                .lastname("OwnerLastname")
                .email(ownerEmail)
                .password("workshopPassword123")
                .nif("NIF-" + randomSuffix.toUpperCase())
                .phoneNumber("655666777")
                .address("Calle Taller 123")
                .build();

        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerOwner)))
                .andExpect(status().isOk());

        // Verificar el usuario para poder iniciar sesión
        User registeredUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        registeredUser.setVerified(true);
        userRepository.save(registeredUser);

        // 2. Login de Dueño
        LoginRequest loginRequest = new LoginRequest(ownerEmail, "workshopPassword123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String authResponseString = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(authResponseString, AuthResponse.class);
        String jwtToken = authResponse.getToken();

        // 3. Obtener el ID del Empleado (Dueño)
        MvcResult meResult = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        String meResponseString = meResult.getResponse().getContentAsString();
        EmployeeDTO employeeDto = objectMapper.readValue(meResponseString, EmployeeDTO.class);
        UUID employeeId = employeeDto.getId();
        assertNotNull(employeeId);

        // 4. Crear un Taller asociado a ese dueño
        Map<String, Object> workshopPayload = new HashMap<>();
        workshopPayload.put("cif", "B" + randomSuffix.toUpperCase() + "12");
        workshopPayload.put("companyName", "Taller Integration " + randomSuffix);
        workshopPayload.put("address", "Polígono Industrial Norte 42");
        workshopPayload.put("ownerId", employeeId.toString());
        workshopPayload.put("openTime", "08:00:00");
        workshopPayload.put("closeTime", "18:00:00");
        workshopPayload.put("slotDurationMinutes", 30);
        workshopPayload.put("workingDays", "1,2,3,4,5");
        workshopPayload.put("hourlyRate", 55.0);
        workshopPayload.put("includeOwnerInPlanning", true);

        MvcResult workshopResult = mockMvc.perform(post("/api/workshops")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workshopPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.companyName", is("Taller Integration " + randomSuffix)))
                .andReturn();

        String workshopResponseString = workshopResult.getResponse().getContentAsString();
        Map<String, Object> workshopMap = objectMapper.readValue(workshopResponseString, new TypeReference<Map<String, Object>>() {});
        UUID workshopId = UUID.fromString((String) workshopMap.get("id"));

        // 5. Crear una Categoría en el catálogo del taller creado
        Map<String, String> categoryPayload = new HashMap<>();
        categoryPayload.put("displayName", "Frenos y Suspensión");

        mockMvc.perform(post("/api/catalog/workshop/" + workshopId + "/categories")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.displayName", is("Frenos y Suspensión")));

        // 6. Consultar y verificar el catálogo completo
        MvcResult catalogResult = mockMvc.perform(get("/api/catalog/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        String catalogResponseString = catalogResult.getResponse().getContentAsString();
        List<TaskCategory> categories = objectMapper.readValue(catalogResponseString, new TypeReference<List<TaskCategory>>() {});
        
        assertNotNull(categories);
        assertFalse(categories.isEmpty());
        assertTrue(categories.stream().anyMatch(cat -> cat.getDisplayName().equals("Frenos y Suspensión")));
    }
}

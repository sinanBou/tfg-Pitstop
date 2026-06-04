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

@SpringBootTest
class WorkshopPartsIntegrationTest {

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
    void endToEnd_WorkshopPartsManagementFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner.parts." + randomSuffix + "@pitstop.com";
        String clientEmail = "client.parts." + randomSuffix + "@pitstop.com";
        String licensePlate = "PT" + randomSuffix.toUpperCase();

        // 1. Registrar e Iniciar Sesión como Dueño
        RegisterRequest registerOwner = RegisterRequest.builder()
                .firstname("OwnerParts")
                .lastname("LastName")
                .email(ownerEmail)
                .password("ownerPassword123")
                .nif("NIF-O-" + randomSuffix.toUpperCase())
                .phoneNumber("633222111")
                .address("Calle Parts Taller 7")
                .cif("CIF-" + randomSuffix.toUpperCase())
                .companyName("Taller Parts Integration " + randomSuffix)
                .build();

        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerOwner)))
                .andExpect(status().isOk());

        // Verificar el dueño para poder iniciar sesión
        User registeredOwnerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        registeredOwnerUser.setVerified(true);
        userRepository.save(registeredOwnerUser);

        LoginRequest loginOwner = new LoginRequest(ownerEmail, "ownerPassword123");
        MvcResult loginOwnerResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOwner)))
                .andExpect(status().isOk())
                .andReturn();

        String ownerJwt = objectMapper.readValue(loginOwnerResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 2. Registrar e Iniciar Sesión como Cliente
        RegisterRequest registerClient = RegisterRequest.builder()
                .firstname("ClientParts")
                .lastname("LastNameClient")
                .email(clientEmail)
                .password("clientPassword123")
                .nif("NIF-C-" + randomSuffix.toUpperCase())
                .phoneNumber("600444555")
                .address("Calle Cliente Parts 10")
                .build();

        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerClient)))
                .andExpect(status().isOk());

        // Verificar el cliente para poder iniciar sesión
        User registeredClientUser = userRepository.findByEmail(clientEmail).orElseThrow();
        registeredClientUser.setVerified(true);
        userRepository.save(registeredClientUser);

        LoginRequest loginClient = new LoginRequest(clientEmail, "clientPassword123");
        MvcResult loginClientResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginClient)))
                .andExpect(status().isOk())
                .andReturn();

        String clientJwt = objectMapper.readValue(loginClientResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 3. Obtener el ID del Empleado (Dueño) para crear el taller
        MvcResult employeeMeResult = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> employeeMap = objectMapper.readValue(employeeMeResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID employeeId = UUID.fromString((String) employeeMap.get("id"));

        // 4. Crear un Taller asociado a ese dueño
        Map<String, Object> workshopPayload = new HashMap<>();
        workshopPayload.put("cif", "B" + randomSuffix.toUpperCase() + "77");
        workshopPayload.put("companyName", "Taller Parts Integration " + randomSuffix);
        workshopPayload.put("address", "Avenida del Recambio 5");
        workshopPayload.put("ownerId", employeeId.toString());
        workshopPayload.put("openTime", "08:00:00");
        workshopPayload.put("closeTime", "18:00:00");
        workshopPayload.put("slotDurationMinutes", 60);
        workshopPayload.put("workingDays", "1,2,3,4,5");
        workshopPayload.put("hourlyRate", 60.0);
        workshopPayload.put("includeOwnerInPlanning", true);

        MvcResult workshopResult = mockMvc.perform(post("/api/workshops")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workshopPayload)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> workshopMap = objectMapper.readValue(workshopResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID workshopId = UUID.fromString((String) workshopMap.get("id"));

        // 5. Crear una Categoría de Repuestos
        Map<String, Object> categoryPayload = new HashMap<>();
        categoryPayload.put("displayName", "Filtros " + randomSuffix);

        MvcResult categoryResult = mockMvc.perform(post("/api/parts/workshop/" + workshopId + "/categories")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryPayload)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> categoryMap = objectMapper.readValue(categoryResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID categoryId = UUID.fromString((String) categoryMap.get("id"));

        // 6. Registrar un Repuesto en el Inventario del Taller
        Map<String, Object> partPayload = new HashMap<>();
        partPayload.put("oemReference", "OEM-" + randomSuffix.toUpperCase() + "-FL");
        partPayload.put("name", "Filtro de Aceite Bosch Premium");
        partPayload.put("manufacturer", "Bosch");
        partPayload.put("technicalSpecs", "Filtro premium de larga duración");
        partPayload.put("categoryId", categoryId.toString());
        partPayload.put("costPrice", 12.50);
        partPayload.put("retailPrice", 24.99);
        partPayload.put("stockQuantity", 15);
        partPayload.put("avisoThreshold", 3);

        MvcResult partResult = mockMvc.perform(post("/api/parts/workshop/" + workshopId + "/inventory")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partPayload)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> partMap = objectMapper.readValue(partResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID inventoryItemId = UUID.fromString((String) partMap.get("id"));

        // Obtener el ID de la pieza física asociada (de la entidad catalog/Part)
        @SuppressWarnings("unchecked")
        Map<String, Object> partItem = (Map<String, Object>) partMap.get("part");
        UUID partId = UUID.fromString((String) partItem.get("id"));

        // 7. Consultar categorías e inventario
        mockMvc.perform(get("/api/parts/workshop/" + workshopId + "/categories")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        mockMvc.perform(get("/api/parts/workshop/" + workshopId + "/inventory")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // 8. Crear un Vehículo para el Cliente
        Map<String, Object> vehicleRequest = new HashMap<>();
        vehicleRequest.put("brand", "Volkswagen");
        vehicleRequest.put("model", "Golf");
        vehicleRequest.put("licensePlate", licensePlate);
        vehicleRequest.put("vin", "VWVIN-" + randomSuffix.toUpperCase());
        vehicleRequest.put("year", 2020);
        vehicleRequest.put("color", "Negro");

        MvcResult registerVehicleResult = mockMvc.perform(post("/api/vehicles/register")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> vehicleMap = objectMapper.readValue(registerVehicleResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID vehicleId = UUID.fromString((String) vehicleMap.get("id"));

        // 9. Crear una Cita
        Map<String, Object> appointmentRequest = new HashMap<>();
        appointmentRequest.put("vehicleId", vehicleId.toString());
        appointmentRequest.put("workshopId", workshopId.toString());
        appointmentRequest.put("dateTime", "2026-08-20T10:00:00");
        appointmentRequest.put("description", "Reemplazo de filtro de aceite y revisión.");
        appointmentRequest.put("serviceType", "MANTENIMIENTO");
        appointmentRequest.put("estimatedDuration", 45);

        mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isOk())
                .andReturn();

        // Buscamos la cita del cliente para obtener su ID
        MvcResult myAppointmentsResult = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + clientJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> clientAppointments = objectMapper.readValue(myAppointmentsResult.getResponse().getContentAsString(), new TypeReference<List<Map<String, Object>>>() {});
        UUID appointmentId = UUID.fromString((String) clientAppointments.get(0).get("id"));

        // 10. Asignar el Repuesto a la Cita (desde el taller)
        Map<String, Object> assignPayload = new HashMap<>();
        assignPayload.put("partId", partId.toString());
        assignPayload.put("quantity", 1);
        assignPayload.put("discount", 0.0);

        mockMvc.perform(post("/api/parts/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignPayload)))
                .andExpect(status().isOk());

        // Verificar que el repuesto está asignado a la cita
        mockMvc.perform(get("/api/parts/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].part.id", is(partId.toString())))
                .andExpect(jsonPath("$[0].quantityUsed", is(1)));

        // 11. Eliminar el repuesto asignado de la cita (restaura stock)
        mockMvc.perform(delete("/api/parts/appointments/" + appointmentId + "/parts/" + partId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // 12. Limpieza de base de datos de repuestos creados
        mockMvc.perform(delete("/api/parts/inventory/" + inventoryItemId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/parts/categories/" + categoryId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // Cancelar y borrar cita para limpieza
        mockMvc.perform(delete("/api/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());
    }
}

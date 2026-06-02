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
import org.tfg.backend.invoice.InvoiceDTO;

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
class WorkshopInvoiceIntegrationTest {

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
    void endToEnd_WorkshopInvoiceManagementFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner.inv." + randomSuffix + "@pitstop.com";
        String clientEmail = "client.inv." + randomSuffix + "@pitstop.com";
        String licensePlate = "PI" + randomSuffix.toUpperCase();

        // 1. Registrar e Iniciar Sesión como Dueño de Taller
        RegisterRequest registerOwner = RegisterRequest.builder()
                .firstname("OwnerInv")
                .lastname("LastName")
                .email(ownerEmail)
                .password("ownerPassword123")
                .nif("NIF-O-" + randomSuffix.toUpperCase())
                .phoneNumber("655444333")
                .address("Calle Taller 15")
                .cif("CIF-" + randomSuffix.toUpperCase())
                .companyName("Taller Inv Integration " + randomSuffix)
                .build();

        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerOwner)))
                .andExpect(status().isOk());

        // Verificar dueño en BD para loguear
        User ownerUser = userRepository.findByEmail(ownerEmail).orElseThrow();
        ownerUser.setVerified(true);
        userRepository.save(ownerUser);

        LoginRequest loginOwner = new LoginRequest(ownerEmail, "ownerPassword123");
        MvcResult loginOwnerResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOwner)))
                .andExpect(status().isOk())
                .andReturn();

        String ownerJwt = objectMapper.readValue(loginOwnerResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 2. Registrar e Iniciar Sesión como Cliente
        RegisterRequest registerClient = RegisterRequest.builder()
                .firstname("ClientInv")
                .lastname("LastNameClient")
                .email(clientEmail)
                .password("clientPassword123")
                .nif("NIF-C-" + randomSuffix.toUpperCase())
                .phoneNumber("600888999")
                .address("Calle Cliente Factura 8")
                .build();

        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerClient)))
                .andExpect(status().isOk());

        // Verificar cliente en BD para loguear
        User clientUser = userRepository.findByEmail(clientEmail).orElseThrow();
        clientUser.setVerified(true);
        userRepository.save(clientUser);

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
        workshopPayload.put("cif", "B" + randomSuffix.toUpperCase() + "66");
        workshopPayload.put("companyName", "Taller Inv Integration " + randomSuffix);
        workshopPayload.put("address", "Calle del Cobro 2");
        workshopPayload.put("ownerId", employeeId.toString());
        workshopPayload.put("openTime", "08:00:00");
        workshopPayload.put("closeTime", "18:00:00");
        workshopPayload.put("slotDurationMinutes", 60);
        workshopPayload.put("workingDays", "1,2,3,4,5");
        workshopPayload.put("hourlyRate", 50.0);
        workshopPayload.put("includeOwnerInPlanning", true);

        MvcResult workshopResult = mockMvc.perform(post("/api/workshops")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workshopPayload)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> workshopMap = objectMapper.readValue(workshopResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID workshopId = UUID.fromString((String) workshopMap.get("id"));

        // 5. Registrar un Vehículo
        Map<String, Object> vehicleRequest = new HashMap<>();
        vehicleRequest.put("brand", "Ford");
        vehicleRequest.put("model", "Focus");
        vehicleRequest.put("licensePlate", licensePlate);
        vehicleRequest.put("vin", "FDVIN-" + randomSuffix.toUpperCase());
        vehicleRequest.put("year", 2019);
        vehicleRequest.put("color", "Blanco");

        MvcResult registerVehicleResult = mockMvc.perform(post("/api/vehicles/register")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> vehicleMap = objectMapper.readValue(registerVehicleResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID vehicleId = UUID.fromString((String) vehicleMap.get("id"));

        // 6. Crear una Cita
        Map<String, Object> appointmentRequest = new HashMap<>();
        appointmentRequest.put("vehicleId", vehicleId.toString());
        appointmentRequest.put("workshopId", workshopId.toString());
        appointmentRequest.put("dateTime", "2026-09-10T12:00:00");
        appointmentRequest.put("description", "Revisión pre-ITV básica.");
        appointmentRequest.put("serviceType", "MANTENIMIENTO");
        appointmentRequest.put("estimatedDuration", 60);

        mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult myAppointmentsResult = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + clientJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> clientAppointments = objectMapper.readValue(myAppointmentsResult.getResponse().getContentAsString(), new TypeReference<List<Map<String, Object>>>() {});
        UUID appointmentId = UUID.fromString((String) clientAppointments.get(0).get("id"));

        // 7. Crear una Factura (desde el taller)
        InvoiceDTO invoiceRequest = InvoiceDTO.builder()
                .appointmentId(appointmentId)
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .build();

        MvcResult invoiceResult = mockMvc.perform(post("/api/invoices")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andReturn();

        Map<String, Object> invoiceMap = objectMapper.readValue(invoiceResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID invoiceId = UUID.fromString((String) invoiceMap.get("id"));

        // 8. Consultar facturas de la cita
        mockMvc.perform(get("/api/invoices/appointment/" + appointmentId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(invoiceId.toString())));
    }
}

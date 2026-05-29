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
import org.tfg.backend.employee.EmployeeDTO;

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

@SpringBootTest
class AppointmentIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void endToEnd_AppointmentLifecycleFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String clientEmail = "client.appt." + randomSuffix + "@pitstop.com";
        String ownerEmail = "owner.appt." + randomSuffix + "@pitstop.com";
        String licensePlate = "P" + randomSuffix.toUpperCase();

        // 1. Registrar e Iniciar Sesión como Cliente
        RegisterRequest registerClient = RegisterRequest.builder()
                .firstname("ClientAppt")
                .lastname("ClientLastname")
                .email(clientEmail)
                .password("clientPassword123")
                .nif("NIF" + randomSuffix.toUpperCase())
                .phoneNumber("600123123")
                .address("Calle Cliente 10")
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerClient)))
                .andReturn();
        if (regResult.getResponse().getStatus() != 200) {
            System.err.println("REGISTRATION FAILED: Status = " + regResult.getResponse().getStatus());
            System.err.println("REGISTRATION FAILED: Content = " + regResult.getResponse().getContentAsString());
        }
        assertEquals(200, regResult.getResponse().getStatus());

        LoginRequest loginClient = new LoginRequest(clientEmail, "clientPassword123");
        MvcResult loginClientResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginClient)))
                .andExpect(status().isOk())
                .andReturn();

        String clientAuthResponse = loginClientResult.getResponse().getContentAsString();
        String clientJwt = objectMapper.readValue(clientAuthResponse, AuthResponse.class).getToken();

        // 2. Registrar e Iniciar Sesión como Dueño de Taller
        RegisterRequest registerOwner = RegisterRequest.builder()
                .firstname("OwnerAppt")
                .lastname("OwnerLastname")
                .email(ownerEmail)
                .password("ownerPassword123")
                .nif("NIF-O-" + randomSuffix.toUpperCase())
                .phoneNumber("699888777")
                .address("Calle Taller 50")
                .cif("CIF-" + randomSuffix.toUpperCase())
                .companyName("Taller Appt Integration " + randomSuffix)
                .build();

        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerOwner)))
                .andExpect(status().isOk());

        LoginRequest loginOwner = new LoginRequest(ownerEmail, "ownerPassword123");
        MvcResult loginOwnerResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOwner)))
                .andExpect(status().isOk())
                .andReturn();

        String ownerAuthResponse = loginOwnerResult.getResponse().getContentAsString();
        String ownerJwt = objectMapper.readValue(ownerAuthResponse, AuthResponse.class).getToken();

        // 3. Obtener el ID del Empleado (Dueño) del Taller para crear el taller
        MvcResult employeeMeResult = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeDTO employeeDto = objectMapper.readValue(employeeMeResult.getResponse().getContentAsString(), EmployeeDTO.class);
        UUID employeeId = employeeDto.getId();

        // 4. Crear un Taller asociado a ese dueño
        Map<String, Object> workshopPayload = new HashMap<>();
        workshopPayload.put("cif", "B" + randomSuffix.toUpperCase() + "99");
        workshopPayload.put("companyName", "Taller Appt Integration " + randomSuffix);
        workshopPayload.put("address", "Avenida de la Automoción 99");
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

        // 5. Registrar un Vehículo para el Cliente
        Map<String, Object> vehicleRequest = new HashMap<>();
        vehicleRequest.put("brand", "Ford");
        vehicleRequest.put("model", "Focus");
        vehicleRequest.put("licensePlate", licensePlate);
        vehicleRequest.put("vin", "FORDVIN-" + randomSuffix.toUpperCase());
        vehicleRequest.put("year", 2021);
        vehicleRequest.put("color", "Azul");

        MvcResult registerVehicleResult = mockMvc.perform(post("/api/vehicles/register")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> vehicleMap = objectMapper.readValue(registerVehicleResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID vehicleId = UUID.fromString((String) vehicleMap.get("id"));

        // 6. Crear una Cita (Reserva)
        Map<String, Object> appointmentRequest = new HashMap<>();
        appointmentRequest.put("vehicleId", vehicleId.toString());
        appointmentRequest.put("workshopId", workshopId.toString());
        appointmentRequest.put("dateTime", "2026-07-15T10:00:00");
        appointmentRequest.put("description", "Revisión general y cambio de filtros.");
        appointmentRequest.put("serviceType", "MANTENIMIENTO");
        appointmentRequest.put("estimatedDuration", 60);

        mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isOk());

        // 7. Consultar citas propias del cliente
        MvcResult myAppointmentsResult = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + clientJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> clientAppointments = objectMapper.readValue(myAppointmentsResult.getResponse().getContentAsString(), new TypeReference<List<Map<String, Object>>>() {});
        assertEquals(1, clientAppointments.size());
        UUID appointmentId = UUID.fromString((String) clientAppointments.get(0).get("id"));
        assertEquals("PENDING", clientAppointments.get(0).get("status"));

        // 8. Consultar citas desde el taller (Dueño)
        MvcResult workshopAppointmentsResult = mockMvc.perform(get("/api/appointments/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> wsAppointments = objectMapper.readValue(workshopAppointmentsResult.getResponse().getContentAsString(), new TypeReference<List<Map<String, Object>>>() {});
        assertEquals(1, wsAppointments.size());

        // 9. Realizar el Check-In del vehículo (recepcionar)
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/check-in")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("kilometers", "125000")
                        .param("notes", "Golpe leve en paragolpes delantero."))
                .andExpect(status().isOk());

        // 10. Actualizar el estado de la cita a IN_PROGRESS
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/status")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk());

        // 11. Eliminar la cita (debe fallar si es completada, pero como está en curso o pendiente, se borra correctamente al cancelarla)
        // Volvemos a PENDING o CONFIRMED para borrarla sin problemas de transiciones protegidas
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/status")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // 12. Verificar que la cita ya no exista en la lista del cliente
        MvcResult myAppointmentsAfterDeleteResult = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + clientJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> clientAppointmentsAfterDelete = objectMapper.readValue(myAppointmentsAfterDeleteResult.getResponse().getContentAsString(), new TypeReference<List<Map<String, Object>>>() {});
        assertTrue(clientAppointmentsAfterDelete.isEmpty(), "La cita eliminada ya no debería estar en la lista de citas del cliente.");
    }
}

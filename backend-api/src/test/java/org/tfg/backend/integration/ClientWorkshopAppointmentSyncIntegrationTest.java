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

/**
 * Tests that a client and a workshop see the exact same appointment state
 * at every transition step of the lifecycle.
 * This validates real-time consistency between both dashboard views.
 */
@SpringBootTest
class ClientWorkshopAppointmentSyncIntegrationTest {

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
    void endToEnd_ClientAndWorkshopSeeTheSameAppointmentStateAtEveryStep() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail  = "owner.sync." + suffix + "@pitstop.com";
        String clientEmail = "client.sync." + suffix + "@pitstop.com";
        String plate       = "SY" + suffix.toUpperCase();

        // ── 1. Setup: Register owner, client, workshop & vehicle ──────────────
        mockMvc.perform(post("/api/auth/register/workshop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .firstname("OwnerSync").lastname("Test")
                                .email(ownerEmail).password("pass1234")
                                .nif("NIF-OS-" + suffix.toUpperCase())
                                .phoneNumber("633444555")
                                .address("Calle Sync Owner 1")
                                .cif("CIF-SYNC-" + suffix.toUpperCase())
                                .companyName("Taller Sync " + suffix)
                                .build())))
                .andExpect(status().isOk());

        String ownerJwt = login(ownerEmail, "pass1234");

        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .firstname("ClientSync").lastname("Test")
                                .email(clientEmail).password("pass1234")
                                .nif("NIF-CS-" + suffix.toUpperCase())
                                .phoneNumber("644555666")
                                .address("Calle Sync Client 1")
                                .build())))
                .andExpect(status().isOk());

        String clientJwt = login(clientEmail, "pass1234");

        // Get owner's employee ID to create workshop
        UUID employeeId = getEmployeeId(ownerJwt);

        // Create workshop
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("cif", "SYNC" + suffix.toUpperCase());
        wsPayload.put("companyName", "Taller Sync " + suffix);
        wsPayload.put("address", "Calle Sync 1");
        wsPayload.put("ownerId", employeeId.toString());
        wsPayload.put("openTime", "08:00:00");
        wsPayload.put("closeTime", "18:00:00");
        wsPayload.put("slotDurationMinutes", 60);
        wsPayload.put("workingDays", "1,2,3,4,5");
        wsPayload.put("hourlyRate", 50.0);
        wsPayload.put("includeOwnerInPlanning", true);

        UUID workshopId = UUID.fromString((String) postAndGet("/api/workshops", ownerJwt, wsPayload).get("id"));

        // Register vehicle for client
        Map<String, Object> vehPayload = new HashMap<>();
        vehPayload.put("brand", "Seat");
        vehPayload.put("model", "León");
        vehPayload.put("licensePlate", plate);
        vehPayload.put("vin", "SYNC-" + suffix.toUpperCase());
        vehPayload.put("year", 2021);
        vehPayload.put("color", "Gris");

        UUID vehicleId = UUID.fromString((String) postAndGet("/api/vehicles/register", clientJwt, vehPayload).get("id"));

        // ── 2. Client books appointment ───────────────────────────────────────
        Map<String, Object> apptPayload = new HashMap<>();
        apptPayload.put("vehicleId", vehicleId.toString());
        apptPayload.put("workshopId", workshopId.toString());
        apptPayload.put("dateTime", "2026-10-15T10:00:00");
        apptPayload.put("description", "Revisión general del motor.");
        apptPayload.put("serviceType", "MANTENIMIENTO");
        apptPayload.put("estimatedDuration", 60);

        mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(apptPayload)))
                .andExpect(status().isOk());

        // ── 3. Client verifies it's PENDING in their view ─────────────────────
        UUID appointmentId = getFirstClientAppointmentId(clientJwt);

        MvcResult clientView = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + clientJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> clientAppts = parseList(clientView);
        Map<String, Object> clientAppt = clientAppts.stream()
                .filter(a -> appointmentId.toString().equals(a.get("id")))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cita no encontrada en vista del cliente"));
        assertEquals("PENDING", clientAppt.get("status"), "El cliente debe ver la cita como PENDING");

        // ── 4. Workshop verifies the same appointment appears in its list ─────
        MvcResult workshopView = mockMvc.perform(get("/api/appointments/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<Map<String, Object>> wsAppts = parseList(workshopView);
        Map<String, Object> wsAppt = wsAppts.stream()
                .filter(a -> appointmentId.toString().equals(a.get("id")))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cita no encontrada en vista del taller"));
        assertEquals("PENDING", wsAppt.get("status"), "El taller debe ver la cita como PENDING");
        assertEquals(clientAppt.get("vehicleDisplay"), wsAppt.get("vehicleDisplay"),
                "Ambas vistas deben mostrar el mismo vehículo");

        // ── 5. Workshop confirms the appointment ──────────────────────────────
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/status")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk());

        // ── 6. Client sees status updated to CONFIRMED ────────────────────────
        String clientStatus = getAppointmentStatus(clientJwt, appointmentId, "/api/appointments/my-appointments");
        assertEquals("CONFIRMED", clientStatus, "Cliente debe ver la cita como CONFIRMED");

        // ── 7. Workshop performs check-in ─────────────────────────────────────
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/check-in")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("kilometers", "45000")
                        .param("notes", "Vehículo en buen estado general"))
                .andExpect(status().isOk());

        // ── 8. Workshop moves appointment to IN_PROGRESS ──────────────────────
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/status")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk());

        // ── 9. Client sees IN_PROGRESS and check-in data ──────────────────────
        MvcResult clientFinalView = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + clientJwt))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> finalClientAppt = parseList(clientFinalView).stream()
                .filter(a -> appointmentId.toString().equals(a.get("id")))
                .findFirst()
                .orElseThrow();

        assertEquals("IN_PROGRESS", finalClientAppt.get("status"),
                "Cliente debe ver la cita como IN_PROGRESS");
        assertEquals(45000, finalClientAppt.get("receptionKilometers"),
                "Cliente debe ver los kilómetros registrados en la recepción");
        assertTrue((Boolean) finalClientAppt.get("vehicleReceived"),
                "Cliente debe ver que el vehículo fue recibido");

        // ── 10. Workshop sees the same final state ────────────────────────────
        String wsStatus = getAppointmentStatus(ownerJwt, appointmentId, "/api/appointments/workshop/" + workshopId);
        assertEquals("IN_PROGRESS", wsStatus,
                "Taller debe ver la cita como IN_PROGRESS");

        // ── 11. Cleanup: delete appointment ──────────────────────────────────
        mockMvc.perform(delete("/api/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class).getToken();
    }

    private UUID getEmployeeId(String jwt) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn();
        Map<String, Object> map = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {});
        return UUID.fromString((String) map.get("id"));
    }

    private Map<String, Object> postAndGet(String url, String jwt, Map<String, Object> payload) throws Exception {
        MvcResult result = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post(url)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {});
    }

    private UUID getFirstClientAppointmentId(String jwt) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/appointments/my-appointments")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn();
        List<Map<String, Object>> list = parseList(result);
        assertFalse(list.isEmpty(), "El cliente debe tener al menos una cita");
        return UUID.fromString((String) list.get(0).get("id"));
    }

    private String getAppointmentStatus(String jwt, UUID appointmentId, String listUrl) throws Exception {
        MvcResult result = mockMvc.perform(get(listUrl)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn();
        return (String) parseList(result).stream()
                .filter(a -> appointmentId.toString().equals(a.get("id")))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cita no encontrada en " + listUrl))
                .get("status");
    }

    private List<Map<String, Object>> parseList(MvcResult result) throws Exception {
        return objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {});
    }
}

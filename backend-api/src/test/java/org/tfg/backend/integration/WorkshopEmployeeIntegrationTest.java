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
import org.tfg.backend.employee.EmployeeDTO;
import org.tfg.backend.employee.AddEmployeeRequest;
import org.tfg.backend.user.Role;

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
class WorkshopEmployeeIntegrationTest {

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
    void endToEnd_WorkshopEmployeeManagementFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerEmail = "owner.emp." + randomSuffix + "@pitstop.com";
        String staffEmail = "staff.emp." + randomSuffix + "@pitstop.com";

        // 1. Registrar e Iniciar Sesión como Dueño de Taller
        RegisterRequest registerOwner = RegisterRequest.builder()
                .firstname("OwnerEmp")
                .lastname("LastName")
                .email(ownerEmail)
                .password("ownerPassword123")
                .nif("NIF-O-" + randomSuffix.toUpperCase())
                .phoneNumber("666555444")
                .address("Calle Principal Taller 12")
                .cif("CIF-" + randomSuffix.toUpperCase())
                .companyName("Taller Emp Integration " + randomSuffix)
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

        // 2. Obtener el ID del Empleado (Dueño) para crear el taller
        MvcResult employeeMeResult = mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        EmployeeDTO employeeDto = objectMapper.readValue(employeeMeResult.getResponse().getContentAsString(), EmployeeDTO.class);
        UUID employeeId = employeeDto.getId();

        // 3. Crear un Taller asociado a ese dueño
        Map<String, Object> workshopPayload = new HashMap<>();
        workshopPayload.put("cif", "B" + randomSuffix.toUpperCase() + "88");
        workshopPayload.put("companyName", "Taller Emp Integration " + randomSuffix);
        workshopPayload.put("address", "Calle de los Empleados 12");
        workshopPayload.put("ownerId", employeeId.toString());
        workshopPayload.put("openTime", "08:00:00");
        workshopPayload.put("closeTime", "18:00:00");
        workshopPayload.put("slotDurationMinutes", 60);
        workshopPayload.put("workingDays", "1,2,3,4,5");
        workshopPayload.put("hourlyRate", 55.0);
        workshopPayload.put("includeOwnerInPlanning", true);

        MvcResult workshopResult = mockMvc.perform(post("/api/workshops")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workshopPayload)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> workshopMap = objectMapper.readValue(workshopResult.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        UUID workshopId = UUID.fromString((String) workshopMap.get("id"));

        // 4. Registrar un Empleado (Staff/Mecánico) en el Taller
        AddEmployeeRequest addEmployeeRequest = AddEmployeeRequest.builder()
                .firstname("StaffEmp")
                .lastname("LastNameStaff")
                .email(staffEmail)
                .password("staffPassword123")
                .role(Role.WORKSHOP_STAFF)
                .address("Calle Secundaria 45")
                .build();

        mockMvc.perform(post("/api/employees/register/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addEmployeeRequest)))
                .andExpect(status().isOk());

        // 5. Consultar los empleados del Taller
        MvcResult listEmployeesResult = mockMvc.perform(get("/api/employees/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeDTO> employeesList = objectMapper.readValue(
                listEmployeesResult.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeDTO>>() {}
        );

        // Debería haber 2 empleados (el dueño original + el nuevo mecánico)
        assertEquals(2, employeesList.size());

        EmployeeDTO createdStaff = employeesList.stream()
                .filter(e -> e.getEmail().equalsIgnoreCase(staffEmail))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado en la lista del taller"));

        assertEquals(Role.WORKSHOP_STAFF.name(), createdStaff.getRole());

        UUID staffId = createdStaff.getId();

        // 6. Promocionar el Empleado a Manager
        mockMvc.perform(put("/api/employees/" + staffId + "/promote")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // 7. Degradar el Empleado a Staff/Mecánico nuevamente
        mockMvc.perform(put("/api/employees/" + staffId + "/demote")
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // 8. Actualizar las secciones permitidas para el Empleado
        mockMvc.perform(put("/api/employees/" + staffId + "/allowed-sections")
                        .header("Authorization", "Bearer " + ownerJwt)
                        .param("allowedSections", "planning,inventory"))
                .andExpect(status().isOk());

        // 9. Eliminar el Empleado del Taller
        mockMvc.perform(delete("/api/employees/" + staffId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk());

        // 10. Consultar los empleados tras la eliminación para verificar
        MvcResult listEmployeesAfterDeleteResult = mockMvc.perform(get("/api/employees/workshop/" + workshopId)
                        .header("Authorization", "Bearer " + ownerJwt))
                .andExpect(status().isOk())
                .andReturn();

        List<EmployeeDTO> employeesListAfterDelete = objectMapper.readValue(
                listEmployeesAfterDeleteResult.getResponse().getContentAsString(),
                new TypeReference<List<EmployeeDTO>>() {}
        );

        // Debería quedar solo 1 (el dueño)
        assertEquals(1, employeesListAfterDelete.size());
        assertFalse(employeesListAfterDelete.stream().anyMatch(e -> e.getId().equals(staffId)));
    }
}

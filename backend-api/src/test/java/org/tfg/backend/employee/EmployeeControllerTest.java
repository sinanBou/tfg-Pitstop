package org.tfg.backend.employee;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EmployeeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EmployeService employeService;

    @InjectMocks
    private EmployeeController employeeController;

    private User mockAuthUser;
    private EmployeeDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockAuthUser = User.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@pitstop.com")
                .role(Role.WORKSHOP_STAFF)
                .build();

        mockDTO = EmployeeDTO.builder()
                .id(UUID.randomUUID())
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@pitstop.com")
                .role("WORKSHOP_STAFF")
                .build();

        // Custom Resolver for @AuthenticationPrincipal in Standalone setup
        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return mockAuthUser;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(employeeController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .build();
    }

    @Test
    void getMe_ShouldReturnProfile() throws Exception {
        when(employeService.getEmployeeProfile("john.doe@pitstop.com")).thenReturn(mockDTO);

        mockMvc.perform(get("/api/employees/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("john.doe@pitstop.com")))
                .andExpect(jsonPath("$.firstname", is("John")));

        verify(employeService, times(1)).getEmployeeProfile("john.doe@pitstop.com");
    }

    @Test
    void updateMe_ShouldReturnUpdatedProfile() throws Exception {
        when(employeService.updateProfile(eq("john.doe@pitstop.com"), any(UpdateProfileRequest.class)))
                .thenReturn(mockDTO);

        String payload = "{\"firstname\":\"Jane\",\"lastname\":\"Smith\"}";

        mockMvc.perform(put("/api/employees/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("john.doe@pitstop.com")));

        verify(employeService, times(1)).updateProfile(eq("john.doe@pitstop.com"), any(UpdateProfileRequest.class));
    }

    @Test
    void deleteAvatar_ShouldReturnClearedProfile() throws Exception {
        when(employeService.deleteProfilePicture("john.doe@pitstop.com")).thenReturn(mockDTO);

        mockMvc.perform(delete("/api/employees/me/avatar"))
                .andExpect(status().isOk());

        verify(employeService, times(1)).deleteProfilePicture("john.doe@pitstop.com");
    }

    @Test
    void getEmployeesByWorkshop_ShouldReturnList() throws Exception {
        UUID workshopId = UUID.randomUUID();
        when(employeService.getEmployeesByWorkshopId(workshopId)).thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/employees/workshop/{workshopId}", workshopId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email", is("john.doe@pitstop.com")));

        verify(employeService, times(1)).getEmployeesByWorkshopId(workshopId);
    }

    @Test
    void addEmployeeToWorkshop_ShouldReturnOk() throws Exception {
        UUID workshopId = UUID.randomUUID();
        doNothing().when(employeService).addEmployeeToWorkshop(eq(workshopId), any(AddEmployeeRequest.class));

        String payload = "{\"firstname\":\"Jane\",\"lastname\":\"Smith\",\"email\":\"jane.smith@pitstop.com\",\"password\":\"12345\",\"role\":\"WORKSHOP_STAFF\"}";

        mockMvc.perform(post("/api/employees/register/{workshopId}", workshopId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Empleado añadido con éxito"));

        verify(employeService, times(1)).addEmployeeToWorkshop(eq(workshopId), any(AddEmployeeRequest.class));
    }

    @Test
    void deleteEmployee_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(employeService).deleteEmployee(id);

        mockMvc.perform(delete("/api/employees/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().string("Empleado eliminado con éxito"));

        verify(employeService, times(1)).deleteEmployee(id);
    }

    @Test
    void promoteToManager_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(employeService).promoteToManager(id);

        mockMvc.perform(put("/api/employees/{id}/promote", id))
                .andExpect(status().isOk())
                .andExpect(content().string("Empleado ascendido a Gerente"));

        verify(employeService, times(1)).promoteToManager(id);
    }

    @Test
    void demoteToStaff_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(employeService).demoteToStaff(id);

        mockMvc.perform(put("/api/employees/{id}/demote", id))
                .andExpect(status().isOk())
                .andExpect(content().string("Empleado degradado a Mecánico"));

        verify(employeService, times(1)).demoteToStaff(id);
    }

    @Test
    void updateAllowedSections_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(employeService).updateAllowedSections(id, "PLANNING,TASKS");

        mockMvc.perform(put("/api/employees/{id}/allowed-sections", id)
                        .param("allowedSections", "PLANNING,TASKS"))
                .andExpect(status().isOk())
                .andExpect(content().string("Permisos actualizados con éxito"));

        verify(employeService, times(1)).updateAllowedSections(id, "PLANNING,TASKS");
    }
}

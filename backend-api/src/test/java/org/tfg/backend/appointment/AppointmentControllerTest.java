package org.tfg.backend.appointment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
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
class AppointmentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AppointmentService appointmentService;

    @InjectMocks
    private AppointmentController appointmentController;

    private UserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        // Mock UserDetails for @AuthenticationPrincipal resolution
        mockUserDetails = mock(UserDetails.class);
        lenient().when(mockUserDetails.getUsername()).thenReturn("test@pitstop.com");

        // Custom Resolver for @AuthenticationPrincipal in Standalone setup
        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return mockUserDetails;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(appointmentController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .build();
    }

    @Test
    void getAvailability_ShouldReturnSlots() throws Exception {
        UUID workshopId = UUID.randomUUID();
        LocalDate date = LocalDate.of(2026, 6, 1);
        AvailableSlotDTO slot = new AvailableSlotDTO(java.time.LocalTime.of(9, 0), true);

        when(appointmentService.getAvailableSlots(eq(workshopId), eq(date)))
                .thenReturn(List.of(slot));

        mockMvc.perform(get("/api/appointments/availability/{workshopId}", workshopId)
                        .param("date", "2026-06-01")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].available", is(true)));

        verify(appointmentService, times(1)).getAvailableSlots(eq(workshopId), eq(date));
    }

    @Test
    void createAppointment_ShouldReturnOk() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        UUID workshopId = UUID.randomUUID();
        String jsonPayload = String.format(
                "{\"vehicleId\":\"%s\",\"workshopId\":\"%s\",\"dateTime\":\"2026-06-01T10:00:00\",\"description\":\"Revisión anual\"}",
                vehicleId, workshopId
        );

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(content().string("Cita reservada con éxito"));

        verify(appointmentService, times(1)).createAppointment(any(AppointmentRequest.class), eq("test@pitstop.com"));
    }

    @Test
    void createManualAppointment_ShouldReturnOk() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        UUID workshopId = UUID.randomUUID();
        String jsonPayload = String.format(
                "{\"vehicleId\":\"%s\",\"workshopId\":\"%s\",\"dateTime\":\"2026-06-01T10:00:00\",\"description\":\"Revisión manual\"}",
                vehicleId, workshopId
        );

        mockMvc.perform(post("/api/appointments/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(content().string("Cita manual registrada con éxito"));

        verify(appointmentService, times(1)).createManualAppointment(any(AppointmentRequest.class));
    }

    @Test
    void getMyAppointments_ShouldReturnList() throws Exception {
        AppointmentDTO dto = AppointmentDTO.builder()
                .id(UUID.randomUUID())
                .description("Cita mía")
                .status(AppointmentStatus.PENDING)
                .build();

        when(appointmentService.getAppointmentsByUser("test@pitstop.com")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/appointments/my-appointments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description", is("Cita mía")));

        verify(appointmentService, times(1)).getAppointmentsByUser("test@pitstop.com");
    }

    @Test
    void getWorkshopAppointments_ShouldReturnList() throws Exception {
        UUID workshopId = UUID.randomUUID();
        AppointmentDTO dto = AppointmentDTO.builder()
                .id(UUID.randomUUID())
                .description("Cita Taller")
                .status(AppointmentStatus.CONFIRMED)
                .build();

        when(appointmentService.getAppointmentsByWorkshop(workshopId)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/appointments/workshop/{workshopId}", workshopId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description", is("Cita Taller")));

        verify(appointmentService, times(1)).getAppointmentsByWorkshop(workshopId);
    }

    @Test
    void getReadyForCompletion_ShouldReturnList() throws Exception {
        UUID workshopId = UUID.randomUUID();
        AppointmentDTO dto = AppointmentDTO.builder()
                .id(UUID.randomUUID())
                .description("Cita para finalizar")
                .status(AppointmentStatus.IN_PROGRESS)
                .build();

        when(appointmentService.getAppointmentsReadyForCompletion(workshopId)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/appointments/workshop/{workshopId}/ready-for-completion", workshopId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description", is("Cita para finalizar")));

        verify(appointmentService, times(1)).getAppointmentsReadyForCompletion(workshopId);
    }

    @Test
    void updateStatus_ShouldReturnOk() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        AppointmentStatus status = AppointmentStatus.CONFIRMED;

        mockMvc.perform(patch("/api/appointments/{id}/status", appointmentId)
                        .param("status", status.name())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Estado actualizado: CONFIRMED"));

        verify(appointmentService, times(1)).updateAppointmentStatus(eq(appointmentId), eq(status));
    }

    @Test
    void checkInVehicle_ShouldSuccess() throws Exception {
        UUID appointmentId = UUID.randomUUID();

        mockMvc.perform(patch("/api/appointments/{id}/check-in", appointmentId)
                        .param("kilometers", "120000")
                        .param("notes", "Excelente estado")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Vehículo recepcionado correctamente"));

        verify(appointmentService, times(1)).checkInVehicle(eq(appointmentId), eq(120000), eq("Excelente estado"));
    }

    @Test
    void checkInVehicle_ShouldHandleException() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        doThrow(new RuntimeException("Error del sistema")).when(appointmentService).checkInVehicle(any(), any(), any());

        mockMvc.perform(patch("/api/appointments/{id}/check-in", appointmentId)
                        .param("kilometers", "120000")
                        .param("notes", "Excelente estado")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error al recepcionar el vehículo: Error del sistema"));
    }

    @Test
    void assignEmployee_ShouldReturnOk() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();

        mockMvc.perform(patch("/api/appointments/{id}/assign", appointmentId)
                        .param("employeeId", employeeId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Empleado asignado"));

        verify(appointmentService, times(1)).assignAppointment(eq(appointmentId), eq(employeeId));
    }

    @Test
    void rescheduleAppointment_ShouldReturnOk() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        String dateTimeStr = "2026-06-01T15:30:00";

        mockMvc.perform(patch("/api/appointments/{id}/reschedule", appointmentId)
                        .param("employeeId", employeeId.toString())
                        .param("dateTime", dateTimeStr)
                        .param("duration", "60")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Cita re-programada"));

        verify(appointmentService, times(1)).rescheduleAppointment(eq(appointmentId), eq(employeeId), any(LocalDateTime.class), eq(60));
    }

    @Test
    void manageAppointmentTasks_ShouldSuccess() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        String jsonPayload = "{\"serviceType\":\"Revision\",\"calculatedMinutes\":90}";

        mockMvc.perform(patch("/api/appointments/{id}/manage", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(content().string("Trabajo planificado y distribuido en el calendario"));

        verify(appointmentService, times(1)).manageAppointmentTasks(eq(appointmentId), any(AppointmentManagementRequest.class));
    }

    @Test
    void manageAppointmentTasks_ShouldHandleException() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        String jsonPayload = "{\"serviceType\":\"Revision\"}";

        doThrow(new RuntimeException("Error en tareas")).when(appointmentService).manageAppointmentTasks(any(), any());

        mockMvc.perform(patch("/api/appointments/{id}/manage", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error al gestionar tareas: Error en tareas"));
    }

    @Test
    void delete_ShouldSuccess() throws Exception {
        UUID appointmentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/appointments/{id}", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(appointmentService, times(1)).deleteAppointment(eq(appointmentId));
    }

    @Test
    void delete_ShouldReturnNotFoundOnException() throws Exception {
        UUID appointmentId = UUID.randomUUID();
        doThrow(new RuntimeException("Cita no encontrada")).when(appointmentService).deleteAppointment(any());

        mockMvc.perform(delete("/api/appointments/{id}", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Cita no encontrada"));
    }
}

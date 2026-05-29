package org.tfg.backend.workshoptask;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.tfg.backend.workshoptask.service.WorkshopTaskAdminService;
import org.tfg.backend.workshoptask.service.WorkshopTaskLookupService;

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
class WorkshopTaskControllerTest {

    private MockMvc mockMvc;

    @Mock
    private WorkshopTaskAdminService taskAdminService;

    @Mock
    private WorkshopTaskLookupService taskLookupService;

    @InjectMocks
    private WorkshopTaskController workshopTaskController;

    private WorkshopTaskDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockDTO = WorkshopTaskDTO.builder()
                .id(UUID.randomUUID())
                .description("Cambio de aceite")
                .status(WorkshopTaskStatus.PENDING)
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(workshopTaskController).build();
    }

    @Test
    void getWorkshopTasks_ShouldReturnList() throws Exception {
        UUID workshopId = UUID.randomUUID();
        when(taskLookupService.getTasksByWorkshopAndDate(eq(workshopId), any(), any()))
                .thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/workshop-tasks/workshop/{workshopId}", workshopId)
                        .param("date", "2026-05-29"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description", is("Cambio de aceite")));

        verify(taskLookupService, times(1)).getTasksByWorkshopAndDate(eq(workshopId), any(), any());
    }

    @Test
    void updateTask_ShouldReturnUpdatedDTO() throws Exception {
        UUID taskId = mockDTO.getId();
        when(taskAdminService.updateTask(eq(taskId), any(WorkshopTaskDTO.class))).thenReturn(mockDTO);

        String payload = "{\"status\":\"IN_PROGRESS\"}";

        mockMvc.perform(patch("/api/workshop-tasks/{id}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Cambio de aceite")));

        verify(taskAdminService, times(1)).updateTask(eq(taskId), any(WorkshopTaskDTO.class));
    }

    @Test
    void deleteTask_ShouldReturnOk() throws Exception {
        UUID taskId = mockDTO.getId();

        mockMvc.perform(delete("/api/workshop-tasks/{id}", taskId))
                .andExpect(status().isOk());

        verify(taskAdminService, times(1)).deleteTask(taskId);
    }
}

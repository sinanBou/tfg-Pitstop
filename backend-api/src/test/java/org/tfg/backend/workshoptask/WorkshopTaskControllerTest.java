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
    private WorkshopTaskService taskService;

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
        when(taskService.getTasksByWorkshopAndDate(eq(workshopId), any(), any()))
                .thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/workshop-tasks/workshop/{workshopId}", workshopId)
                        .param("date", "2026-05-29"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description", is("Cambio de aceite")));

        verify(taskService, times(1)).getTasksByWorkshopAndDate(eq(workshopId), any(), any());
    }

    @Test
    void updateTask_ShouldReturnUpdatedDTO() throws Exception {
        UUID taskId = mockDTO.getId();
        when(taskService.updateTask(eq(taskId), any(WorkshopTaskDTO.class))).thenReturn(mockDTO);

        String payload = "{\"status\":\"IN_PROGRESS\"}";

        mockMvc.perform(patch("/api/workshop-tasks/{id}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Cambio de aceite")));

        verify(taskService, times(1)).updateTask(eq(taskId), any(WorkshopTaskDTO.class));
    }

    @Test
    void deleteTask_ShouldReturnOk() throws Exception {
        UUID taskId = mockDTO.getId();

        mockMvc.perform(delete("/api/workshop-tasks/{id}", taskId))
                .andExpect(status().isOk());

        verify(taskService, times(1)).deleteTask(taskId);
    }

    @Test
    void getDelayedTasks_ShouldReturnList() throws Exception {
        UUID workshopId = UUID.randomUUID();
        when(taskService.getDelayedTasksByWorkshop(eq(workshopId))).thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/workshop-tasks/workshop/{workshopId}/delayed", workshopId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description", is("Cambio de aceite")));

        verify(taskService, times(1)).getDelayedTasksByWorkshop(eq(workshopId));
    }
}

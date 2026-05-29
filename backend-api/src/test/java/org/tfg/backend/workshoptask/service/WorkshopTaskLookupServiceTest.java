package org.tfg.backend.workshoptask.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.workshoptask.*;
import org.tfg.backend.workshoptask.mapper.WorkshopTaskMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkshopTaskLookupServiceTest {

    @Mock
    private WorkshopTaskRepository taskRepository;

    @Mock
    private WorkshopTaskMapper taskMapper;

    @InjectMocks
    private WorkshopTaskLookupService taskLookupService;

    private WorkshopTask mockTask;
    private WorkshopTaskDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockTask = WorkshopTask.builder()
                .id(UUID.randomUUID())
                .status(WorkshopTaskStatus.PENDING)
                .build();

        mockDTO = WorkshopTaskDTO.builder()
                .id(mockTask.getId())
                .status(WorkshopTaskStatus.PENDING)
                .build();
    }

    @Test
    void getTasksByWorkshopAndDate_ShouldReturnList() {
        UUID workshopId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        when(taskRepository.findByWorkshopIdAndDateTimeBetween(eq(workshopId), any(), any()))
                .thenReturn(List.of(mockTask));
        when(taskRepository.findByWorkshopId(workshopId))
                .thenReturn(List.of(mockTask));
        when(taskMapper.convertToDTO(mockTask)).thenReturn(mockDTO);

        List<WorkshopTaskDTO> result = taskLookupService.getTasksByWorkshopAndDate(workshopId, now, now.plusDays(1));

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository, times(1)).findByWorkshopIdAndDateTimeBetween(eq(workshopId), any(), any());
        verify(taskRepository, times(1)).findByWorkshopId(workshopId);
    }

    @Test
    void getTasksByEmployeeAndDate_ShouldReturnList() {
        UUID employeeId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        when(taskRepository.findByAssignedEmployeeIdAndDateTimeBetween(eq(employeeId), any(), any()))
                .thenReturn(List.of(mockTask));
        when(taskMapper.convertToDTO(mockTask)).thenReturn(mockDTO);

        List<WorkshopTaskDTO> result = taskLookupService.getTasksByEmployeeAndDate(employeeId, now, now.plusDays(1));

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepository, times(1)).findByAssignedEmployeeIdAndDateTimeBetween(eq(employeeId), any(), any());
    }
}

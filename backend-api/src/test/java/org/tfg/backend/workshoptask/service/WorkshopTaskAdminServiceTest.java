package org.tfg.backend.workshoptask.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.workshoptask.*;
import org.tfg.backend.workshoptask.mapper.WorkshopTaskMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkshopTaskAdminServiceTest {

    @Mock
    private WorkshopTaskRepository taskRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private WorkshopTaskMapper taskMapper;

    @InjectMocks
    private WorkshopTaskAdminService taskAdminService;

    private WorkshopTask mockTask;
    private WorkshopTaskDTO mockDTO;
    private Appointment mockAppointment;

    @BeforeEach
    void setUp() {
        mockAppointment = Appointment.builder()
                .id(UUID.randomUUID())
                .tasks(new ArrayList<>())
                .build();

        mockTask = WorkshopTask.builder()
                .id(UUID.randomUUID())
                .dateTime(LocalDateTime.now())
                .description("Cambio de aceite")
                .status(WorkshopTaskStatus.PENDING)
                .estimatedDuration(1)
                .originAppointment(mockAppointment)
                .build();

        mockDTO = WorkshopTaskDTO.builder()
                .id(mockTask.getId())
                .dateTime(mockTask.getDateTime())
                .description("Cambio de aceite")
                .status(WorkshopTaskStatus.PENDING)
                .estimatedDuration(1)
                .build();
    }

    @Test
    void updateTask_ShouldModifyTaskDetailsAndReturnDTO() {
        UUID taskId = mockTask.getId();
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(mockTask)).thenReturn(mockTask);
        when(taskMapper.convertToDTO(mockTask)).thenReturn(mockDTO);

        WorkshopTaskDTO updateDto = WorkshopTaskDTO.builder()
                .status(WorkshopTaskStatus.IN_PROGRESS)
                .estimatedDuration(2)
                .completedTasks("Listo")
                .build();

        WorkshopTaskDTO result = taskAdminService.updateTask(taskId, updateDto);

        assertNotNull(result);
        assertEquals(WorkshopTaskStatus.IN_PROGRESS, mockTask.getStatus());
        assertEquals(Integer.valueOf(2), mockTask.getEstimatedDuration());
        assertEquals("Listo", mockTask.getCompletedTasks());
        verify(taskRepository, times(1)).save(mockTask);
    }

    @Test
    void updateTask_ShouldReassignEmployeeWhenFlagIsTrue() {
        UUID taskId = mockTask.getId();
        UUID empId = UUID.randomUUID();
        Employee mockEmployee = Employee.builder().id(empId).build();

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(mockTask));
        when(employeeRepository.findById(empId)).thenReturn(Optional.of(mockEmployee));
        when(taskRepository.save(mockTask)).thenReturn(mockTask);
        when(taskMapper.convertToDTO(mockTask)).thenReturn(mockDTO);

        WorkshopTaskDTO updateDto = WorkshopTaskDTO.builder()
                .reassignEmployee(true)
                .assignedEmployeeId(empId)
                .build();

        taskAdminService.updateTask(taskId, updateDto);

        assertEquals(mockEmployee, mockTask.getAssignedEmployee());
        verify(employeeRepository, times(1)).findById(empId);
    }

    @Test
    void deleteTask_ShouldCancelTaskWhenHasMultipleActiveTasks() {
        UUID taskId = mockTask.getId();

        WorkshopTask activeTask1 = WorkshopTask.builder().status(WorkshopTaskStatus.PENDING).build();
        WorkshopTask activeTask2 = WorkshopTask.builder().id(taskId).status(WorkshopTaskStatus.PENDING).build();
        mockAppointment.getTasks().add(activeTask1);
        mockAppointment.getTasks().add(activeTask2);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(mockTask)).thenReturn(mockTask);

        taskAdminService.deleteTask(taskId);

        assertEquals(WorkshopTaskStatus.CANCELLED, mockTask.getStatus());
        verify(taskRepository, times(1)).save(mockTask);
        verify(taskRepository, never()).delete(any());
    }

    @Test
    void deleteTask_ShouldDeleteTaskAndSetAppointmentUnassignedWhenOnlyOneActiveTask() {
        UUID taskId = mockTask.getId();
        mockAppointment.getTasks().add(mockTask);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(mockTask));

        taskAdminService.deleteTask(taskId);

        verify(taskRepository, times(1)).delete(mockTask);
        verify(appointmentRepository, times(1)).save(mockAppointment);
        assertNull(mockAppointment.getAssignedEmployee());
        assertEquals(org.tfg.backend.appointment.AppointmentStatus.CONFIRMED, mockAppointment.getStatus());
    }
}

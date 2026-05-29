package org.tfg.backend.workshoptask.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.tfg.backend.client.Client;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.user.User;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshoptask.WorkshopTask;
import org.tfg.backend.workshoptask.WorkshopTaskDTO;
import org.tfg.backend.workshoptask.WorkshopTaskStatus;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class WorkshopTaskMapperTest {

    private WorkshopTaskMapper taskMapper;

    @BeforeEach
    void setUp() {
        taskMapper = new WorkshopTaskMapper();
    }

    @Test
    void convertToDTO_ShouldReturnNullWhenTaskIsNull() {
        assertNull(taskMapper.convertToDTO(null));
    }

    @Test
    void convertToDTO_ShouldMapAllFieldsSecurely() {
        Vehicle mockVehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .brand("Toyota")
                .model("Corolla")
                .licensePlate("1234ABC")
                .build();

        Workshop mockWorkshop = Workshop.builder()
                .id(UUID.randomUUID())
                .companyName("PitStop Taller")
                .build();

        User empUser = User.builder()
                .firstname("John")
                .lastname("Doe")
                .build();

        Employee mockEmployee = Employee.builder()
                .id(UUID.randomUUID())
                .user(empUser)
                .build();

        User clientUser = User.builder()
                .firstname("Jane")
                .lastname("Smith")
                .build();

        Client mockClient = Client.builder()
                .user(clientUser)
                .build();

        Appointment mockAppointment = Appointment.builder()
                .id(UUID.randomUUID())
                .client(mockClient)
                .vehicleReceived(true)
                .mechanicComments("Comentarios de prueba")
                .build();

        WorkshopTask mockTask = WorkshopTask.builder()
                .id(UUID.randomUUID())
                .dateTime(LocalDateTime.now())
                .description("Cambio de aceite")
                .serviceType("Mecánica")
                .status(WorkshopTaskStatus.PENDING)
                .estimatedDuration(1)
                .vehicle(mockVehicle)
                .workshop(mockWorkshop)
                .assignedEmployee(mockEmployee)
                .originAppointment(mockAppointment)
                .completedTasks("Cambio de filtro")
                .build();

        WorkshopTaskDTO result = taskMapper.convertToDTO(mockTask);

        assertNotNull(result);
        assertEquals(mockTask.getId(), result.getId());
        assertEquals(mockTask.getDescription(), result.getDescription());
        assertEquals("Mecánica", result.getServiceType());
        assertEquals(WorkshopTaskStatus.PENDING, result.getStatus());
        assertEquals(Integer.valueOf(1), result.getEstimatedDuration());
        assertEquals(mockVehicle.getId(), result.getVehicleId());
        assertEquals("Toyota Corolla (1234ABC)", result.getVehicleDisplay());
        assertEquals(mockWorkshop.getId(), result.getWorkshopId());
        assertEquals("PitStop Taller", result.getWorkshopName());
        assertEquals(mockEmployee.getId(), result.getAssignedEmployeeId());
        assertEquals("John Doe", result.getAssignedEmployeeName());
        assertEquals("Jane Smith", result.getClientFullName());
        assertEquals(mockAppointment.getId(), result.getOriginAppointmentId());
        assertTrue(result.getVehicleReceived());
        assertEquals("Cambio de filtro", result.getCompletedTasks());
        assertEquals("Comentarios de prueba", result.getMechanicComments());
        assertTrue(result.getIsTask());
    }
}

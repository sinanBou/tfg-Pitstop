package org.tfg.backend.appointment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.client.Client;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.invoice.InvoiceRepository;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.vehicle.VehicleRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;
import org.tfg.backend.workshoptask.WorkshopTaskRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private WorkshopRepository workshopRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private WorkshopTaskRepository workshopTaskRepository;
    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private UUID appointmentId;
    private Appointment appointment;
    private Vehicle vehicle;
    private Workshop workshop;
    private Client client;
    private User user;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        
        user = User.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .build();
                
        client = Client.builder()
                .user(user)
                .build();

        vehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .brand("Toyota")
                .model("Yaris")
                .licensePlate("1234ABC")
                .client(client)
                .build();

        workshop = Workshop.builder()
                .id(UUID.randomUUID())
                .companyName("Pitstop Central")
                .hourlyRate(60.0)
                .employees(Collections.emptyList())
                .build();

        appointment = Appointment.builder()
                .id(appointmentId)
                .dateTime(LocalDateTime.now())
                .description("Revisión anual")
                .serviceType("Mantenimiento")
                .status(AppointmentStatus.PENDING)
                .vehicle(vehicle)
                .workshop(workshop)
                .client(client)
                .build();
    }

    @Test
    void updateAppointmentStatus_ShouldTransitionFromPendingToConfirmed_AndSetConfirmedAt() {
        // Arrange
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act
        appointmentService.updateAppointmentStatus(appointmentId, AppointmentStatus.CONFIRMED);

        // Assert
        assertEquals(AppointmentStatus.CONFIRMED, appointment.getStatus());
        assertNotNull(appointment.getConfirmedAt());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void updateAppointmentStatus_ShouldTransitionFromConfirmedToInProgress_AndSetActualStartTime() {
        // Arrange
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act
        appointmentService.updateAppointmentStatus(appointmentId, AppointmentStatus.IN_PROGRESS);

        // Assert
        assertEquals(AppointmentStatus.IN_PROGRESS, appointment.getStatus());
        assertNotNull(appointment.getActualStartTime());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void updateAppointmentStatus_ShouldThrowException_WhenAttemptingToCancelInProgressAppointment() {
        // Arrange
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            appointmentService.updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED)
        );
        assertEquals("No se puede cancelar una cita en este estado.", exception.getMessage());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void updateAppointmentStatus_ShouldThrowException_WhenTransitioningFromPickedUpFinalState() {
        // Arrange
        appointment.setStatus(AppointmentStatus.PICKED_UP);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            appointmentService.updateAppointmentStatus(appointmentId, AppointmentStatus.CONFIRMED)
        );
        assertEquals("La cita ya ha sido recogida y finalizada. No se permiten más cambios de estado.", exception.getMessage());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void checkInVehicle_ShouldSetVehicleReceivedToTrue_AndSetVehicleStatusToReceived() {
        // Arrange
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act
        appointmentService.checkInVehicle(appointmentId, 120000, "Golpe en aleta trasera");

        // Assert
        assertTrue(appointment.getVehicleReceived());
        assertEquals(120000, appointment.getReceptionKilometers());
        assertEquals("Golpe en aleta trasera", appointment.getReceptionNotes());
        assertEquals("RECIBIDO", vehicle.getStatus());
        assertEquals(workshop, vehicle.getCurrentWorkshop());
        verify(vehicleRepository, times(1)).save(vehicle);
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void deleteAppointment_ShouldRemoveAppointment_WhenNotCompletedOrPickedUp() {
        // Arrange
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act
        appointmentService.deleteAppointment(appointmentId);

        // Assert
        verify(workshopTaskRepository, times(1)).deleteByOriginAppointmentId(appointmentId);
        verify(appointmentRepository, times(1)).delete(appointment);
    }

    @Test
    void deleteAppointment_ShouldThrowException_WhenCompletedOrPickedUp() {
        // Arrange
        appointment.setStatus(AppointmentStatus.COMPLETED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            appointmentService.deleteAppointment(appointmentId)
        );
        assertEquals("No se puede eliminar una cita que ya ha sido completada o recogida.", exception.getMessage());
        verify(appointmentRepository, never()).delete(any());
    }
}

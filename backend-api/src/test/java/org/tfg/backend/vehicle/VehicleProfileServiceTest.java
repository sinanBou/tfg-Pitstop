package org.tfg.backend.vehicle;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.client.Client;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleProfileServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private VehicleMapper vehicleMapper;

    @InjectMocks
    private VehicleProfileService vehicleProfileService;

    private User testUser;
    private Client testClient;
    private Vehicle testVehicle;
    private VehicleDTO testDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john@pitstop.com")
                .build();

        testClient = Client.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .nif("12345678A")
                .build();

        testUser.setClient(testClient);

        testVehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .brand("BMW")
                .model("M3")
                .licensePlate("1234BBB")
                .year(2022)
                .vin("VIN123456789")
                .client(testClient)
                .status("EN_CASA")
                .build();

        testDTO = VehicleDTO.builder()
                .id(testVehicle.getId())
                .brand("BMW")
                .model("M3")
                .licensePlate("1234BBB")
                .year(2022)
                .vin("VIN123456789")
                .status("EN_CASA")
                .build();
    }

    @Test
    void registerVehicle_ShouldSaveAndReturnDTO() {
        VehicleRequest request = new VehicleRequest();
        request.setBrand("BMW");
        request.setModel("M3");
        request.setLicensePlate("1234BBB");
        request.setYear(2022);
        request.setVin("VIN123456789");

        when(userRepository.findByEmail("john@pitstop.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        when(vehicleMapper.mapToDTO(testVehicle)).thenReturn(testDTO);

        VehicleDTO result = vehicleProfileService.registerVehicle(request, "john@pitstop.com");

        assertNotNull(result);
        assertEquals("BMW", result.getBrand());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void registerVehicle_ShouldThrowExceptionWhenNotClient() {
        testUser.setClient(null);
        VehicleRequest request = new VehicleRequest();
        when(userRepository.findByEmail("john@pitstop.com")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> vehicleProfileService.registerVehicle(request, "john@pitstop.com"));
    }

    @Test
    void getVehiclesByClient_ShouldReturnList() {
        when(userRepository.findByEmail("john@pitstop.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findByClientId(testClient.getId())).thenReturn(List.of(testVehicle));
        when(vehicleMapper.mapToDTO(testVehicle)).thenReturn(testDTO);

        List<VehicleDTO> result = vehicleProfileService.getVehiclesByClient("john@pitstop.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("BMW", result.get(0).getBrand());
    }

    @Test
    void deleteVehicle_ShouldDeleteAssociatedAppointmentsAndVehicle() {
        UUID vehicleId = testVehicle.getId();
        when(userRepository.findByEmail("john@pitstop.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        List<Appointment> apps = new ArrayList<>();
        when(appointmentRepository.findByVehicleId(vehicleId)).thenReturn(apps);

        vehicleProfileService.deleteVehicle(vehicleId, "john@pitstop.com");

        verify(appointmentRepository, times(1)).deleteAll(apps);
        verify(vehicleRepository, times(1)).delete(testVehicle);
    }

    @Test
    void deleteVehicle_ShouldThrowExceptionWhenNotAuthorized() {
        UUID vehicleId = testVehicle.getId();
        Client anotherClient = Client.builder().id(UUID.randomUUID()).build();
        testVehicle.setClient(anotherClient); // Make vehicle belong to someone else

        when(userRepository.findByEmail("john@pitstop.com")).thenReturn(Optional.of(testUser));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        assertThrows(RuntimeException.class, () -> vehicleProfileService.deleteVehicle(vehicleId, "john@pitstop.com"));
        verify(vehicleRepository, never()).delete(any(Vehicle.class));
    }
}

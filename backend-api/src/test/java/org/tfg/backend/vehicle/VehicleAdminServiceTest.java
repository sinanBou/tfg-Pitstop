package org.tfg.backend.vehicle;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleAdminServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private VehicleMapper vehicleMapper;

    @InjectMocks
    private VehicleAdminService vehicleAdminService;

    private Client testClient;
    private Vehicle testVehicle;
    private VehicleSearchDTO testSearchDTO;

    @BeforeEach
    void setUp() {
        testClient = Client.builder()
                .id(UUID.randomUUID())
                .nif("12345678A")
                .build();

        testVehicle = Vehicle.builder()
                .id(UUID.randomUUID())
                .brand("Audi")
                .model("A4")
                .licensePlate("9876CCC")
                .client(testClient)
                .build();

        testSearchDTO = VehicleSearchDTO.builder()
                .id(testVehicle.getId())
                .brand("Audi")
                .model("A4")
                .licensePlate("9876CCC")
                .clientId(testClient.getId())
                .build();
    }

    @Test
    void searchVehicles_ShouldReturnList() {
        when(vehicleRepository.findByLicensePlate("9876CCC")).thenReturn(Optional.of(testVehicle));
        when(vehicleMapper.mapToSearchDTO(testVehicle)).thenReturn(testSearchDTO);

        List<VehicleSearchDTO> result = vehicleAdminService.searchVehicles("9876CCC");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Audi", result.get(0).getBrand());
        verify(vehicleRepository, times(1)).findByLicensePlate("9876CCC");
    }

    @Test
    void getVehiclesByClientId_ShouldReturnList() {
        UUID clientId = testClient.getId();
        when(vehicleRepository.findByClientId(clientId)).thenReturn(List.of(testVehicle));
        when(vehicleMapper.mapToSearchDTO(testVehicle)).thenReturn(testSearchDTO);

        List<VehicleSearchDTO> result = vehicleAdminService.getVehiclesByClientId(clientId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("9876CCC", result.get(0).getLicensePlate());
        verify(vehicleRepository, times(1)).findByClientId(clientId);
    }

    @Test
    void registerVehicleForClient_ShouldSaveAndReturnDTO() {
        UUID clientId = testClient.getId();
        VehicleRequest request = new VehicleRequest();
        request.setBrand("Audi");
        request.setModel("A4");
        request.setLicensePlate("9876CCC");
        request.setYear(2021);
        request.setVin("VIN987654321");

        when(clientRepository.findById(clientId)).thenReturn(Optional.of(testClient));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        when(vehicleMapper.mapToSearchDTO(testVehicle)).thenReturn(testSearchDTO);

        VehicleSearchDTO result = vehicleAdminService.registerVehicleForClient(clientId, request);

        assertNotNull(result);
        assertEquals("Audi", result.getBrand());
        verify(clientRepository, times(1)).findById(clientId);
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }
}

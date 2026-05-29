package org.tfg.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleAdminService {

    private final VehicleRepository vehicleRepository;
    private final ClientRepository clientRepository;
    private final VehicleMapper vehicleMapper;

    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> searchVehicles(String licensePlate) {
        return vehicleRepository.findByLicensePlate(licensePlate)
                .stream()
                .map(vehicleMapper::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> getVehiclesByClientId(UUID clientId) {
        return vehicleRepository.findByClientId(clientId)
                .stream()
                .map(vehicleMapper::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleSearchDTO registerVehicleForClient(UUID clientId, VehicleRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Vehicle vehicle = Vehicle.builder()
                .brand(request.getBrand())
                .model(request.getModel())
                .licensePlate(request.getLicensePlate())
                .year(request.getYear())
                .vin(request.getVin())
                .status("EN_CASA")
                .client(client)
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return vehicleMapper.mapToSearchDTO(saved);
    }
}

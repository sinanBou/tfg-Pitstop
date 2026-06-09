package org.tfg.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio del backend encargado de la administración y búsqueda de vehículos.
 * Permite buscar vehículos por matrícula, por cliente, y dar de alta coches a un cliente específico.
 */
@Service
@RequiredArgsConstructor
public class VehicleAdminService {

    private final VehicleRepository vehicleRepository;
    private final ClientRepository clientRepository;
    private final VehicleMapper vehicleMapper;

    /**
     * Busca vehículos por su matrícula exacta.
     *
     * @param licensePlate Matrícula del vehículo.
     * @return Lista de DTOs simplificados de búsqueda que coinciden con la matrícula.
     */
    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> searchVehicles(String licensePlate) {
        return vehicleRepository.findByLicensePlate(licensePlate)
                .stream()
                .map(vehicleMapper::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los vehículos pertenecientes a un cliente específico.
     *
     * @param clientId Identificador único del cliente.
     * @return Lista de vehículos del cliente mapeados a DTOs.
     */
    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> getVehiclesByClientId(UUID clientId) {
        return vehicleRepository.findByClientId(clientId)
                .stream()
                .map(vehicleMapper::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Registra un nuevo vehículo asociándolo a un cliente existente.
     * El vehículo se da de alta en el estado inicial de "EN_CASA" (en posesión del cliente).
     *
     * @param clientId Identificador único del cliente.
     * @param request Datos técnicos del coche (marca, modelo, matrícula, año, VIN).
     * @return DTO del vehículo registrado.
     * @throws RuntimeException si el cliente no se encuentra en el sistema.
     */
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

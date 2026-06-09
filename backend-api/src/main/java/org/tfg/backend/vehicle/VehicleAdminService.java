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
 * Servicio administrativo para la gestión de vehículos por parte del personal de taller.
 * Facilita operaciones de búsqueda de vehículos y el registro de vehículos en nombre de clientes.
 */
@Service
@RequiredArgsConstructor
public class VehicleAdminService {

    private final VehicleRepository vehicleRepository;
    private final ClientRepository clientRepository;
    private final VehicleMapper vehicleMapper;

    /**
     * Busca vehículos a partir de su número de matrícula en una transacción de solo lectura.
     *
     * @param licensePlate Número de matrícula.
     * @return Lista de DTOs simplificados de vehículos encontrados.
     */
    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> searchVehicles(String licensePlate) {
        return vehicleRepository.findByLicensePlate(licensePlate)
                .stream()
                .map(vehicleMapper::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el listado simplificado de vehículos registrados para un cliente a partir de su ID de perfil.
     *
     * @param clientId Identificador de perfil de cliente.
     * @return Lista de DTOs simplificados de vehículos.
     */
    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> getVehiclesByClientId(UUID clientId) {
        return vehicleRepository.findByClientId(clientId)
                .stream()
                .map(vehicleMapper::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Registra un vehículo y lo asocia a un cliente. Acción reservada para personal administrativo del taller.
     *
     * @param clientId Identificador único del cliente.
     * @param request Petición con la información técnica y matrícula del vehículo.
     * @return DTO simplificado del vehículo registrado.
     * @throws RuntimeException Si el cliente no existe.
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

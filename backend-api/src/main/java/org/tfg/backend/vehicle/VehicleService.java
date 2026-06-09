package org.tfg.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.client.Client;
import org.tfg.backend.client.ClientRepository;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.appointment.AppointmentRepository;


import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final AppointmentRepository appointmentRepository;



    @Transactional
    public VehicleDTO registerVehicle(VehicleRequest request, String email) {
        // 1. Buscamos al usuario
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. IMPORTANTE: Verificamos que el usuario realmente tenga un perfil de cliente
        Client client = user.getClient();
        if (client == null) {
            throw new RuntimeException("Error: El usuario con email " + email + " no tiene un perfil de Cliente asociado.");
        }

        // 3. Construimos la entidad
        Vehicle vehicle = Vehicle.builder()
                .brand(request.getBrand())
                .model(request.getModel())
                .licensePlate(request.getLicensePlate())
                .year(request.getYear())
                .vin(request.getVin())
                .status("EN_CASA")
                .client(client)
                .build();

        // 4. Guardamos (ahora no debería dar error si los datos son correctos)
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        return mapToDTO(savedVehicle);
    }

    @Transactional(readOnly = true)
    public List<VehicleDTO> getVehiclesByClient(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getClient() == null) return List.of();

        return vehicleRepository.findByClientId(user.getClient().getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
    * Mapea un objeto {@link Vehicle} a su versión {@link VehicleDTO}.
    *
    * @param vehicle Entidad del vehículo.
    * @return DTO correspondiente.
    */
    private VehicleDTO mapToDTO(Vehicle vehicle) {
        return VehicleDTO.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .year(vehicle.getYear())
                .vin(vehicle.getVin())
                .status(vehicle.getStatus())
                .workshopName(vehicle.getCurrentWorkshop() != null ?
                        vehicle.getCurrentWorkshop().getCompanyName() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> searchVehicles(String licensePlate) {
        return vehicleRepository.findByLicensePlate(licensePlate)
                .stream()
                .map(this::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleSearchDTO> getVehiclesByClientId(UUID clientId) {
        return vehicleRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToSearchDTO)
                .collect(Collectors.toList());
    }

    /**
    * Mapea un objeto {@link Vehicle} a su versión simplificada {@link VehicleSearchDTO}.
    *
    * @param vehicle Entidad de vehículo.
    * @return DTO simplificado resultante.
    */
    private VehicleSearchDTO mapToSearchDTO(Vehicle vehicle) {
        return VehicleSearchDTO.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .clientId(vehicle.getClient().getId())
                .build();
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
        return mapToSearchDTO(saved);
    }

    @Transactional
    public void deleteVehicle(UUID id, String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        if (user.getClient() == null || !vehicle.getClient().getId().equals(user.getClient().getId())) {
            throw new RuntimeException("No autorizado a eliminar este vehículo");
        }

        // 1. Buscamos todas las citas asociadas a este vehículo
        var appointments = appointmentRepository.findByVehicleId(id);

        // 2. Las eliminamos en cascada (JPA eliminará tareas y partes automáticamente)
        appointmentRepository.deleteAll(appointments);

        // 3. Finalmente, eliminamos el vehículo
        vehicleRepository.delete(vehicle);
    }
}
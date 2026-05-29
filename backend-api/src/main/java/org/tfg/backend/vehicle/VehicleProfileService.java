package org.tfg.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.client.Client;
import org.tfg.backend.user.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleProfileService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final VehicleMapper vehicleMapper;

    @Transactional
    public VehicleDTO registerVehicle(VehicleRequest request, String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        if (client == null) {
            throw new RuntimeException("Error: El usuario con email " + email + " no tiene un perfil de Cliente asociado.");
        }

        Vehicle vehicle = Vehicle.builder()
                .brand(request.getBrand())
                .model(request.getModel())
                .licensePlate(request.getLicensePlate())
                .year(request.getYear())
                .vin(request.getVin())
                .status("EN_CASA")
                .client(client)
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.mapToDTO(savedVehicle);
    }

    @Transactional(readOnly = true)
    public List<VehicleDTO> getVehiclesByClient(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getClient() == null) return List.of();

        return vehicleRepository.findByClientId(user.getClient().getId())
                .stream()
                .map(vehicleMapper::mapToDTO)
                .collect(Collectors.toList());
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

        var appointments = appointmentRepository.findByVehicleId(id);
        appointmentRepository.deleteAll(appointments);
        vehicleRepository.delete(vehicle);
    }
}

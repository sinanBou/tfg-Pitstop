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

/**
 * Servicio encargado de gestionar el perfil de los vehículos propiedad de los clientes.
 * Permite registrar un coche, listar los vehículos propios de un usuario autenticado y eliminar un coche de su cuenta.
 */
@Service
@RequiredArgsConstructor
public class VehicleProfileService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final VehicleMapper vehicleMapper;

    /**
     * Registra un nuevo vehículo asociado al usuario logueado.
     *
     * @param request Datos del vehículo (marca, modelo, matrícula, etc.).
     * @param email Correo electrónico del usuario que realiza el registro.
     * @return DTO del vehículo registrado.
     * @throws RuntimeException si el usuario no existe o no tiene perfil de cliente.
     */
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

    /**
     * Lista todos los vehículos que pertenecen al cliente identificado por su correo electrónico.
     *
     * @param email Correo electrónico del cliente.
     * @return Lista de DTOs detallados de los vehículos del cliente.
     * @throws RuntimeException si el usuario no se encuentra en el sistema.
     */
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

    /**
     * Elimina un vehículo si el usuario solicitante es el legítimo dueño.
     * También limpia en cascada las citas vinculadas a dicho vehículo.
     *
     * @param id Identificador único del vehículo a borrar.
     * @param email Correo electrónico del usuario solicitante.
     * @throws RuntimeException si el vehículo no existe o el usuario no está autorizado.
     */
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

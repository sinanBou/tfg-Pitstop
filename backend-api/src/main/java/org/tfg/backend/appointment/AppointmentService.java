package org.tfg.backend.appointment;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.client.Client;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.vehicle.VehicleRepository;
import org.tfg.backend.workshop.WorkshopRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkshopRepository workshopRepository;

    // Configuración: Citas cada 1 hora, de 9 a 14 y 16 a 19
    private final List<LocalTime> WORKING_HOURS = List.of(
            LocalTime.of(9,0), LocalTime.of(10,0), LocalTime.of(11,0),
            LocalTime.of(12,0), LocalTime.of(13,0), LocalTime.of(16,0),
            LocalTime.of(17,0), LocalTime.of(18,0)
    );

    @Transactional(readOnly = true)
    public List<AvailableSlotDTO> getAvailableSlots(UUID workshopId, LocalDate date) {
        var workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // 1. Asegurar valores por defecto si son nulos en la BD
        LocalTime open = (workshop.getOpenTime() != null) ? workshop.getOpenTime() : LocalTime.of(9, 0);
        LocalTime close = (workshop.getCloseTime() != null) ? workshop.getCloseTime() : LocalTime.of(18, 0);
        int duration = (workshop.getSlotDurationMinutes() != null && workshop.getSlotDurationMinutes() > 0)
                ? workshop.getSlotDurationMinutes() : 60;

        // 2. Cargar citas existentes para ese día
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        List<Appointment> existingAppointments =
                appointmentRepository.findByWorkshopIdAndDateTimeBetween(workshopId, startOfDay, endOfDay);

        List<LocalTime> takenHours = existingAppointments.stream()
                .map(a -> a.getDateTime().toLocalTime())
                .toList();

        // 3. Generar slots (Bucle corregido)
        List<AvailableSlotDTO> slots = new ArrayList<>();
        LocalTime currentSlot = open;

        // Mientras el slot actual sea antes del cierre
        while (currentSlot.isBefore(close)) {
            // Si el slot + duración sobrepasa el cierre, dejamos de generar
            if (currentSlot.plusMinutes(duration).isAfter(close)) {
                break;
            }

            boolean isAvailable = !takenHours.contains(currentSlot);
            slots.add(new AvailableSlotDTO(currentSlot, isAvailable));

            currentSlot = currentSlot.plusMinutes(duration);
        }

        return slots;
    }

    @Transactional
    public void createAppointment(AppointmentRequest request, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        var vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        var workshop = workshopRepository.findById(request.getWorkshopId())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // Validar si la hora ya está ocupada
        List<Appointment> conflict = appointmentRepository.findByWorkshopIdAndDateTimeBetween(
                workshop.getId(), request.getDateTime(), request.getDateTime());

        if (!conflict.isEmpty()) {
            throw new RuntimeException("Lo sentimos, esta hora ya ha sido reservada.");
        }

        Appointment appointment = Appointment.builder()
                .client(client)
                .vehicle(vehicle)
                .workshop(workshop)
                .dateTime(request.getDateTime())
                .description(request.getDescription())
                .serviceType(request.getServiceType())
                .build();

        appointmentRepository.save(appointment);
    }

    public AppointmentDTO mapToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .dateTime(appointment.getDateTime())
                .description(appointment.getDescription())
                .serviceType(appointment.getServiceType())
                .clientFullName(appointment.getClient().getUser().getFirstname() + " " +
                        appointment.getClient().getUser().getLastname())
                .vehicleId(appointment.getVehicle().getId())
                .vehicleDisplay(appointment.getVehicle().getBrand() + " " +
                        appointment.getVehicle().getModel() + " (" +
                        appointment.getVehicle().getLicensePlate() + ")")
                .workshopId(appointment.getWorkshop().getId())
                .workshopName(appointment.getWorkshop().getCompanyName())
                .build();
    }
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByUser(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getClient() == null) return List.of();

        return appointmentRepository.findByClientId(user.getClient().getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteAppointment(UUID id) {
        // Verificamos si existe antes de borrar para evitar excepciones genéricas
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("La cita con ID " + id + " no existe");
        }
        appointmentRepository.deleteById(id);
    }
}
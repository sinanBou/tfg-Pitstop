package org.tfg.backend.appointment;

import lombok.RequiredArgsConstructor;
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
        // 1. Obtener la configuración del taller
        var workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // Usar valores por defecto si el taller no tiene horario configurado
        LocalTime open = workshop.getOpenTime() != null ? workshop.getOpenTime() : LocalTime.of(9, 0);
        LocalTime close = workshop.getCloseTime() != null ? workshop.getCloseTime() : LocalTime.of(18, 0);
        int duration = workshop.getSlotDurationMinutes() != null ? workshop.getSlotDurationMinutes() : 60;

        // 2. Obtener citas ocupadas
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        List<Appointment> existingAppointments =
                appointmentRepository.findByWorkshopIdAndDateTimeBetween(workshopId, startOfDay, endOfDay);

        List<LocalTime> takenHours = existingAppointments.stream()
                .map(a -> a.getDateTime().toLocalTime())
                .toList();

        // 3. Generar franjas dinámicamente
        List<AvailableSlotDTO> slots = new ArrayList<>();
        LocalTime currentSlot = open;

        while (currentSlot.plusMinutes(duration).isBefore(close) || currentSlot.plusMinutes(duration).equals(close)) {
            boolean isAvailable = !takenHours.contains(currentSlot);
            slots.add(new AvailableSlotDTO(currentSlot, isAvailable));
            currentSlot = currentSlot.plusMinutes(duration); // Saltar a la siguiente cita
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
                .build();

        appointmentRepository.save(appointment);
    }

    public AppointmentDTO mapToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .dateTime(appointment.getDateTime())
                .description(appointment.getDescription())
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
}
package org.tfg.backend.appointment;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/availability/{workshopId}")
    public ResponseEntity<List<AvailableSlotDTO>> getAvailability(
            @PathVariable UUID workshopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(workshopId, date));
    }

    @PostMapping
    public ResponseEntity<String> createAppointment(
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        appointmentService.createAppointment(request, userDetails.getUsername());
        return ResponseEntity.ok("Cita reservada con éxito");
    }

    @PostMapping("/staff")
    public ResponseEntity<String> createManualAppointment(@RequestBody AppointmentRequest request) {
        appointmentService.createManualAppointment(request);
        return ResponseEntity.ok("Cita manual registrada con éxito");
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByUser(userDetails.getUsername()));
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<AppointmentDTO>> getWorkshopAppointments(
            @PathVariable UUID workshopId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByWorkshop(workshopId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok("Estado actualizado: " + status);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<String> assignEmployee(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID employeeId) {
        appointmentService.assignAppointment(id, employeeId);
        return ResponseEntity.ok("Empleado asignado");
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<String> rescheduleAppointment(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime dateTime,
            @RequestParam(required = false) Integer duration) {
        appointmentService.rescheduleAppointment(id, employeeId, dateTime, duration);
        return ResponseEntity.ok("Cita re-programada");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok().build(); // Retorna 200 OK si se borra
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar la cita");
        }
    }
}
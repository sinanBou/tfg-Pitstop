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
    public ResponseEntity<?> createManualAppointment(@RequestBody AppointmentRequest request) {
        try {
            appointmentService.createManualAppointment(request);
            return ResponseEntity.ok("Cita manual registrada con éxito");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error inesperado al crear la cita");
        }
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

    /** Appointments that are IN_PROGRESS and have ALL their tasks COMPLETED */
    @GetMapping("/workshop/{workshopId}/ready-for-completion")
    public ResponseEntity<List<AppointmentDTO>> getReadyForCompletion(
            @PathVariable UUID workshopId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsReadyForCompletion(workshopId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok("Estado actualizado: " + status);
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<?> checkInVehicle(
            @PathVariable UUID id,
            @RequestParam Integer kilometers,
            @RequestParam(required = false) String notes) {
        try {
            appointmentService.checkInVehicle(id, kilometers, notes);
            return ResponseEntity.ok("Vehículo recepcionado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al recepcionar el vehículo: " + e.getMessage());
        }
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

    /** Mechanic submits selected tasks -> distributes work across calendar days */
    @PatchMapping("/{id}/manage")
    public ResponseEntity<?> manageAppointmentTasks(
            @PathVariable UUID id,
            @RequestBody AppointmentManagementRequest request) {
        try {
            appointmentService.manageAppointmentTasks(id, request);
            return ResponseEntity.ok("Trabajo planificado y distribuido en el calendario");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al gestionar tareas: " + e.getMessage());
        }
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
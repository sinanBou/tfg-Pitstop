package org.tfg.backend.appointment;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

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
}
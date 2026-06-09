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

/**
 * Controlador REST para la gestión de citas en Pitstop.
 * Proporciona endpoints para clientes y personal del taller para consultar disponibilidad,
 * reservar, reprogramar, asignar empleados, registrar entrada de vehículos y gestionar tareas.
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Obtiene los intervalos de tiempo disponibles (slots) para un taller en una fecha concreta.
     *
     * @param workshopId Identificador único del taller.
     * @param date Fecha para la que se consulta la disponibilidad.
     * @return ResponseEntity con la lista de slots y su estado de disponibilidad.
     */
    @GetMapping("/availability/{workshopId}")
    public ResponseEntity<List<AvailableSlotDTO>> getAvailability(
            @PathVariable UUID workshopId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(workshopId, date));
    }

    /**
     * Registra una nueva cita de cliente en el sistema.
     *
     * @param request Datos de la cita a reservar.
     * @param userDetails Detalles del cliente autenticado.
     * @return ResponseEntity indicando éxito.
     */
    @PostMapping
    public ResponseEntity<String> createAppointment(
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        appointmentService.createAppointment(request, userDetails.getUsername());
        return ResponseEntity.ok("Cita reservada con éxito");
    }

    /**
     * Registra una cita de forma manual (creada internamente por el personal del taller).
     *
     * @param request Datos de la cita a registrar.
     * @return ResponseEntity con mensaje de confirmación del registro.
     */
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

    /**
     * Recupera todas las citas del cliente autenticado actualmente en sesión.
     *
     * @param userDetails Detalles del usuario autenticado.
     * @return ResponseEntity con el listado de DTOs de las citas del usuario.
     */
    @GetMapping("/my-appointments")
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByUser(userDetails.getUsername()));
    }

    /**
     * Recupera el histórico y agenda de citas programadas asociadas a un taller concreto.
     *
     * @param workshopId Identificador único del taller.
     * @return ResponseEntity con el listado de citas pertenecientes al taller.
     */
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<AppointmentDTO>> getWorkshopAppointments(
            @PathVariable UUID workshopId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByWorkshop(workshopId));
    }

    /**
     * Obtiene el listado de citas que están en progreso y cuyas tareas asociadas se han completado,
     * quedando listas para finalizar el servicio.
     *
     * @param workshopId Identificador del taller.
     * @return ResponseEntity con la lista de citas listas para ser completadas.
     */
    @GetMapping("/workshop/{workshopId}/ready-for-completion")
    public ResponseEntity<List<AppointmentDTO>> getReadyForCompletion(
            @PathVariable UUID workshopId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsReadyForCompletion(workshopId));
    }

    /**
     * Actualiza el estado operativo de una cita concreta.
     *
     * @param id Identificador único de la cita.
     * @param status Nuevo estado a aplicar.
     * @return ResponseEntity con la confirmación de la actualización de estado.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok("Estado actualizado: " + status);
    }

    /**
     * Registra la entrada física de un vehículo al taller (recepción del vehículo), indicando
     * el kilometraje actual y notas sobre desperfectos o requerimientos adicionales.
     *
     * @param id Identificador único de la cita.
     * @param kilometers Kilómetros que marca el odómetro del vehículo.
     * @param notes Observaciones físicas del estado del vehículo en la entrada.
     * @return ResponseEntity con mensaje de éxito o de error en la operación.
     */
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

    /**
     * Asigna o reasigna un empleado (mecánico) específico a una cita.
     *
     * @param id Identificador único de la cita.
     * @param employeeId Identificador del empleado (opcional, permite desasignar).
     * @return ResponseEntity confirmando la asignación.
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<String> assignEmployee(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID employeeId) {
        appointmentService.assignAppointment(id, employeeId);
        return ResponseEntity.ok("Empleado asignado");
    }

    /**
     * Reprograma una cita establecida, permitiendo cambiar de fecha, cambiar de mecánico asignado y redefinir su duración estimada.
     *
     * @param id Identificador único de la cita.
     * @param employeeId Identificador del empleado/mecánico asignado (opcional).
     * @param dateTime Nueva fecha y hora propuestas para el inicio de la cita.
     * @param duration Nueva duración estimada expresada en minutos (opcional).
     * @return ResponseEntity de éxito tras reprogramar la cita.
     */
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<String> rescheduleAppointment(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime dateTime,
            @RequestParam(required = false) Integer duration) {
        appointmentService.rescheduleAppointment(id, employeeId, dateTime, duration);
        return ResponseEntity.ok("Cita re-programada");
    }

    /**
     * Endpoint utilizado por los mecánicos para enviar tareas seleccionadas y distribuir
     * la carga de trabajo en el calendario.
     *
     * @param id Identificador único de la cita.
     * @param request Contiene información del tipo de servicio, comentarios del mecánico, estado y la planificación de tareas.
     * @return ResponseEntity indicando que el trabajo ha sido planificado.
     */
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

    /**
     * Elimina físicamente del sistema una cita identificada por su ID.
     *
     * @param id Identificador de la cita a eliminar.
     * @return ResponseEntity con código HTTP 200 si tiene éxito o código de error en caso de fallo.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar la cita");
        }
    }
}
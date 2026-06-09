package org.tfg.backend.appointment;

import lombok.Data;
import java.util.UUID;

/**
 * Solicitud de gestión administrativa o del mecánico para actualizar el estado, comentarios,
 * tareas completadas y tiempo real invertido en la cita.
 */
@Data
public class AppointmentManagementRequest {
    /**
    * Tipo de servicio realizado o actualizado en la cita.
    */
    private String serviceType;
    private String mechanicComments;
    private String status;
    private String completedTasks;
    private String taskAssignments;
    /**
    * Cantidad calculada de minutos dedicados realmente a la cita.
    */
    private Integer calculatedMinutes;
}
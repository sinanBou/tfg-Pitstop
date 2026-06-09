package org.tfg.backend.appointment;

import lombok.Data;
import java.util.UUID;

/**
 * Objeto de solicitud utilizado por el personal del taller para gestionar y actualizar una cita existente.
 */
@Data
public class AppointmentManagementRequest {
    /**
     * Tipo de servicio realizado o actualizado en la cita.
     */
    private String serviceType;

    /**
     * Comentarios u observaciones técnicas añadidas por el mecánico durante el servicio.
     */
    private String mechanicComments;

    /**
     * Estado nuevo al cual se desea cambiar la cita (PENDING, CONFIRMED, etc.).
     */
    private String status;

    /**
     * Listado o detalle de tareas que han sido completadas durante la cita.
     */
    private String completedTasks;

    /**
     * Asignación de tareas específicas a los empleados en el taller.
     */
    private String taskAssignments;

    /**
     * Cantidad calculada de minutos dedicados realmente a la cita.
     */
    private Integer calculatedMinutes;
}

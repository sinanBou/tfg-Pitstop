package org.tfg.backend.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para gestionar las operaciones de persistencia de la entidad Appointment.
 */
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    /**
     * Recupera las citas planificadas para un taller dentro de un rango de fechas y horas específico.
     *
     * @param workshopId Identificador del taller.
     * @param start Fecha y hora de inicio de búsqueda.
     * @param end Fecha y hora de fin de búsqueda.
     * @return Listado de citas coincidentes.
     */
    List<Appointment> findByWorkshopIdAndDateTimeBetween(
            UUID workshopId,
            LocalDateTime start,
            LocalDateTime end
    );

    /**
     * Recupera todas las citas asociadas a un cliente específico.
     *
     * @param clientId Identificador del cliente.
     * @return Listado de citas de ese cliente.
     */
    List<Appointment> findByClientId(UUID clientId);

    /**
     * Recupera todas las citas de un taller ordenadas cronológicamente por su fecha y hora.
     *
     * @param workshopId Identificador del taller.
     * @return Listado ordenado de citas.
     */
    List<Appointment> findByWorkshopIdOrderByDateTimeAsc(UUID workshopId);

    /**
     * Recupera las citas de un vehículo determinado que se encuentren en alguno de los estados especificados.
     *
     * @param vehicleId Identificador del vehículo.
     * @param statuses Lista de estados admisibles para la búsqueda.
     * @return Listado de citas coincidentes.
     */
    List<Appointment> findByVehicleIdAndStatusIn(UUID vehicleId, List<AppointmentStatus> statuses);

    /**
     * Recupera todas las citas vinculadas a un vehículo específico.
     *
     * @param vehicleId Identificador del vehículo.
     * @return Listado de citas del vehículo.
     */
    List<Appointment> findByVehicleId(UUID vehicleId);

    /**
     * Recupera todas las citas asignadas a un empleado o mecánico específico.
     *
     * @param employeeId Identificador del empleado.
     * @return Listado de citas del empleado.
     */
    List<Appointment> findByAssignedEmployeeId(UUID employeeId);
}
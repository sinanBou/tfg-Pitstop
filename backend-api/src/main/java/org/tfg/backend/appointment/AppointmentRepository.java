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
     * Busca todas las citas de un taller en un rango de fechas específico.
     *
     * @param workshopId Identificador del taller.
     * @param start Fecha y hora inicial.
     * @param end Fecha y hora final.
     * @return Listado de citas encontradas.
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
     * Recupera todas las citas de un taller ordenadas cronológicamente por fecha y hora.
     *
     * @param workshopId Identificador del taller.
     * @return Listado de citas ordenadas.
     */
    List<Appointment> findByWorkshopIdOrderByDateTimeAsc(UUID workshopId);

    /**
     * Busca las citas de un vehículo que se encuentren en alguno de los estados indicados.
     *
     * @param vehicleId Identificador del vehículo.
     * @param statuses Lista de estados filtros.
     * @return Listado de citas coincidentes.
     */
    List<Appointment> findByVehicleIdAndStatusIn(UUID vehicleId, List<AppointmentStatus> statuses);

    /**
     * Recupera todas las citas asociadas a un vehículo específico.
     *
     * @param vehicleId Identificador del vehículo.
     * @return Listado de todas las citas del vehículo.
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
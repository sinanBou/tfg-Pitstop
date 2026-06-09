package org.tfg.backend.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para la consulta e interacción con la matriz de carga de trabajo (WorkloadMatrix).
 */
@Repository
public interface WorkloadMatrixRepository extends JpaRepository<WorkloadMatrix, UUID> {
    /**
     * Recupera los registros de la matriz para un taller en un intervalo de tiempo concreto.
     *
     * @param workshopId Identificador del taller.
     * @param start Fecha y hora de inicio.
     * @param end Fecha y hora de fin.
     * @return Lista de registros de la matriz de carga de trabajo coincidentes.
     */
    List<WorkloadMatrix> findByWorkshopIdAndSlotTimeBetween(UUID workshopId, LocalDateTime start, LocalDateTime end);

    /**
     * Recupera todos los registros de la matriz asociados a una cita específica.
     *
     * @param appointmentId Identificador único de la cita.
     * @return Lista de franjas horarias de trabajo reservadas para esa cita.
     */
    List<WorkloadMatrix> findByAppointmentId(UUID appointmentId);
}


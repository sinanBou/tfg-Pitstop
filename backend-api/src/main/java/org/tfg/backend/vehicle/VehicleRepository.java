package org.tfg.backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de persistencia JPA para la entidad {@link Vehicle}.
 * Facilita operaciones de búsqueda de vehículos por cliente o por matrícula.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    /**
    * Obtiene todos los vehículos de un cliente en base a su identificador de perfil.
    *
    * @param clientId Identificador único del cliente.
    * @return Lista de vehículos del cliente.
    */
    List<Vehicle> findByClientId(UUID clientId);

    /**
     * Busca un vehículo por su matrícula exacta.
     *
     * @param licensePlate Número de matrícula.
     * @return Un Optional con el vehículo si existe.
     */
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    /**
     * Comprueba si ya existe registrado algún vehículo con la matrícula dada.
     *
     * @param licensePlate Número de matrícula.
     * @return true si la matrícula ya está registrada, false en caso contrario.
     */
    boolean existsByLicensePlate(String licensePlate);
}
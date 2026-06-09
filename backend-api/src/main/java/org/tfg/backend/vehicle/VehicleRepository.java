package org.tfg.backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de persistencia JPA para la entidad {@link Vehicle}.
 * Permite buscar vehículos por cliente, matrícula y comprobar su existencia.
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
     * Busca un vehículo utilizando su matrícula única.
     *
     * @param licensePlate Matrícula del vehículo.
     * @return Un Optional con el vehículo si se encuentra.
     */
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    /**
     * Verifica la existencia de un vehículo por matrícula.
     *
     * @param licensePlate Matrícula a comprobar.
     * @return true si ya existe, false en caso contrario.
     */
    boolean existsByLicensePlate(String licensePlate);
}
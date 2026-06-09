package org.tfg.backend.workshop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para realizar consultas y operaciones de persistencia sobre
 * la entidad {@link Workshop}.
 */
public interface WorkshopRepository extends JpaRepository<Workshop, UUID> {
    /**
     * Comprueba si existe un taller registrado con un CIF determinado.
     *
     * @param cif Código de Identificación Fiscal.
     * @return true si el CIF ya existe, false en caso contrario.
     */
    boolean existsByCif(String cif);

    /**
     * Recupera los talleres que pertenecen a un propietario específico.
     *
     * @param ownerId Identificador único del propietario (empleado).
     * @return Lista de talleres asociados al propietario.
     */
    List<Workshop> findByOwnerId(UUID ownerId);

    /**
     * Realiza una búsqueda paginada de talleres por coincidencia parcial en nombre,
     * dirección o CIF de forma insensible a mayúsculas y minúsculas.
     *
     * @param query Término de búsqueda.
     * @param pageable Parámetros de paginación.
     * @return Página con los talleres coincidentes.
     */
    @Query("SELECT w FROM Workshop w WHERE " +
           "LOWER(w.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.cif) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Workshop> searchWorkshops(@Param("query") String query, Pageable pageable);
}
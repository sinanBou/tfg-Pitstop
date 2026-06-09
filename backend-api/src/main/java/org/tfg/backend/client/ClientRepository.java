package org.tfg.backend.client;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para gestionar las operaciones de base de datos de la entidad {@link Client}.
 */
public interface ClientRepository extends JpaRepository<Client, UUID> {
    /**
     * Comprueba si existe un cliente con el NIF especificado.
     *
     * @param nif Número de Identificación Fiscal.
     * @return true si existe, false en caso contrario.
     */
    boolean existsByNif(String nif);

    /**
     * Busca un cliente por su NIF.
     *
     * @param nif Número de Identificación Fiscal.
     * @return un Optional conteniendo el cliente si se encuentra.
     */
    Optional<Client> findByNif(String nif);

    /**
     * Busca clientes cuyos nombres o apellidos contengan la cadena especificada de forma insensible a mayúsculas y minúsculas.
     *
     * @param firstname Nombre o fragmento a buscar en el nombre de usuario.
     * @param lastname Apellido o fragmento a buscar en el apellido de usuario.
     * @return Listado de clientes coincidentes.
     */
    List<Client> findByUserFirstnameContainingIgnoreCaseOrUserLastnameContainingIgnoreCase(String firstname, String lastname);

    /**
     * Realiza una búsqueda paginada y global de clientes filtrando por NIF, nombre, apellido o correo electrónico.
     *
     * @param query Texto de búsqueda o filtro.
     * @param pageable Configuración de paginación.
     * @return Una página de clientes que coinciden con los términos de búsqueda.
     */
    @Query("SELECT c FROM Client c WHERE " +
           "LOWER(c.nif) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.user.firstname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.user.lastname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Client> searchClients(@Param("query") String query, Pageable pageable);
}
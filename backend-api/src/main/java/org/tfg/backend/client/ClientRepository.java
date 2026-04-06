package org.tfg.backend.client;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {
    boolean existsByNif(String nif);
    Optional<Client> findByNif(String nif);
    List<Client> findByUserFirstnameContainingIgnoreCaseOrUserLastnameContainingIgnoreCase(String firstname, String lastname);

    @Query("SELECT c FROM Client c WHERE " +
           "LOWER(c.nif) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.user.firstname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.user.lastname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Client> searchClients(@Param("query") String query, Pageable pageable);
}
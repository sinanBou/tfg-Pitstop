package org.tfg.backend.workshop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface WorkshopRepository extends JpaRepository<Workshop, UUID> {
    boolean existsByCif(String cif);
    List<Workshop> findByOwnerId(UUID ownerId);

    @Query("SELECT w FROM Workshop w WHERE " +
           "LOWER(w.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.cif) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Workshop> searchWorkshops(@Param("query") String query, Pageable pageable);
}
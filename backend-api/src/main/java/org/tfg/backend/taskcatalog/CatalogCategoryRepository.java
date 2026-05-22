package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CatalogCategoryRepository extends JpaRepository<CatalogCategory, UUID> {
    List<CatalogCategory> findByWorkshopIdOrderByNameAsc(UUID workshopId);
    Optional<CatalogCategory> findByWorkshopIdAndName(UUID workshopId, String name);
    boolean existsByWorkshopIdAndName(UUID workshopId, String name);
}

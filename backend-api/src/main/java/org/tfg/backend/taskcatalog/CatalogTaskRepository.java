package org.tfg.backend.taskcatalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CatalogTaskRepository extends JpaRepository<CatalogTask, UUID> {
    List<CatalogTask> findByCategoryWorkshopIdOrderByCodeAsc(UUID workshopId);
    Optional<CatalogTask> findByCategoryWorkshopIdAndCode(UUID workshopId, String code);
    boolean existsByCategoryWorkshopIdAndCode(UUID workshopId, String code);
}

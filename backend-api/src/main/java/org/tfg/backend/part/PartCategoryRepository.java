package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

import java.util.List;

@Repository
public interface PartCategoryRepository extends JpaRepository<PartCategory, UUID> {
    Optional<PartCategory> findByNameAndWorkshopId(String name, UUID workshopId);
    List<PartCategory> findByWorkshopId(UUID workshopId);
    List<PartCategory> findByWorkshopIdOrderByNameAsc(UUID workshopId);
}

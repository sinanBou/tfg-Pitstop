package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

import java.util.List;

@Repository
public interface WorkshopInventoryRepository extends JpaRepository<WorkshopInventory, UUID> {
    Optional<WorkshopInventory> findByPartIdAndWorkshopId(UUID partId, UUID workshopId);
    List<WorkshopInventory> findByWorkshopId(UUID workshopId);
}

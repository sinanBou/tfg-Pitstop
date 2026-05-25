package org.tfg.backend.part;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface WorkshopInventoryRepository extends JpaRepository<WorkshopInventory, UUID> {
    Optional<WorkshopInventory> findByPartId(UUID partId);
}

package org.tfg.backend.workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WorkshopRepository extends JpaRepository<Workshop, UUID> {
    boolean existsByCif(String cif);
}
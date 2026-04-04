package org.tfg.backend.client;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {
    boolean existsByNif(String nif);
    Optional<Client> findByNif(String nif);
    List<Client> findByUserFirstnameContainingIgnoreCaseOrUserLastnameContainingIgnoreCase(String firstname, String lastname);
}
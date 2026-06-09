package org.tfg.backend.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

/**
* Repositorio de persistencia JPA para la entidad {@link User}.
* Facilita operaciones de búsqueda de usuarios por email o tokens de verificación y recuperación.
*/
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByPasswordResetToken(String passwordResetToken);
}
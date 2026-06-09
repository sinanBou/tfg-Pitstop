package org.tfg.backend.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de persistencia JPA para la entidad {@link User}.
 * Facilita operaciones de búsqueda de usuarios por email o tokens de verificación y recuperación.
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Busca un usuario por su dirección de correo electrónico única.
     *
     * @param email Correo electrónico del usuario.
     * @return Optional con el usuario encontrado.
     */
    Optional<User> findByEmail(String email);

    /**
     * Comprueba si existe un usuario registrado con el correo electrónico dado.
     *
     * @param email Correo electrónico a comprobar.
     * @return true si ya existe, false si no.
     */
    boolean existsByEmail(String email);

    /**
     * Busca un usuario por su token de verificación de cuenta.
     *
     * @param verificationToken Token de verificación.
     * @return Optional con el usuario asociado.
     */
    Optional<User> findByVerificationToken(String verificationToken);

    /**
     * Busca un usuario por su token de recuperación de contraseña.
     *
     * @param passwordResetToken Token de recuperación.
     * @return Optional con el usuario asociado.
     */
    Optional<User> findByPasswordResetToken(String passwordResetToken);
}
package org.tfg.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Servicio unificado que implementa la lógica de negocio para la gestión de usuarios,
 * consultas seguras de detalles y flujo de cambio de contraseña con validación de seguridad.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Busca un usuario por su email y devuelve su DTO seguro.
     *
     * @param email Correo electrónico del usuario.
     * @return DTO con la información pública del usuario.
     * @throws RuntimeException Si el usuario no se encuentra.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapToDTO(user);
    }

    /**
     * Cambia la contraseña de un usuario autenticado tras validar la contraseña actual.
     * Si el usuario fue registrado con Google y no tiene contraseña local previa, se le permite
     * establecer una contraseña por primera vez directamente sin validar la actual.
     *
     * @param email Correo electrónico del usuario.
     * @param request Datos de la petición con la contraseña actual y la nueva.
     * @throws ResponseStatusException Si el usuario no existe o la contraseña actual es incorrecta.
     */
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Validar contraseña actual solo si ya tiene una contraseña establecida en la base de datos
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta.");
            }
        }

        // Encriptar y actualizar
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Mapea la entidad User a UserDTO de forma segura, resolviendo referencias inversas.
     *
     * @param user Entidad del usuario.
     * @return DTO resultante.
     */
    public UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                // Navegamos a las relaciones inversas para obtener los IDs de perfil
                .clientId(user.getClient() != null ? user.getClient().getId() : null)
                .employeeId(user.getEmployee() != null ? user.getEmployee().getId() : null)
                .workshopId(user.getEmployee() != null && user.getEmployee().getWorkshop() != null ? user.getEmployee().getWorkshop().getId() : null)
                .build();
    }
}
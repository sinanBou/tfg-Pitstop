package org.tfg.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Busca un usuario por su email y devuelve su DTO seguro.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapToDTO(user);
    }

    /**
     * Mapea la entidad User a UserDTO de forma segura.
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
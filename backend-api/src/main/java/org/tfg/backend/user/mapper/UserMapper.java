package org.tfg.backend.user.mapper;

import org.springframework.stereotype.Component;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;

/**
 * Componente encargado de realizar la conversión entre la entidad {@link User}
 * y su Objeto de Transferencia de Datos {@link UserDTO}, resolviendo las relaciones con perfiles asociados.
 */
@Component
public class UserMapper {

    /**
     * Convierte una entidad {@link User} en un DTO {@link UserDTO}.
     *
     * @param user Entidad del usuario a mapear. Puede ser nula.
     * @return El DTO con los detalles mapeados, o null si la entidad es nula.
     */
    public UserDTO mapToDTO(User user) {
        if (user == null) return null;

        return UserDTO.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .clientId(user.getClient() != null ? user.getClient().getId() : null)
                .employeeId(user.getEmployee() != null ? user.getEmployee().getId() : null)
                .workshopId(user.getEmployee() != null && user.getEmployee().getWorkshop() != null ? user.getEmployee().getWorkshop().getId() : null)
                .build();
    }
}

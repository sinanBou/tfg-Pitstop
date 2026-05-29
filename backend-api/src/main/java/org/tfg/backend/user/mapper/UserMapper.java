package org.tfg.backend.user.mapper;

import org.springframework.stereotype.Component;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserDTO;

@Component
public class UserMapper {

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

package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.storage.StorageService;

/**
 * Mapeador encargado de la transformación bidireccional entre la entidad {@link Employee}
 * y el objeto de transferencia de datos {@link EmployeeDTO}.
 */
@Component
@RequiredArgsConstructor
public class EmployeeMapper {

    private final StorageService storageService;

    /**
     * Convierte una entidad {@link Employee} en un {@link EmployeeDTO}.
     * Extrae información del usuario asociado, datos específicos del empleado,
     * taller asignado y genera la URL prefirmada para la imagen de perfil.
     *
     * @param employee Entidad de empleado a mapear. Puede ser nula.
     * @return El DTO con la información del empleado mapeada, o null si el empleado es nulo.
     */
    public EmployeeDTO mapToDTO(Employee employee) {
        if (employee == null) return null;
        return EmployeeDTO.builder()
                .id(employee.getId())
                .firstname(employee.getUser().getFirstname())
                .lastname(employee.getUser().getLastname())
                .email(employee.getUser().getEmail())
                .role(employee.getUser().getRole().name())
                .workshopId(employee.getWorkshop() != null ? employee.getWorkshop().getId() : null)
                .workshopName(employee.getWorkshop() != null ? employee.getWorkshop().getCompanyName() : "Sin taller")
                .address(employee.getAddress() != null ? employee.getAddress() : employee.getUser().getAddress())
                .allowedSections(employee.getAllowedSections())
                .profilePictureUrl(storageService.generatePresignedUrl(employee.getUser().getProfilePictureUrl()))
                .nif(employee.getNif())
                .phoneNumber(employee.getPhoneNumber())
                .build();
    }
}
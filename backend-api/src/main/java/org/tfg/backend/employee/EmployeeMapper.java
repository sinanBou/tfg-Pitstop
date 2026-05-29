package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.storage.StorageService;

@Component
@RequiredArgsConstructor
public class EmployeeMapper {

    private final StorageService storageService;

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
                .address(employee.getUser().getAddress())
                .allowedSections(employee.getAllowedSections())
                .profilePictureUrl(storageService.generatePresignedUrl(employee.getUser().getProfilePictureUrl()))
                .build();
    }
}

package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    /**
     * Obtiene el perfil del empleado logueado.
     */
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Employee employee = user.getEmployee();
        if (employee == null) {
            throw new RuntimeException("El usuario no tiene un perfil de empleado");
        }

        return mapToDTO(employee);
    }

    /**
     * Lista todos los empleados de un taller específico.
     */
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByWorkshop(org.tfg.backend.workshop.Workshop workshop) {
        return employeeRepository.findAll().stream()
                .filter(e -> e.getWorkshop().equals(workshop))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO mapToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .firstname(employee.getUser().getFirstname())
                .lastname(employee.getUser().getLastname())
                .email(employee.getUser().getEmail())
                .workshopId(employee.getWorkshop() != null ? employee.getWorkshop().getId() : null)
                .workshopName(employee.getWorkshop() != null ? employee.getWorkshop().getCompanyName() : "Sin taller")
                .build();
    }
}
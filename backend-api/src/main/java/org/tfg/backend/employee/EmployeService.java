package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.tfg.backend.workshop.WorkshopRepository;
import org.tfg.backend.workshop.Workshop;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WorkshopRepository workshopRepository;

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
     * Lista todos los empleados de un taller específico por su ID.
     */
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByWorkshopId(java.util.UUID workshopId) {
        return employeeRepository.findAll().stream()
                .filter(e -> e.getWorkshop() != null && e.getWorkshop().getId().equals(workshopId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addEmployeeToWorkshop(java.util.UUID workshopId, AddEmployeeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está en uso.");
        }

        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .workshop(workshop)
                .build();
        employeeRepository.save(employee);
    }

    public EmployeeDTO mapToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .firstname(employee.getUser().getFirstname())
                .lastname(employee.getUser().getLastname())
                .email(employee.getUser().getEmail())
                .role(employee.getUser().getRole().name())
                .workshopId(employee.getWorkshop() != null ? employee.getWorkshop().getId() : null)
                .workshopName(employee.getWorkshop() != null ? employee.getWorkshop().getCompanyName() : "Sin taller")
                .build();
    }
}
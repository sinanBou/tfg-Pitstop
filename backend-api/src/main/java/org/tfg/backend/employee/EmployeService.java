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
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WorkshopRepository workshopRepository;
    private final AppointmentRepository appointmentRepository;

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
                .address(request.getAddress())
                .build();
        userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .workshop(workshop)
                .build();
        employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(java.util.UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        // Preparamos citas asociadas para evitar el DataIntegrityViolation
        List<Appointment> asigAppointments = appointmentRepository.findByAssignedEmployeeId(employeeId);
        if (!asigAppointments.isEmpty()) {
            for (Appointment app : asigAppointments) {
                app.setAssignedEmployee(null);
            }
            appointmentRepository.saveAll(asigAppointments);
        }

        User user = employee.getUser();
        
        // Eliminamos al empleado y al usuario asociado (Limpieza total)
        employeeRepository.delete(employee);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Transactional
    public void promoteToManager(java.util.UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        User user = employee.getUser();
        if (user != null) {
            user.setRole(org.tfg.backend.user.Role.WORKSHOP_MANAGER);
            userRepository.save(user);
        }
    }

    @Transactional
    public void demoteToStaff(java.util.UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        User user = employee.getUser();
        if (user != null) {
            user.setRole(org.tfg.backend.user.Role.WORKSHOP_STAFF);
            userRepository.save(user);
        }
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
                .address(employee.getUser().getAddress())
                .build();
    }
}
package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.user.Role;
import org.tfg.backend.user.User;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio administrativo para la gestión de recursos humanos de los talleres.
 * Permite listar empleados vinculados a talleres, dar de alta nuevos empleados,
 * eliminarlos del sistema, ascender/degradar roles y gestionar permisos de secciones.
 */
@Service
@RequiredArgsConstructor
public class EmployeeAdminService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WorkshopRepository workshopRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmployeeMapper employeeMapper;

    /**
     * Obtiene todos los empleados registrados para un taller específico, incluyendo lógica
     * de auto-curación para asegurar que el propietario del taller aparezca en los resultados.
     *
     * @param workshopId Identificador único del taller.
     * @return Listado de DTOs correspondientes a los empleados.
     */
    @Transactional
    public List<EmployeeDTO> getEmployeesByWorkshopId(UUID workshopId) {
        Workshop workshop = workshopRepository.findById(workshopId).orElse(null);
        Employee owner = (workshop != null) ? workshop.getOwner() : null;

        // Auto-curación de base de datos: si el propietario no tiene el taller asignado en su registro, lo corregimos
        if (owner != null && owner.getWorkshop() == null && workshop != null) {
            owner.setWorkshop(workshop);
            employeeRepository.save(owner);
        }

        Set<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getWorkshop() != null && e.getWorkshop().getId().equals(workshopId))
                .collect(Collectors.toSet());

        if (owner != null) {
            employees.add(owner);
        }

        return employees.stream()
                .map(employeeMapper::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Registra un nuevo empleado y lo vincula a un taller determinado.
     * Crea un usuario de seguridad con el rol especificado.
     *
     * @param workshopId Identificador del taller destino.
     * @param request Datos del nuevo empleado.
     */
    @Transactional
    public void addEmployeeToWorkshop(UUID workshopId, AddEmployeeRequest request) {
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
                .isVerified(true)
                .build();
        userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .workshop(workshop)
                .build();
        employeeRepository.save(employee);
    }

    /**
     * Elimina físicamente a un empleado y a su cuenta de usuario asociada, desvinculándolo
     * previamente de cualquier cita asignada.
     *
     * @param employeeId Identificador del empleado.
     */
    @Transactional
    public void deleteEmployee(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        List<Appointment> asigAppointments = appointmentRepository.findByAssignedEmployeeId(employeeId);
        if (!asigAppointments.isEmpty()) {
            for (Appointment app : asigAppointments) {
                app.setAssignedEmployee(null);
            }
            appointmentRepository.saveAll(asigAppointments);
        }

        User user = employee.getUser();
        
        employeeRepository.delete(employee);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    /**
     * Promociona el rol de un empleado a WORKSHOP_MANAGER (gestor).
     *
     * @param employeeId Identificador del empleado.
     */
    @Transactional
    public void promoteToManager(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        User user = employee.getUser();
        if (user != null) {
            user.setRole(Role.WORKSHOP_MANAGER);
            userRepository.save(user);
        }
    }

    /**
     * Degrada el rol de un empleado a WORKSHOP_STAFF (mecánico).
     *
     * @param employeeId Identificador del empleado.
     */
    @Transactional
    public void demoteToStaff(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        User user = employee.getUser();
        if (user != null) {
            user.setRole(Role.WORKSHOP_STAFF);
            userRepository.save(user);
        }
    }

    /**
     * Actualiza la lista de secciones a las que el empleado tiene permitido el acceso en el frontend.
     *
     * @param employeeId Identificador del empleado.
     * @param allowedSections Cadena serializada con las secciones habilitadas.
     */
    @Transactional
    public void updateAllowedSections(UUID employeeId, String allowedSections) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        employee.setAllowedSections(allowedSections);
        employeeRepository.save(employee);
    }
}

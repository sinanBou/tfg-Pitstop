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
 * Servicio encargado de las operaciones administrativas relacionadas con los empleados.
 * Permite a los gerentes y administradores registrar empleados, asignarlos a talleres,
 * cambiar sus roles (ascender o degradar), eliminarlos del sistema y gestionar sus
 * secciones o permisos de acceso.
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
     * Lista todos los empleados asociados a un taller específico y realiza una corrección
     * en caso de que el propietario del taller no tenga la relación de taller establecida.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de DTOs que representan a los empleados del taller.
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
     * Registra un nuevo empleado en el sistema y lo vincula a un taller determinado.
     *
     * @param workshopId Identificador único del taller al que pertenecerá el empleado.
     * @param request Datos del nuevo empleado a registrar (email, contraseña, rol, dirección, etc.).
     * @throws RuntimeException Si el email ya está registrado o el taller no existe.
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
     * Elimina a un empleado del sistema, liberando primero las citas que tuviera asignadas
     * para evitar violaciones de integridad de base de datos. También borra el registro de usuario asociado.
     *
     * @param employeeId Identificador único del empleado a eliminar.
     * @throws RuntimeException Si el empleado no es encontrado.
     */
    @Transactional
    public void deleteEmployee(UUID employeeId) {
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

    /**
     * Asciende al empleado especificado al rol de Gerente (WORKSHOP_MANAGER).
     *
     * @param employeeId Identificador único del empleado.
     * @throws RuntimeException Si el empleado no existe.
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
     * Degrada al empleado especificado al rol de Mecánico o personal de taller (WORKSHOP_STAFF).
     *
     * @param employeeId Identificador único del empleado.
     * @throws RuntimeException Si el empleado no existe.
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
     * Actualiza la lista de secciones o áreas a las que el empleado tiene permitido acceder.
     *
     * @param employeeId Identificador único del empleado.
     * @param allowedSections Cadena con el formato de secciones permitidas.
     * @throws RuntimeException Si el empleado no existe.
     */
    @Transactional
    public void updateAllowedSections(UUID employeeId, String allowedSections) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        employee.setAllowedSections(allowedSections);
        employeeRepository.save(employee);
    }
}

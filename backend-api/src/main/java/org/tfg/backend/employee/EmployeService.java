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

/**
 * Servicio unificado para la gestión de empleados en el sistema.
 * Agrupa las funcionalidades de consulta y edición del perfil propio del empleado,
 * así como las funciones administrativas para dar de alta, baja, ascensos/descensos
 * de empleados y asignación de permisos de secciones dentro de un taller.
 *
 * NOTA: Esta clase combina las tareas de perfil y administración para su consumo directo en controladores.
 */
@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WorkshopRepository workshopRepository;
    private final AppointmentRepository appointmentRepository;
    private final org.tfg.backend.storage.StorageService storageService;

    /**
     * Obtiene el perfil del empleado logueado a partir de su correo electrónico.
     *
     * @param email Correo electrónico del empleado.
     * @return DTO del perfil del empleado correspondiente.
     * @throws RuntimeException Si el usuario no existe o no tiene perfil de empleado.
     */
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Employee employee = user.getEmployee();
        if (employee == null) {
            throw new RuntimeException("El usuario no tiene un perfil de empleado");
        }

        return mapToDTO(employee);
    }

    /**
     * Actualiza el perfil del empleado autenticado (solo campos seguros).
     *
     * @param email Correo electrónico del empleado.
     * @param request Datos del perfil a actualizar.
     * @return DTO del empleado con la información actualizada.
     * @throws RuntimeException Si el usuario no existe.
     */
    @Transactional
    public EmployeeDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (request.getFirstname() != null && !request.getFirstname().isBlank()) {
            user.setFirstname(request.getFirstname().trim());
        }
        if (request.getLastname() != null && !request.getLastname().isBlank()) {
            user.setLastname(request.getLastname().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        userRepository.save(user);
        return mapToDTO(user.getEmployee());
    }

    /**
     * Sube una imagen de perfil a S3 y la asocia al empleado autenticado.
     *
     * @param email Correo electrónico del empleado.
     * @param file Archivo de imagen multimedia.
     * @return DTO del empleado actualizado con la URL de la imagen.
     * @throws java.io.IOException Si ocurre un error al subir el archivo.
     * @throws RuntimeException Si el usuario no existe.
     */
    @Transactional
    public EmployeeDTO uploadProfilePicture(String email, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getProfilePictureUrl() != null) {
            storageService.deleteFile(user.getProfilePictureUrl());
        }

        String fileUrl = storageService.uploadFile(file, "profile-pictures");
        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);

        return mapToDTO(user.getEmployee());
    }

    /**
     * Elimina la imagen de perfil de un empleado de S3 y de la base de datos.
     *
     * @param email Correo electrónico del empleado.
     * @return DTO del empleado actualizado sin la URL del avatar.
     * @throws RuntimeException Si el usuario no existe.
     */
    @Transactional
    public EmployeeDTO deleteProfilePicture(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getProfilePictureUrl() != null) {
            storageService.deleteFile(user.getProfilePictureUrl());
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }

        return mapToDTO(user.getEmployee());
    }

    /**
     * Lista todos los empleados de un taller específico por su ID.
     * Incluye una lógica de autocuración para asegurar que el propietario (Owner) siempre esté en la lista.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de DTOs de los empleados pertenecientes al taller.
     */
    @Transactional
    public List<EmployeeDTO> getEmployeesByWorkshopId(java.util.UUID workshopId) {
        Workshop workshop = workshopRepository.findById(workshopId).orElse(null);
        Employee owner = (workshop != null) ? workshop.getOwner() : null;

        // Auto-curación de base de datos: si el propietario no tiene el taller asignado en su registro, lo corregimos
        if (owner != null && owner.getWorkshop() == null && workshop != null) {
            owner.setWorkshop(workshop);
            employeeRepository.save(owner);
        }

        java.util.Set<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getWorkshop() != null && e.getWorkshop().getId().equals(workshopId))
                .collect(Collectors.toSet());

        if (owner != null) {
            employees.add(owner);
        }

        return employees.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Registra y añade un nuevo empleado a un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @param request Datos del empleado a registrar.
     * @throws RuntimeException Si el correo electrónico ya está en uso o el taller no existe.
     */
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
     * Elimina a un empleado del sistema dado su ID.
     * Libera previamente las citas asignadas para evitar violaciones de clave foránea.
     *
     * @param employeeId Identificador del empleado a eliminar.
     * @throws RuntimeException Si el empleado no existe.
     */
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

    /**
     * Asciende a un empleado al rol de Gerente (WORKSHOP_MANAGER).
     *
     * @param employeeId Identificador del empleado.
     * @throws RuntimeException Si el empleado no existe.
     */
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

    /**
     * Degrada a un empleado al rol de personal de taller/mecánico (WORKSHOP_STAFF).
     *
     * @param employeeId Identificador del empleado.
     * @throws RuntimeException Si el empleado no existe.
     */
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

    /**
     * Actualiza la lista de secciones o áreas a las que el empleado tiene permitido acceder.
     *
     * @param employeeId Identificador del empleado.
     * @param allowedSections Cadena de texto con las secciones permitidas.
     * @throws RuntimeException Si el empleado no existe.
     */
    @Transactional
    public void updateAllowedSections(java.util.UUID employeeId, String allowedSections) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        employee.setAllowedSections(allowedSections);
        employeeRepository.save(employee);
    }

    /**
     * Mapea una entidad {@link Employee} a su correspondiente {@link EmployeeDTO}.
     *
     * @param employee Entidad del empleado.
     * @return DTO del empleado con la información mapeada.
     */
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
                .allowedSections(employee.getAllowedSections())
                .profilePictureUrl(storageService.generatePresignedUrl(employee.getUser().getProfilePictureUrl()))
                .build();
    }
}
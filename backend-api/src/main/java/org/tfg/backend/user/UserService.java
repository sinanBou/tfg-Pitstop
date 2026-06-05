package org.tfg.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.tfg.backend.client.ClientRepository;
import org.tfg.backend.client.Client;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.workshoptask.WorkshopTaskRepository;
import org.tfg.backend.workshoptask.WorkshopTask;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final AppointmentRepository appointmentRepository;
    private final WorkshopTaskRepository workshopTaskRepository;
    private final WorkshopRepository workshopRepository;

    /**
     * Busca un usuario por su email y devuelve su DTO seguro.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserDetails(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapToDTO(user);
    }

    /**
     * Cambia la contraseña de un usuario autenticado tras validar la contraseña actual.
     * Si el usuario fue registrado con Google y no tiene contraseña local previa, se le permite
     * establecer una contraseña por primera vez directamente.
     */
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Validar contraseña actual solo si ya tiene una contraseña establecida en la base de datos
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta.");
            }
        }

        // Encriptar y actualizar
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Elimina un usuario del sistema de forma segura.
     * Si el usuario es CLIENT, elimina todas sus citas y vehículos antes del borrado.
     * Si el usuario es WORKSHOP_STAFF o WORKSHOP_MANAGER, desvincula sus asignaciones.
     * Si el usuario es WORKSHOP_OWNER, impide la auto-eliminación por integridad del negocio.
     */
    @Transactional
    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (user.getRole() == Role.WORKSHOP_OWNER) {
            if (user.getEmployee() != null) {
                List<Workshop> workshops = workshopRepository.findByOwnerId(user.getEmployee().getId());
                if (workshops != null && !workshops.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                            "No se puede eliminar la cuenta de un propietario con talleres activos. Debes dar de baja o transferir tus talleres primero.");
                }
            }
        }

        if (user.getClient() != null) {
            Client client = user.getClient();
            
            // 1. Buscar y eliminar todas las citas del cliente (cascada a tareas y repuestos de cita)
            List<Appointment> appointments = appointmentRepository.findByClientId(client.getId());
            if (appointments != null && !appointments.isEmpty()) {
                appointmentRepository.deleteAll(appointments);
            }
            
            // 2. Eliminar el registro de cliente (cascada a vehículos)
            clientRepository.delete(client);
        } else if (user.getEmployee() != null) {
            Employee employee = user.getEmployee();
            
            // 1. Desvincular de citas asignadas
            List<Appointment> appointments = appointmentRepository.findByAssignedEmployeeId(employee.getId());
            if (appointments != null) {
                for (Appointment app : appointments) {
                    app.setAssignedEmployee(null);
                }
                appointmentRepository.saveAll(appointments);
            }
            
            // 2. Desvincular de tareas asignadas
            List<WorkshopTask> tasks = workshopTaskRepository.findByAssignedEmployeeId(employee.getId());
            if (tasks != null) {
                for (WorkshopTask task : tasks) {
                    task.setAssignedEmployee(null);
                }
                workshopTaskRepository.saveAll(tasks);
            }
            
            // 3. Eliminar empleado
            employeeRepository.delete(employee);
        }

        // 4. Eliminar el usuario
        userRepository.delete(user);
    }

    /**
     * Mapea la entidad User a UserDTO de forma segura.
     */
    public UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                // Navegamos a las relaciones inversas para obtener los IDs de perfil
                .clientId(user.getClient() != null ? user.getClient().getId() : null)
                .employeeId(user.getEmployee() != null ? user.getEmployee().getId() : null)
                .workshopId(user.getEmployee() != null && user.getEmployee().getWorkshop() != null ? user.getEmployee().getWorkshop().getId() : null)
                .build();
    }
}
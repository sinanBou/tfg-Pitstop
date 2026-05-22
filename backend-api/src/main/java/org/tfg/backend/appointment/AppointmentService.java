package org.tfg.backend.appointment;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.client.Client;
import org.tfg.backend.user.UserRepository;
import org.tfg.backend.vehicle.VehicleRepository;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;
import org.tfg.backend.workshoptask.WorkshopTask;
import org.tfg.backend.workshoptask.WorkshopTaskRepository;
import org.tfg.backend.workshoptask.WorkshopTaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkshopRepository workshopRepository;
    private final org.tfg.backend.employee.EmployeeRepository employeeRepository;
    private final WorkshopTaskRepository workshopTaskRepository;

    // Configuración: Citas cada 1 hora, de 9 a 14 y 16 a 19
    private final List<LocalTime> WORKING_HOURS = List.of(
            LocalTime.of(9,0), LocalTime.of(10,0), LocalTime.of(11,0),
            LocalTime.of(12,0), LocalTime.of(13,0), LocalTime.of(16,0),
            LocalTime.of(17,0), LocalTime.of(18,0)
    );

    @Transactional(readOnly = true)
    public List<AvailableSlotDTO> getAvailableSlots(UUID workshopId, LocalDate date) {
        var workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // Mecánicos activos del taller (capacidad real)
        long staffCount = workshop.getEmployees().stream()
                .filter(e -> e.getUser() != null && 
                    (e.getUser().getRole() == org.tfg.backend.user.Role.WORKSHOP_STAFF || 
                     e.getUser().getRole() == org.tfg.backend.user.Role.WORKSHOP_MANAGER))
                .count();
        long totalMechanics = staffCount == 0 ? 1 : staffCount;
        System.out.println("[DEBUG-CAPACITY] getAvailableSlots: workshop=" + workshop.getCompanyName() + ", employees=" + workshop.getEmployees().size() + ", staffCount=" + staffCount + " -> totalMechanics=" + totalMechanics);

        LocalTime open = (workshop.getOpenTime() != null) ? workshop.getOpenTime() : LocalTime.of(9, 0);
        LocalTime close = (workshop.getCloseTime() != null) ? workshop.getCloseTime() : LocalTime.of(18, 0);
        int duration = (workshop.getSlotDurationMinutes() != null && workshop.getSlotDurationMinutes() > 0)
                ? workshop.getSlotDurationMinutes() : 60;

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Solo citas activas (no canceladas ni completadas) con empleado asignado
        List<Appointment> activeAppointments = appointmentRepository
                .findByWorkshopIdAndDateTimeBetween(workshopId, startOfDay, endOfDay)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED
                          && a.getStatus() != AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        List<AvailableSlotDTO> slots = new ArrayList<>();
        LocalTime currentSlot = open;

        while (currentSlot.isBefore(close)) {
            if (currentSlot.plusMinutes(duration).isAfter(close)) break;

            final LocalTime slotTime = currentSlot;

            // Contar mecánicos que YA tienen cita asignada en este slot
            // (cada mecánico solo puede atender una cita a la vez)
            long busyMechanics = activeAppointments.stream()
                    .filter(a -> a.getDateTime().toLocalTime().equals(slotTime))
                    .filter(a -> a.getAssignedEmployee() != null)
                    .map(a -> a.getAssignedEmployee().getId())
                    .distinct()
                    .count();

            // Citas sin asignar también consumen un puesto del taller
            long unassignedInSlot = activeAppointments.stream()
                    .filter(a -> a.getDateTime().toLocalTime().equals(slotTime))
                    .filter(a -> a.getAssignedEmployee() == null)
                    .count();

            long usedCapacity = busyMechanics + unassignedInSlot;

            // [Extensión futura] Descontar mecánicos bloqueados por vacaciones/baja:
            // long blockedMechanics = blockRepository.countByWorkshopAndDateAndSlot(workshopId, date, slotTime);
            // long availableMechanics = totalMechanics - blockedMechanics;
            long availableMechanics = totalMechanics;

            boolean isAvailable = usedCapacity < availableMechanics;
            slots.add(new AvailableSlotDTO(slotTime, isAvailable));

            currentSlot = currentSlot.plusMinutes(duration);
        }

        return slots;
    }

    @Transactional
    public void createAppointment(AppointmentRequest request, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        createBaseAppointment(request, client);
    }

    @Transactional
    public void createManualAppointment(AppointmentRequest request) {
        // En el caso manual (staff), el cliente viene por su ID (UUID)
        // Necesitamos asegurar que el request tenga el clientId
        // Pero el AppointmentRequest actual no lo tiene. Lo añadiremos o crearemos uno nuevo.
        // Por ahora asumo que usaremos el clientId si el request lo permite.
        // Si no, buscaremos el dueño del vehiculo.
        
        var vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        
        Client client = vehicle.getClient();
        createBaseAppointment(request, client);
    }

    private void createBaseAppointment(AppointmentRequest request, Client client) {
        var vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        var workshop = workshopRepository.findById(request.getWorkshopId())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // Validar capacidad por agenda individual de mecánicos
        List<Appointment> slotAppointments = appointmentRepository
                .findByWorkshopIdAndDateTimeBetween(workshop.getId(), request.getDateTime(), request.getDateTime())
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED
                          && a.getStatus() != AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        // Mecánicos ya ocupados en este slot (por agenda individual)
        long busyMechanics = slotAppointments.stream()
                .filter(a -> a.getAssignedEmployee() != null)
                .map(a -> a.getAssignedEmployee().getId())
                .distinct()
                .count();

        // Citas sin asignar también consumen capacidad
        long unassignedInSlot = slotAppointments.stream()
                .filter(a -> a.getAssignedEmployee() == null)
                .count();

        long staffCount = workshop.getEmployees().stream()
                .filter(e -> e.getUser() != null && 
                    (e.getUser().getRole() == org.tfg.backend.user.Role.WORKSHOP_STAFF || 
                     e.getUser().getRole() == org.tfg.backend.user.Role.WORKSHOP_MANAGER))
                .count();
        long totalMechanics = staffCount == 0 ? 1 : staffCount;

        if ((busyMechanics + unassignedInSlot) >= totalMechanics) {
            throw new RuntimeException(
                "Lo sentimos, todos los mecánicos están ocupados en ese horario (" + totalMechanics + " puestos disponibles)."
            );
        }

        // Validar que el vehículo no tenga ya una cita activa
        List<AppointmentStatus> activeStatuses = List.of(
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.IN_PROGRESS,
                AppointmentStatus.DELAYED
        );
        List<Appointment> activeForVehicle = appointmentRepository.findByVehicleIdAndStatusIn(vehicle.getId(), activeStatuses);
        if (!activeForVehicle.isEmpty()) {
            throw new RuntimeException("Este vehículo ya tiene una cita activa en curso. Finalícela o cancélela antes de crear una nueva.");
        }


        org.tfg.backend.employee.Employee employee = null;
        if (request.getAssignedEmployeeId() != null) {
            employee = employeeRepository.findById(request.getAssignedEmployeeId())
                    .orElse(null);
        }

        Appointment appointment = Appointment.builder()
                .client(client)
                .vehicle(vehicle)
                .workshop(workshop)
                .assignedEmployee(employee)
                .dateTime(request.getDateTime())
                .description(request.getDescription())
                .serviceType(request.getServiceType())
                .status(AppointmentStatus.PENDING)
                .estimatedDuration(request.getEstimatedDuration())
                .build();

        appointmentRepository.save(appointment);
    }


    public AppointmentDTO mapToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .dateTime(appointment.getDateTime())
                .description(appointment.getDescription())
                .serviceType(appointment.getServiceType())
                .mechanicComments(appointment.getMechanicComments())
                .status(appointment.getStatus())
                .estimatedDuration(appointment.getEstimatedDuration())
                .actualStartTime(appointment.getActualStartTime())
                .actualEndTime(appointment.getActualEndTime())
                .clientFullName(appointment.getClient().getUser().getFirstname() + " " +
                        appointment.getClient().getUser().getLastname())
                .vehicleId(appointment.getVehicle().getId())
                .vehicleDisplay(appointment.getVehicle().getBrand() + " " +
                        appointment.getVehicle().getModel() + " (" +
                        appointment.getVehicle().getLicensePlate() + ")")
                .workshopId(appointment.getWorkshop().getId())
                .workshopName(appointment.getWorkshop().getCompanyName())
                .workshopHourlyRate(appointment.getWorkshop().getHourlyRate())
                .assignedEmployeeId(appointment.getAssignedEmployee() != null ? appointment.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(appointment.getAssignedEmployee() != null ?
                        appointment.getAssignedEmployee().getUser().getFirstname() + " " +
                        appointment.getAssignedEmployee().getUser().getLastname() : "Sin asignar")
                .build();
    }

    @Transactional
    public void updateAppointmentStatus(UUID appointmentId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // Regla de Negocio: No se puede cancelar una cita que ya está en curso, retrasada o finalizada
        if (newStatus == AppointmentStatus.CANCELLED && (appointment.getStatus() == AppointmentStatus.IN_PROGRESS || appointment.getStatus() == AppointmentStatus.DELAYED || appointment.getStatus() == AppointmentStatus.COMPLETED)) {
            throw new RuntimeException("No se puede cancelar una cita en este estado.");
        }

        // Lógica de "fichado" automático
        if (newStatus == AppointmentStatus.IN_PROGRESS && appointment.getActualStartTime() == null) {
            appointment.setActualStartTime(LocalDateTime.now());
        } else if (newStatus == AppointmentStatus.COMPLETED) {
            appointment.setActualEndTime(LocalDateTime.now());
        }

        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);

        // Aquí se podría disparar la lógica de notificación al cliente si el estado es DELAYED
    }

    @Transactional
    public void assignAppointment(UUID appointmentId, UUID employeeId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (employeeId != null) {
            org.tfg.backend.employee.Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
            appointment.setAssignedEmployee(employee);
        } else {
            appointment.setAssignedEmployee(null);
        }

        appointmentRepository.save(appointment);
    }

    @Transactional
    public void rescheduleAppointment(UUID appointmentId, UUID employeeId, LocalDateTime dateTime, Integer duration) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (employeeId != null) {
            org.tfg.backend.employee.Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
            appointment.setAssignedEmployee(employee);
        } else {
            appointment.setAssignedEmployee(null);
        }
        
        appointment.setDateTime(dateTime);
        if (duration != null) {
            appointment.setEstimatedDuration(duration);
        }
        appointmentRepository.save(appointment);
    }

    /**
     * Mechanic selects tasks from the catalog -> store planned work as PENDING/unassigned.
     * If the estimated minutes exceed the remaining minutes on the original day,
     * the overflow is distributed across subsequent working days.
     */
    @Transactional
    public void manageAppointmentTasks(UUID appointmentId, AppointmentManagementRequest request) {
        if (appointmentId == null) {
            throw new RuntimeException("ID de cita no proporcionado");
        }
        
        Appointment original = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + appointmentId));

        Integer totalMinsRequested = request.getCalculatedMinutes();
        if (totalMinsRequested == null || totalMinsRequested <= 0) {
            throw new RuntimeException("La duración estimada debe ser mayor a 0");
        }
        int totalMinsRemaining = totalMinsRequested;

        Workshop ws = original.getWorkshop();
        if (ws == null) {
            throw new RuntimeException("La cita no tiene un taller asociado");
        }
        LocalTime closeTime = ws.getCloseTime() != null ? ws.getCloseTime() : LocalTime.of(18, 0);
        LocalTime openTime = ws.getOpenTime() != null ? ws.getOpenTime() : LocalTime.of(9, 0);
        
        int dayCapacity = (int) java.time.Duration.between(openTime, closeTime).toMinutes();
        if (dayCapacity <= 0) dayCapacity = 480;

        LocalDateTime currentStart = original.getDateTime();
        
        // 1. Mark original appointment as IN_PROGRESS (meaning it's being handled in the workshop)
        original.setStatus(AppointmentStatus.IN_PROGRESS);
        original.setServiceType(request.getServiceType());
        original.setMechanicComments(request.getMechanicComments());
        original.setEstimatedDuration(request.getCalculatedMinutes());
        
        // Clear previous tasks if any to support re-managing the appointment without duplicating tasks
        if (original.getTasks() != null) {
            original.getTasks().clear();
        }
        appointmentRepository.saveAndFlush(original);

        // 2. Calculate distribution
        int minutesUntilClose = (int) java.time.Duration.between(currentStart.toLocalTime(), closeTime).toMinutes();
        minutesUntilClose = Math.max(0, minutesUntilClose);
        
        int firstDayShare = Math.min(totalMinsRemaining, minutesUntilClose);
        
        // 3. Create WorkshopTasks instead of continuation appointments
        // Task 1: Today's share
        if (firstDayShare > 0) {
            WorkshopTask firstTask = WorkshopTask.builder()
                    .originAppointment(original)
                    .vehicle(original.getVehicle())
                    .workshop(ws)
                    .dateTime(currentStart)
                    .description(original.getDescription())
                    .serviceType(request.getServiceType())
                    .status(WorkshopTaskStatus.PENDING)
                    .estimatedDuration(firstDayShare)
                    .build();
            workshopTaskRepository.save(firstTask);
            totalMinsRemaining -= firstDayShare;
        }

        // Subsequent days
        LocalDate nextDay = currentStart.toLocalDate().plusDays(1);
        while (totalMinsRemaining > 0) {
            while (nextDay.getDayOfWeek() == java.time.DayOfWeek.SATURDAY || 
                   nextDay.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
                nextDay = nextDay.plusDays(1);
            }

            int dayMinutes = Math.min(totalMinsRemaining, dayCapacity);
            
            String desc = original.getDescription();
            if (desc != null && desc.length() > 200) desc = desc.substring(0, 200);
            desc = (desc != null ? desc : "Tarea") + " (Cont.)";

            WorkshopTask continuation = WorkshopTask.builder()
                    .originAppointment(original)
                    .vehicle(original.getVehicle())
                    .workshop(ws)
                    .dateTime(nextDay.atTime(openTime))
                    .description(desc)
                    .serviceType(request.getServiceType())
                    .status(WorkshopTaskStatus.PENDING)
                    .estimatedDuration(dayMinutes)
                    .build();
            
            workshopTaskRepository.save(continuation);
            totalMinsRemaining -= dayMinutes;
            nextDay = nextDay.plusDays(1);
        }
    }


    public List<AppointmentDTO> getAppointmentsByUser(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getClient() == null) return List.of();

        return appointmentRepository.findByClientId(user.getClient().getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsReadyForCompletion(UUID workshopId) {
        return appointmentRepository.findByWorkshopIdOrderByDateTimeAsc(workshopId)
                .stream()
                .filter(a -> {
                    // COMPLETED: waiting for client pickup confirmation
                    if (a.getStatus() == AppointmentStatus.COMPLETED) return true;
                    // IN_PROGRESS with ALL tasks COMPLETED: ready for manager sign-off
                    if (a.getStatus() == AppointmentStatus.IN_PROGRESS
                            && a.getTasks() != null && !a.getTasks().isEmpty()
                            && a.getTasks().stream().allMatch(t -> t.getStatus() == org.tfg.backend.workshoptask.WorkshopTaskStatus.COMPLETED)) {
                        return true;
                    }
                    return false;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByWorkshop(UUID workshopId) {
        return appointmentRepository.findByWorkshopIdOrderByDateTimeAsc(workshopId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteAppointment(UUID id) {
        // Verificamos si existe antes de borrar para evitar excepciones genéricas
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La cita con ID " + id + " no existe"));

        // Regla de Negocio: No se puede eliminar una cita que ya está retrasada o finalizada
        if (appointment.getStatus() == AppointmentStatus.DELAYED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("No se puede eliminar una cita en su estado actual.");
        }

        appointmentRepository.delete(appointment);
    }
}
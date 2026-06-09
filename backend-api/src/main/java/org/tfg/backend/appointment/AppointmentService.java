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
import org.tfg.backend.invoice.Invoice;
import org.tfg.backend.invoice.InvoiceRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio encargado de la lógica de negocio de las citas (Appointments) en Pitstop.
 * Administra la obtención de slots libres, reservas, reprogramaciones, entrada física de vehículos,
 * asignación de personal y distribución de carga de trabajo (WorkshopTasks) en el calendario.
 */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkshopRepository workshopRepository;
    private final org.tfg.backend.employee.EmployeeRepository employeeRepository;
    private final WorkshopTaskRepository workshopTaskRepository;
    private final InvoiceRepository invoiceRepository;

    // Configuración: Citas cada 1 hora, de 9 a 14 y 16 a 19
    /**
    * Horario estÃ¡ndar predeterminado de franjas de trabajo del taller.
    */
    private final List<LocalTime> WORKING_HOURS = List.of(
            LocalTime.of(9,0), LocalTime.of(10,0), LocalTime.of(11,0),
            LocalTime.of(12,0), LocalTime.of(13,0), LocalTime.of(16,0),
            LocalTime.of(17,0), LocalTime.of(18,0)
    );

    /**
     * Calcula los intervalos de tiempo disponibles (slots) de un taller para una fecha concreta,
     * teniendo en cuenta el horario comercial del taller y el número de mecánicos disponibles en ese momento.
     *
     * @param workshopId Identificador del taller.
     * @param date Fecha para la que se consulta la disponibilidad.
     * @return Listado de slots y su estado de disponibilidad.
     */
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
        if (workshop.getIncludeOwnerInPlanning() != null && workshop.getIncludeOwnerInPlanning()) {
            totalMechanics += 1;
        }
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

    /**
     * Registra una nueva cita iniciada por el cliente.
     *
     * @param request Datos del formulario de la cita.
     * @param userEmail Correo electrónico del usuario autenticado.
     */
    @Transactional
    public void createAppointment(AppointmentRequest request, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
 
        Client client = user.getClient();
        createBaseAppointment(request, client);
    }
 
    /**
     * Registra una cita de manera manual por el personal del taller para un vehículo específico.
     *
     * @param request Datos de la solicitud de la cita.
     */
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

    /**
     * Método interno auxiliar para validar y crear una cita en la base de datos a partir de un cliente asociado.
     *
     * @param request Datos de la cita.
     * @param client Cliente solicitante.
     */
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
        if (workshop.getIncludeOwnerInPlanning() != null && workshop.getIncludeOwnerInPlanning()) {
            totalMechanics += 1;
        }

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


    /**
     * Mapea una entidad {@link Appointment} a su correspondiente {@link AppointmentDTO}.
     * Calcula también el coste de mano de obra y repuestos de la cita.
     *
     * @param appointment Entidad de la cita.
     * @return El DTO mapeado y completado.
     */
    public AppointmentDTO mapToDTO(Appointment appointment) {
        Double price = null;
        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.PICKED_UP) {
            price = invoiceRepository.findByAppointmentId(appointment.getId())
                    .map(Invoice::getTotalPrice)
                    .orElse(null);
        }
        if (price == null) {
            double durationHours = (appointment.getEstimatedDuration() != null ? appointment.getEstimatedDuration() : 0) / 60.0;
            double rate = appointment.getWorkshop() != null && appointment.getWorkshop().getHourlyRate() != null ? appointment.getWorkshop().getHourlyRate() : 50.0;
            price = durationHours * rate;
        }

        return AppointmentDTO.builder()
                .id(appointment.getId())
                .dateTime(appointment.getDateTime())
                .description(appointment.getDescription())
                .serviceType(appointment.getServiceType())
                .mechanicComments(appointment.getMechanicComments())
                .parts(appointment.getParts() != null ? appointment.getParts().stream()
                        .map(p -> org.tfg.backend.part.AppointmentPartDTO.builder()
                                .id(p.getId())
                                .partId(p.getPart().getId())
                                .name(p.getPart().getName())
                                .quantityUsed(p.getQuantityUsed())
                                .appliedPrice(p.getAppliedPrice())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())
                .status(appointment.getStatus())
                .estimatedDuration(appointment.getEstimatedDuration())
                .actualStartTime(appointment.getActualStartTime())
                .actualEndTime(appointment.getActualEndTime())
                .confirmedAt(appointment.getConfirmedAt())
                .receptionKilometers(appointment.getReceptionKilometers())
                .receptionNotes(appointment.getReceptionNotes())
                .vehicleReceived(appointment.getVehicleReceived() != null ? appointment.getVehicleReceived() : false)

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
                .totalPrice(price)
                .build();
    }

    /**
     * Actualiza el estado de una cita y registra de forma automática los tiempos reales de inicio y fin,
     * además de gestionar la desvinculación y estado del vehículo en el taller si procede.
     *
     * @param appointmentId Identificador de la cita.
     * @param newStatus Nuevo estado operativo a asignar.
     */
    @Transactional
    public void updateAppointmentStatus(UUID appointmentId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // Regla de Negocio: Si ya ha sido recogida y finalizada, no se permiten más cambios de estado
        if (appointment.getStatus() == AppointmentStatus.PICKED_UP) {
            throw new RuntimeException("La cita ya ha sido recogida y finalizada. No se permiten más cambios de estado.");
        }

        // Regla de Negocio: No se puede cancelar una cita que ya está en curso, retrasada o finalizada
        if (newStatus == AppointmentStatus.CANCELLED && (appointment.getStatus() == AppointmentStatus.IN_PROGRESS || appointment.getStatus() == AppointmentStatus.DELAYED || appointment.getStatus() == AppointmentStatus.COMPLETED)) {
            throw new RuntimeException("No se puede cancelar una cita en este estado.");
        }

        // Lógica de "fichado" automático
        if ((newStatus == AppointmentStatus.CONFIRMED || newStatus == AppointmentStatus.IN_PROGRESS || newStatus == AppointmentStatus.COMPLETED) && appointment.getConfirmedAt() == null) {
            appointment.setConfirmedAt(LocalDateTime.now());
        }

        if (newStatus == AppointmentStatus.IN_PROGRESS && appointment.getActualStartTime() == null) {
            appointment.setActualStartTime(LocalDateTime.now());
        } else if (newStatus == AppointmentStatus.COMPLETED) {
            appointment.setActualEndTime(LocalDateTime.now());
        }

        if (newStatus == AppointmentStatus.PICKED_UP) {
            org.tfg.backend.vehicle.Vehicle vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("ENTREGADO");
                vehicleRepository.save(vehicle);
            }
        } else if (newStatus == AppointmentStatus.CANCELLED) {
            appointment.setActualEndTime(LocalDateTime.now());
            org.tfg.backend.vehicle.Vehicle vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("CANCELADO");
                vehicleRepository.save(vehicle);
            }
        }

        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);
        // Aquí se podría disparar la lógica de notificación al cliente si el estado es DELAYED
    }

    /**
     * Registra la recepción física de un vehículo en el taller, almacenando los kilómetros del odómetro y notas de recepción,
     * y actualizando el taller actual y estado del vehículo.
     *
     * @param appointmentId Identificador de la cita.
     * @param kilometers Kilómetros marcados.
     * @param notes Notas sobre el estado de entrega del vehículo.
     */
    @Transactional
    public void checkInVehicle(UUID appointmentId, Integer kilometers, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        
        appointment.setVehicleReceived(true);
        appointment.setReceptionKilometers(kilometers);
        appointment.setReceptionNotes(notes);
        
        org.tfg.backend.vehicle.Vehicle vehicle = appointment.getVehicle();
        if (vehicle != null) {
            vehicle.setCurrentWorkshop(appointment.getWorkshop());
            vehicle.setStatus("RECIBIDO");
            vehicleRepository.save(vehicle);
        }
        
        appointmentRepository.save(appointment);
    }


    /**
     * Asigna o reasigna un empleado (mecánico) responsable a una cita concreta.
     *
     * @param appointmentId Identificador de la cita.
     * @param employeeId Identificador del empleado (nulo si se desea desasignar).
     */
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

    /**
     * Reprograma una cita existente, permitiendo cambiar su fecha y hora, el empleado asignado y su duración estimada.
     *
     * @param appointmentId Identificador de la cita.
     * @param employeeId Identificador del mecánico responsable (opcional).
     * @param dateTime Nueva fecha y hora propuestas.
     * @param duration Nueva duración estimada en minutos (opcional).
     */
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
     * Método para la planificación y distribución de tareas de una cita por parte de los mecánicos.
     * Si las tareas estimadas superan la jornada laboral restante, las distribuye en días laborables posteriores.
     *
     * @param appointmentId Identificador de la cita.
     * @param request Datos de la planificación (tareas y minutos estimados).
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


    /**
     * Recupera todas las citas asociadas a un cliente identificado por su correo electrónico.
     *
     * @param email Email del usuario/cliente.
     * @return Listado de DTOs correspondientes a sus citas.
     */
    public List<AppointmentDTO> getAppointmentsByUser(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getClient() == null) return List.of();

        return appointmentRepository.findByClientId(user.getClient().getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el listado de citas que están en progreso y listas para ser finalizadas
     * (con todas sus sub-tareas completadas).
     *
     * @param workshopId Identificador del taller.
     * @return Listado de DTOs de las citas listas para entrega.
     */
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

    /**
     * Recupera el listado completo de citas asociadas a un taller concreto.
     *
     * @param workshopId Identificador único del taller.
     * @return Listado de DTOs de las citas del taller.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByWorkshop(UUID workshopId) {
        return appointmentRepository.findByWorkshopIdOrderByDateTimeAsc(workshopId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Elimina físicamente una cita del sistema, limpiando previamente sus tareas
     * y facturas asociadas y liberando el vehículo.
     *
     * @param id Identificador único de la cita a eliminar.
     */
    @Transactional
    public void deleteAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La cita con ID " + id + " no existe"));

        // Solo bloquear eliminación si ya fue completada o recogida
        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.PICKED_UP) {
            throw new RuntimeException("No se puede eliminar una cita que ya ha sido completada o recogida.");
        }

        // Limpiar tareas asociadas
        workshopTaskRepository.deleteByOriginAppointmentId(id);

        // Limpiar factura asociada si existe
        invoiceRepository.findByAppointmentId(id).ifPresent(invoiceRepository::delete);

        // Liberar vehículo si estaba recibido en el taller
        if (Boolean.TRUE.equals(appointment.getVehicleReceived())) {
            var vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("CANCELADO");
                vehicleRepository.save(vehicle);
            }
        }

        appointmentRepository.delete(appointment);
    }
}
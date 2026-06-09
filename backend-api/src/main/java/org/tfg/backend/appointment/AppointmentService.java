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
 * Servicio de lógica de negocio para la gestión integral de citas, cálculo de huecos horarios disponibles
 * (capacidad por mecánicos), recepciones de vehículos, reprogramaciones y distribución de carga de trabajo en el taller.
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

    /**
     * Horario estándar predeterminado de franjas de trabajo del taller.
     */
    private final List<LocalTime> WORKING_HOURS = List.of(
            LocalTime.of(9,0), LocalTime.of(10,0), LocalTime.of(11,0),
            LocalTime.of(12,0), LocalTime.of(13,0), LocalTime.of(16,0),
            LocalTime.of(17,0), LocalTime.of(18,0)
    );

    /**
     * Calcula los huecos de tiempo (slots) disponibles para reservar citas en un taller en una fecha concreta.
     * Toma en cuenta la cantidad de mecánicos activos del taller y las citas confirmadas o activas
     * en cada slot para no superar la capacidad máxima de la agenda.
     *
     * @param workshopId Identificador único del taller.
     * @param date Fecha a consultar.
     * @return Listado de DTOs que representan cada franja horaria y su estado de disponibilidad.
     */
    @Transactional(readOnly = true)
    public List<AvailableSlotDTO> getAvailableSlots(UUID workshopId, LocalDate date) {
        var workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // Determina el número total de mecánicos activos en el taller para definir la capacidad real
        long staffCount = workshop.getEmployees().stream()
                .filter(e -> e.getUser() != null && 
                    (e.getUser().getRole() == org.tfg.backend.user.Role.WORKSHOP_STAFF || 
                     e.getUser().getRole() == org.tfg.backend.user.Role.WORKSHOP_MANAGER))
                .count();
        long totalMechanics = staffCount == 0 ? 1 : staffCount;
        if (workshop.getIncludeOwnerInPlanning() != null && workshop.getIncludeOwnerInPlanning()) {
            totalMechanics += 1;
        }

        LocalTime open = (workshop.getOpenTime() != null) ? workshop.getOpenTime() : LocalTime.of(9, 0);
        LocalTime close = (workshop.getCloseTime() != null) ? workshop.getCloseTime() : LocalTime.of(18, 0);
        int duration = (workshop.getSlotDurationMinutes() != null && workshop.getSlotDurationMinutes() > 0)
                ? workshop.getSlotDurationMinutes() : 60;

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Obtiene únicamente las citas activas (no canceladas ni completadas) agendadas para este día
        List<Appointment> activeAppointments = appointmentRepository
                .findByWorkshopIdAndDateTimeBetween(workshopId, startOfDay, endOfDay)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED
                          && a.getStatus() != AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        List<AvailableSlotDTO> slots = new ArrayList<>();
        LocalTime currentSlot = open;

        // Itera sobre las franjas horarias laborables del día calculando disponibilidad
        while (currentSlot.isBefore(close)) {
            if (currentSlot.plusMinutes(duration).isAfter(close)) break;

            final LocalTime slotTime = currentSlot;

            // Cuenta los mecánicos que ya tienen una cita asignada en esta franja horaria concreta
            long busyMechanics = activeAppointments.stream()
                    .filter(a -> a.getDateTime().toLocalTime().equals(slotTime))
                    .filter(a -> a.getAssignedEmployee() != null)
                    .map(a -> a.getAssignedEmployee().getId())
                    .distinct()
                    .count();

            // Las citas creadas que no tienen un mecánico asignado todavía también consumen un puesto de capacidad del taller
            long unassignedInSlot = activeAppointments.stream()
                    .filter(a -> a.getDateTime().toLocalTime().equals(slotTime))
                    .filter(a -> a.getAssignedEmployee() == null)
                    .count();

            long usedCapacity = busyMechanics + unassignedInSlot;
            long availableMechanics = totalMechanics;

            boolean isAvailable = usedCapacity < availableMechanics;
            slots.add(new AvailableSlotDTO(slotTime, isAvailable));

            currentSlot = currentSlot.plusMinutes(duration);
        }

        return slots;
    }

    /**
     * Registra una nueva cita creada por el propio cliente de forma telemática.
     *
     * @param request Datos de la cita solicitada.
     * @param userEmail Email del usuario autenticado que realiza la reserva.
     */
    @Transactional
    public void createAppointment(AppointmentRequest request, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Client client = user.getClient();
        createBaseAppointment(request, client);
    }

    /**
     * Registra una nueva cita de manera manual por parte de un miembro del personal del taller (staff).
     *
     * @param request Datos de la cita a registrar manualmente.
     */
    @Transactional
    public void createManualAppointment(AppointmentRequest request) {
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

        // Valida la capacidad de la agenda del taller para esa hora
        List<Appointment> slotAppointments = appointmentRepository
                .findByWorkshopIdAndDateTimeBetween(workshop.getId(), request.getDateTime(), request.getDateTime())
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED
                          && a.getStatus() != AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        long busyMechanics = slotAppointments.stream()
                .filter(a -> a.getAssignedEmployee() != null)
                .map(a -> a.getAssignedEmployee().getId())
                .distinct()
                .count();

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

        // Valida que el vehículo seleccionado no tenga ya otra cita en curso activa
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
     * Mapea una entidad Appointment a su correspondiente DTO representativo para ser enviado
     * a través de la API. Calcula también el coste de mano de obra y repuestos.
     *
     * @param appointment Entidad de cita.
     * @return DTO simplificado e informativo de la cita.
     */
    public AppointmentDTO mapToDTO(Appointment appointment) {
        Double price = null;
        // Si la cita ya está finalizada o entregada, intenta buscar el total en la factura emitida
        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.PICKED_UP) {
            price = invoiceRepository.findByAppointmentId(appointment.getId())
                    .map(Invoice::getTotalPrice)
                    .orElse(null);
        }
        // Si no se encuentra una factura, calcula una estimación en base al tiempo estimado y tarifa horaria del taller
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
     * Actualiza el estado operativo de una cita concreta. Modifica y registra también los tiempos
     * reales de fichaje de inicio y finalización del trabajo según corresponda.
     *
     * @param appointmentId Identificador de la cita.
     * @param newStatus Nuevo estado operativo.
     */
    @Transactional
    public void updateAppointmentStatus(UUID appointmentId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // Restricción: No se puede cancelar una cita si ya se encuentra en progreso, retrasada o finalizada
        if (newStatus == AppointmentStatus.CANCELLED && (appointment.getStatus() == AppointmentStatus.IN_PROGRESS || appointment.getStatus() == AppointmentStatus.DELAYED || appointment.getStatus() == AppointmentStatus.COMPLETED)) {
            throw new RuntimeException("No se puede cancelar una cita en este estado.");
        }

        // Fichado y marcado temporal automático según las transiciones del estado
        if ((newStatus == AppointmentStatus.CONFIRMED || newStatus == AppointmentStatus.IN_PROGRESS || newStatus == AppointmentStatus.COMPLETED) && appointment.getConfirmedAt() == null) {
            appointment.setConfirmedAt(LocalDateTime.now());
        }

        if (newStatus == AppointmentStatus.IN_PROGRESS && appointment.getActualStartTime() == null) {
            appointment.setActualStartTime(LocalDateTime.now());
        } else if (newStatus == AppointmentStatus.COMPLETED) {
            appointment.setActualEndTime(LocalDateTime.now());
        }

        // Lógica de liberación de vehículo al ser entregado o anulado
        if (newStatus == AppointmentStatus.PICKED_UP) {
            org.tfg.backend.vehicle.Vehicle vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("ENTREGADO");
                vehicleRepository.save(vehicle);
            }
        } else if (newStatus == AppointmentStatus.CANCELLED) {
            org.tfg.backend.vehicle.Vehicle vehicle = appointment.getVehicle();
            if (vehicle != null) {
                vehicle.setCurrentWorkshop(null);
                vehicle.setStatus("CANCELADO");
                vehicleRepository.save(vehicle);
            }
        }

        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);
    }

    /**
     * Registra la recepción física del vehículo en las instalaciones del taller.
     * Actualiza el kilometraje de odómetro de entrada y vincula el vehículo al taller.
     *
     * @param appointmentId Identificador de la cita.
     * @param kilometers Kilómetros de entrada declarados.
     * @param notes Notas adicionales del estado de recepción.
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
     * Asigna un empleado o mecánico específico a una cita para que asuma la responsabilidad.
     *
     * @param appointmentId Identificador de la cita.
     * @param employeeId Identificador del empleado (si es null, desasigna al empleado actual).
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
     * Reprograma temporalmente una cita modificando su fecha, hora y duración estimada.
     * Permite reasignar el mecánico responsable en el mismo proceso.
     *
     * @param appointmentId Identificador de la cita.
     * @param employeeId Identificador del empleado/mecánico (opcional).
     * @param dateTime Nueva fecha y hora programada.
     * @param duration Nueva duración prevista en minutos (opcional).
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
     * Planifica y gestiona las tareas del taller asociadas a la cita. Si la duración de los trabajos
     * excede las horas laborables restantes del día original, el desborde se distribuye
     * de manera inteligente en días hábiles sucesivos.
     *
     * @param appointmentId Identificador de la cita.
     * @param request Parámetros de la planificación y minutos totales requeridos.
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
        
        // Calcula la capacidad diaria en base a las horas de apertura y cierre del taller
        int dayCapacity = (int) java.time.Duration.between(openTime, closeTime).toMinutes();
        if (dayCapacity <= 0) dayCapacity = 480;

        LocalDateTime currentStart = original.getDateTime();
        
        // Marca la cita origen como IN_PROGRESS al iniciar la planificación de tareas de taller
        original.setStatus(AppointmentStatus.IN_PROGRESS);
        original.setServiceType(request.getServiceType());
        original.setMechanicComments(request.getMechanicComments());
        original.setEstimatedDuration(request.getCalculatedMinutes());
        
        // Limpia tareas previas registradas para dar soporte a re-planificaciones sin duplicar datos
        if (original.getTasks() != null) {
            original.getTasks().clear();
        }
        appointmentRepository.saveAndFlush(original);

        // Calcula minutos restantes laborables en la primera jornada
        int minutesUntilClose = (int) java.time.Duration.between(currentStart.toLocalTime(), closeTime).toMinutes();
        minutesUntilClose = Math.max(0, minutesUntilClose);
        
        int firstDayShare = Math.min(totalMinsRemaining, minutesUntilClose);
        
        // Genera la tarea principal del primer día
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

        // Distribuye de forma secuencial los minutos excedentes de forma equitativa los días siguientes (excluyendo fin de semana)
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
     * Devuelve las citas de un taller que están en estado COMPLETED o IN_PROGRESS con todas sus tareas
     * técnicas terminadas, listas para la confirmación de entrega o cobro.
     *
     * @param workshopId Identificador del taller.
     * @return Lista de DTOs de citas listas para entrega.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsReadyForCompletion(UUID workshopId) {
        return appointmentRepository.findByWorkshopIdOrderByDateTimeAsc(workshopId)
                .stream()
                .filter(a -> {
                    if (a.getStatus() == AppointmentStatus.COMPLETED) return true;
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
     * Obtiene el listado de citas de un taller ordenadas cronológicamente.
     *
     * @param workshopId Identificador del taller.
     * @return Lista de DTOs de las citas de ese taller.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByWorkshop(UUID workshopId) {
        return appointmentRepository.findByWorkshopIdOrderByDateTimeAsc(workshopId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Elimina físicamente una cita del sistema. Limpia también las tareas de taller programadas,
     * facturas emitidas asociadas y libera el estado de recepción del vehículo involucrado.
     *
     * @param id Identificador único de la cita a eliminar.
     */
    @Transactional
    public void deleteAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La cita con ID " + id + " no existe"));

        // Restricción: No se permite la eliminación de citas ya completadas o recogidas para integridad de facturación
        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.PICKED_UP) {
            throw new RuntimeException("No se puede eliminar una cita que ya ha sido completada o recogida.");
        }

        // Elimina las tareas de taller asociadas
        workshopTaskRepository.deleteByOriginAppointmentId(id);

        // Elimina la factura vinculada si existe
        invoiceRepository.findByAppointmentId(id).ifPresent(invoiceRepository::delete);

        // Libera y restablece el estado del vehículo en el taller si estaba recepcionado
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
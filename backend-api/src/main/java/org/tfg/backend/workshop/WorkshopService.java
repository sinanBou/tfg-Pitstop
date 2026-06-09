package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.invoice.InvoiceRepository;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.workshoptask.WorkshopTaskRepository;
import org.tfg.backend.taskcatalog.TaskCategoryRepository;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.part.service.PartAdminService;
import org.tfg.backend.part.PartCategory;
import org.tfg.backend.part.PartCategoryRepository;
import org.tfg.backend.part.WorkshopInventory;
import org.tfg.backend.part.WorkshopInventoryRepository;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final EmployeeRepository employeeRepository;
    private final org.tfg.backend.taskcatalog.CatalogInitializationService catalogInitializationService;
    private final org.tfg.backend.storage.StorageService storageService;
    private final TaskCategoryRepository catalogCategoryRepository;
    private final AppointmentRepository appointmentRepository;
    private final WorkshopTaskRepository workshopTaskRepository;
    private final InvoiceRepository invoiceRepository;
    private final PartAdminService partAdminService;
    private final PartCategoryRepository partCategoryRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;

    /**
     * Registra un nuevo taller en el sistema.
     * Verifica que el CIF no esté duplicado y asigna un empleado como dueño.
     */
    @Transactional
    public WorkshopDTO saveWorkshop(WorkshopRequest request) {
        if (request.getCif() == null || request.getCif().trim().isEmpty()) {
            throw new RuntimeException("El CIF del taller es obligatorio.");
        }
        if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
            throw new RuntimeException("La dirección del taller es obligatoria.");
        }
        if (workshopRepository.existsByCif(request.getCif())) {
            throw new RuntimeException("Ya existe un taller registrado con el CIF: " + request.getCif());
        }

        Employee owner = employeeRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("No se encontró el empleado con ID: " + request.getOwnerId()));

        java.time.LocalTime open = request.getOpenTime() != null ? request.getOpenTime() : java.time.LocalTime.of(9, 0);
        java.time.LocalTime close = request.getCloseTime() != null ? request.getCloseTime() : java.time.LocalTime.of(18, 0);
        if (!close.isAfter(open)) {
            throw new RuntimeException("La hora de cierre debe ser posterior a la hora de apertura.");
        }

        int slotMins = request.getSlotDurationMinutes() != null ? request.getSlotDurationMinutes() : 60;
        if (slotMins <= 0) {
            throw new RuntimeException("La duración de la cita debe ser mayor a 0 minutos.");
        }

        double rate = request.getHourlyRate() != null ? request.getHourlyRate() : 50.0;
        if (rate < 0) {
            throw new RuntimeException("El precio de la mano de obra no puede ser negativo.");
        }

        // Construcción de la entidad incluyendo los nuevos campos de tiempo
        Workshop workshop = Workshop.builder()
                .cif(request.getCif().trim())
                .companyName(request.getCompanyName())
                .address(request.getAddress().trim())
                .owner(owner)
                .openTime(open)
                .closeTime(close) 
                .slotDurationMinutes(slotMins)
                .workingDays(request.getWorkingDays())
                .hourlyRate(rate)
                .includeOwnerInPlanning(request.getIncludeOwnerInPlanning() != null ? request.getIncludeOwnerInPlanning() : false)
                .build();

        Workshop savedWorkshop = workshopRepository.save(workshop);
        owner.setWorkshop(savedWorkshop);
        employeeRepository.save(owner);
        catalogInitializationService.initializeCatalogForWorkshop(savedWorkshop);
        partAdminService.initializeInventoryForWorkshop(savedWorkshop);
        return mapToDTO(savedWorkshop);
    }

    /**
     * Elimina de forma segura un taller y desasocia a su dueño y empleados para evitar errores de clave foránea.
     */
    @Transactional
    public void deleteWorkshop(UUID id) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // 1. Desasociar todos los vehículos dentro del taller para evitar el borrado catastrófico en cascada de vehículos
        if (workshop.getVehiclesInside() != null) {
            for (Vehicle vehicle : new ArrayList<>(workshop.getVehiclesInside())) {
                vehicle.setCurrentWorkshop(null);
            }
            workshop.getVehiclesInside().clear();
        }

        // 2. Eliminar facturas asociadas a este taller
        List<org.tfg.backend.invoice.Invoice> invoices = invoiceRepository.findByWorkshopIdOrderByCreatedAtDesc(id);
        invoiceRepository.deleteAll(invoices);

        // 3. Eliminar tareas de taller
        List<org.tfg.backend.workshoptask.WorkshopTask> tasks = workshopTaskRepository.findByWorkshopId(id);
        workshopTaskRepository.deleteAll(tasks);

        // 4. Eliminar citas de taller (esto cascada-elimina las partes de citas debido a cascade = CascadeType.ALL en Appointment)
        List<org.tfg.backend.appointment.Appointment> appointments = appointmentRepository.findByWorkshopIdOrderByDateTimeAsc(id);
        appointmentRepository.deleteAll(appointments);

        // 5. Eliminar categorías del catálogo de tareas (esto cascada-elimina los CatalogTask debido a CascadeType.ALL)
        List<org.tfg.backend.taskcatalog.TaskCategory> categories = catalogCategoryRepository.findByWorkshopIdOrderByNameAsc(id);
        catalogCategoryRepository.deleteAll(categories);

        // 5.1. Eliminar inventario de repuestos del taller
        List<WorkshopInventory> inventory = workshopInventoryRepository.findByWorkshopId(id);
        workshopInventoryRepository.deleteAll(inventory);

        // 5.2. Eliminar categorías de repuestos del taller (esto cascada-elimina los repuestos asociados debido a CascadeType.ALL)
        List<PartCategory> partCategories = partCategoryRepository.findByWorkshopId(id);
        partCategoryRepository.deleteAll(partCategories);

        // 6. Desasociar el taller del dueño
        if (workshop.getOwner() != null) {
            Employee owner = workshop.getOwner();
            owner.setWorkshop(null);
            employeeRepository.save(owner);
            workshop.setOwner(null);
        }

        // 7. Desasociar a todos los empleados de este taller
        if (workshop.getEmployees() != null) {
            for (Employee employee : new ArrayList<>(workshop.getEmployees())) {
                employee.setWorkshop(null);
                employeeRepository.save(employee);
            }
            workshop.getEmployees().clear();
        }

        // 8. Eliminar el logo de S3 si existe
        if (workshop.getLogoPictureUrl() != null) {
            try {
                storageService.deleteFile(workshop.getLogoPictureUrl());
            } catch (Exception e) {
                // Silenciar error si el archivo ya no existe en S3
            }
        }

        // 9. Borrar el taller de la base de datos
        workshopRepository.delete(workshop);
    }

    /**
     * Recupera todos los talleres registrados y los convierte a DTO.
     */
    @Transactional(readOnly = true)
    public List<WorkshopDTO> getAllWorkshops() {
        return workshopRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkshopDTO> getWorkshopsByOwnerId(UUID ownerId) {
        return workshopRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WorkshopDTO> searchWorkshops(String query, int page, int size) {
        return workshopRepository.searchWorkshops(query, PageRequest.of(page, size))
                .map(this::mapToDTO);
    }

    /**
     * Obtiene la información de un taller específico por su UUID.
     */
    @Transactional(readOnly = true)
    public WorkshopDTO getWorkshopById(UUID id) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado con el ID: " + id));
        return mapToDTO(workshop);
    }

    @Transactional
    public WorkshopDTO updateWorkshopSettings(UUID workshopId, WorkshopRequest request) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // El dueño ahora puede cambiar la duración a 30, 45, 120 min, etc.
        java.time.LocalTime newOpen = request.getOpenTime() != null ? request.getOpenTime() : workshop.getOpenTime();
        java.time.LocalTime newClose = request.getCloseTime() != null ? request.getCloseTime() : workshop.getCloseTime();
        
        if (newOpen != null && newClose != null) {
            if (!newClose.isAfter(newOpen)) {
                throw new RuntimeException("La hora de cierre debe ser posterior a la hora de apertura.");
            }
        }
        
        if (request.getOpenTime() != null) workshop.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null) workshop.setCloseTime(request.getCloseTime());

        if (request.getSlotDurationMinutes() != null) {
            if (request.getSlotDurationMinutes() <= 0) {
                throw new RuntimeException("La duración de la cita debe ser mayor a 0 minutos.");
            }
            workshop.setSlotDurationMinutes(request.getSlotDurationMinutes());
        }
        if (request.getHourlyRate() != null) {
            if (request.getHourlyRate() < 0) {
                throw new RuntimeException("El precio de la mano de obra no puede ser negativo.");
            }
            workshop.setHourlyRate(request.getHourlyRate());
        }
        if (request.getAddress() != null) workshop.setAddress(request.getAddress());
        if (request.getWorkingDays() != null) workshop.setWorkingDays(request.getWorkingDays());
        if (request.getIncludeOwnerInPlanning() != null) workshop.setIncludeOwnerInPlanning(request.getIncludeOwnerInPlanning());

        return mapToDTO(workshopRepository.save(workshop));
    }

    /**
     * Método privado para transformar la entidad Workshop al objeto de transferencia WorkshopDTO.
     * Maneja la lógic7a de conteo de empleados y vehículos, así como la obtención del nombre del dueño.
     */
    private WorkshopDTO mapToDTO(Workshop workshop) {
        // Obtenemos el nombre completo del dueño navegando desde Employee -> User
        String ownerName = "Sin dueño";
        if (workshop.getOwner() != null && workshop.getOwner().getUser() != null) {
            ownerName = workshop.getOwner().getUser().getFirstname() + " " +
                    workshop.getOwner().getUser().getLastname();
        }

        return WorkshopDTO.builder()
                .id(workshop.getId())
                .cif(workshop.getCif())
                .companyName(workshop.getCompanyName())
                .address(workshop.getAddress())
                .ownerName(ownerName)
                .openTime(workshop.getOpenTime()) // Mapeo de hora apertura
                .closeTime(workshop.getCloseTime()) // Mapeo de hora cierre
                .slotDurationMinutes(workshop.getSlotDurationMinutes())
                .workingDays(workshop.getWorkingDays())
                .hourlyRate(workshop.getHourlyRate())
                .includeOwnerInPlanning(workshop.getIncludeOwnerInPlanning() != null ? workshop.getIncludeOwnerInPlanning() : false)
                .logoPictureUrl(storageService.generatePresignedUrl(workshop.getLogoPictureUrl()))
                // Calculamos el tamaño de las listas para las estadísticas del DTO
                .totalEmployees(workshop.getEmployees() != null ? workshop.getEmployees().size() : 0)
                .vehiclesCurrentCount(workshop.getVehiclesInside() != null ? workshop.getVehiclesInside().size() : 0)
                .build();
    }

    /**
     * Sube un logo para el taller a S3 y guarda la referencia en la BD.
     */
    @Transactional
    public WorkshopDTO uploadLogo(UUID workshopId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        if (workshop.getLogoPictureUrl() != null) {
            storageService.deleteFile(workshop.getLogoPictureUrl());
        }

        String fileUrl = storageService.uploadFile(file, "workshop-logos");
        workshop.setLogoPictureUrl(fileUrl);
        workshopRepository.save(workshop);

        return mapToDTO(workshop);
    }

    /**
     * Elimina el logo del taller de S3 y de la BD.
     */
    @Transactional
    public WorkshopDTO deleteLogo(UUID workshopId) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        if (workshop.getLogoPictureUrl() != null) {
            storageService.deleteFile(workshop.getLogoPictureUrl());
            workshop.setLogoPictureUrl(null);
            workshopRepository.save(workshop);
        }

        return mapToDTO(workshop);
    }
}
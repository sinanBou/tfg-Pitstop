package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * Registra un nuevo taller en el sistema.
     * Verifica que el CIF no esté duplicado y asigna un empleado como dueño.
     */
    @Transactional
    public WorkshopDTO saveWorkshop(WorkshopRequest request) {
        if (workshopRepository.existsByCif(request.getCif())) {
            throw new RuntimeException("Ya existe un taller registrado con el CIF: " + request.getCif());
        }

        Employee owner = employeeRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("No se encontró el empleado con ID: " + request.getOwnerId()));

        // Construcción de la entidad incluyendo los nuevos campos de tiempo
        Workshop workshop = Workshop.builder()
                .cif(request.getCif())
                .companyName(request.getCompanyName())
                .address(request.getAddress())
                .owner(owner)
                .openTime(request.getOpenTime()) // <-- NUEVO
                .closeTime(request.getCloseTime()) // <-- NUEVO
                .slotDurationMinutes(request.getSlotDurationMinutes() != null ? request.getSlotDurationMinutes() : 60) // <-- NUEVO
                .workingDays(request.getWorkingDays())
                .build();

        Workshop savedWorkshop = workshopRepository.save(workshop);
        owner.setWorkshop(savedWorkshop);
        employeeRepository.save(owner);
        return mapToDTO(savedWorkshop);
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
        if (request.getOpenTime() != null) workshop.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null) workshop.setCloseTime(request.getCloseTime());
        if (request.getSlotDurationMinutes() != null) {
            workshop.setSlotDurationMinutes(request.getSlotDurationMinutes());
        }
        if (request.getAddress() != null) workshop.setAddress(request.getAddress());
        if (request.getWorkingDays() != null) workshop.setWorkingDays(request.getWorkingDays());

        return mapToDTO(workshopRepository.save(workshop));
    }

    /**
     * Método privado para transformar la entidad Workshop al objeto de transferencia WorkshopDTO.
     * Maneja la lógica de conteo de empleados y vehículos, así como la obtención del nombre del dueño.
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
                // Calculamos el tamaño de las listas para las estadísticas del DTO
                .totalEmployees(workshop.getEmployees() != null ? workshop.getEmployees().size() : 0)
                .vehiclesCurrentCount(workshop.getVehiclesInside() != null ? workshop.getVehiclesInside().size() : 0)
                .build();
    }
}
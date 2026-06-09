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

/**
 * Servicio de negocio encargado de la lógica de creación, actualización y gestión de talleres.
 * Valida la unicidad del CIF, vincula propietarios, gestiona los horarios y tarifas,
 * inicializa el catálogo específico para cada taller y administra los archivos de logotipos
 * almacenados en S3.
 */
@Service
@RequiredArgsConstructor
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final EmployeeRepository employeeRepository;
    private final org.tfg.backend.taskcatalog.CatalogInitializationService catalogInitializationService;
    private final org.tfg.backend.storage.StorageService storageService;

    /**
     * Registra un nuevo taller en el sistema, validando que el CIF sea único y vinculando
     * al empleado propietario designado. Inicializa también el catálogo de tareas por defecto.
     *
     * @param request Datos de la solicitud para el nuevo taller.
     * @return El DTO del taller recién guardado.
     */
    @Transactional
    public WorkshopDTO saveWorkshop(WorkshopRequest request) {
        if (workshopRepository.existsByCif(request.getCif())) {
            throw new RuntimeException("Ya existe un taller registrado con el CIF: " + request.getCif());
        }

        Employee owner = employeeRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("No se encontró el empleado con ID: " + request.getOwnerId()));

        // Construcción de la entidad incluyendo los campos de tiempo
        Workshop workshop = Workshop.builder()
                .cif(request.getCif())
                .companyName(request.getCompanyName())
                .address(request.getAddress())
                .owner(owner)
                .openTime(request.getOpenTime())
                .closeTime(request.getCloseTime())
                .slotDurationMinutes(request.getSlotDurationMinutes() != null ? request.getSlotDurationMinutes() : 60)
                .workingDays(request.getWorkingDays())
                .hourlyRate(request.getHourlyRate() != null ? request.getHourlyRate() : 50.0)
                .includeOwnerInPlanning(request.getIncludeOwnerInPlanning() != null ? request.getIncludeOwnerInPlanning() : false)
                .build();

        Workshop savedWorkshop = workshopRepository.save(workshop);
        owner.setWorkshop(savedWorkshop);
        employeeRepository.save(owner);
        catalogInitializationService.initializeCatalogForWorkshop(savedWorkshop);
        return mapToDTO(savedWorkshop);
    }

    /**
     * Recupera la lista completa de todos los talleres en la base de datos.
     *
     * @return Lista de talleres mapeados a DTOs.
     */
    @Transactional(readOnly = true)
    public List<WorkshopDTO> getAllWorkshops() {
        return workshopRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Recupera todos los talleres pertenecientes a un propietario (empleado) específico.
     *
     * @param ownerId Identificador del empleado propietario.
     * @return Lista de talleres asociados a ese propietario.
     */
    @Transactional(readOnly = true)
    public List<WorkshopDTO> getWorkshopsByOwnerId(UUID ownerId) {
        return workshopRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca talleres de forma paginada a partir de un término de coincidencia.
     *
     * @param query Término o filtro de búsqueda.
     * @param page Número de página actual.
     * @param size Registros por página.
     * @return Página con los DTOs de talleres coincidentes.
     */
    @Transactional(readOnly = true)
    public Page<WorkshopDTO> searchWorkshops(String query, int page, int size) {
        return workshopRepository.searchWorkshops(query, PageRequest.of(page, size))
                .map(this::mapToDTO);
    }

    /**
     * Obtiene los detalles de un taller a partir de su identificador único.
     *
     * @param id Identificador único del taller.
     * @return El DTO del taller encontrado.
     */
    @Transactional(readOnly = true)
    public WorkshopDTO getWorkshopById(UUID id) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado con el ID: " + id));
        return mapToDTO(workshop);
    }

    /**
     * Actualiza la configuración operativa y física de un taller (horario, tarifa, dirección, etc.).
     *
     * @param workshopId Identificador único del taller.
     * @param request Parámetros nuevos del taller.
     * @return El DTO del taller modificado.
     */
    @Transactional
    public WorkshopDTO updateWorkshopSettings(UUID workshopId, WorkshopRequest request) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        if (request.getOpenTime() != null) workshop.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null) workshop.setCloseTime(request.getCloseTime());
        if (request.getSlotDurationMinutes() != null) {
            workshop.setSlotDurationMinutes(request.getSlotDurationMinutes());
        }
        if (request.getAddress() != null) workshop.setAddress(request.getAddress());
        if (request.getWorkingDays() != null) workshop.setWorkingDays(request.getWorkingDays());
        if (request.getHourlyRate() != null) workshop.setHourlyRate(request.getHourlyRate());
        if (request.getIncludeOwnerInPlanning() != null) workshop.setIncludeOwnerInPlanning(request.getIncludeOwnerInPlanning());

        return mapToDTO(workshopRepository.save(workshop));
    }

    /**
     * Transforma una entidad {@link Workshop} al objeto de transferencia {@link WorkshopDTO}.
     * Maneja la lógica de conteo de empleados y vehículos, así como la obtención del nombre del dueño.
     */
    private WorkshopDTO mapToDTO(Workshop workshop) {
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
                .openTime(workshop.getOpenTime())
                .closeTime(workshop.getCloseTime())
                .slotDurationMinutes(workshop.getSlotDurationMinutes())
                .workingDays(workshop.getWorkingDays())
                .hourlyRate(workshop.getHourlyRate())
                .includeOwnerInPlanning(workshop.getIncludeOwnerInPlanning() != null ? workshop.getIncludeOwnerInPlanning() : false)
                .logoPictureUrl(storageService.generatePresignedUrl(workshop.getLogoPictureUrl()))
                .totalEmployees(workshop.getEmployees() != null ? workshop.getEmployees().size() : 0)
                .vehiclesCurrentCount(workshop.getVehiclesInside() != null ? workshop.getVehiclesInside().size() : 0)
                .build();
    }

    /**
     * Sube y asocia una imagen de logotipo a un taller en el almacenamiento persistente en la nube (S3).
     *
     * @param workshopId Identificador único del taller.
     * @param file Archivo de imagen subido.
     * @return DTO del taller actualizado con la URL de la imagen.
     * @throws java.io.IOException Si ocurre un error al procesar el archivo.
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
     * Elimina el logotipo de un taller, borrando el archivo físico del storage y limpiando su referencia en BD.
     *
     * @param workshopId Identificador único del taller.
     * @return DTO del taller con la URL del logotipo a nulo.
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
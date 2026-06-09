package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio encargado de realizar consultas y lecturas del estado y catálogo de talleres.
 * Todas sus operaciones son de solo lectura para optimizar el rendimiento de la aplicación.
 */
@Service
@RequiredArgsConstructor
public class WorkshopLookupService {

    private final WorkshopRepository workshopRepository;
    private final WorkshopMapper workshopMapper;

    /**
     * Recupera la lista completa de todos los talleres en la base de datos.
     *
     * @return Lista de talleres mapeados a DTOs.
     */
    @Transactional(readOnly = true)
    public List<WorkshopDTO> getAllWorkshops() {
        return workshopRepository.findAll()
                .stream()
                .map(workshopMapper::mapToDTO)
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
                .map(workshopMapper::mapToDTO)
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
                .map(workshopMapper::mapToDTO);
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
        return workshopMapper.mapToDTO(workshop);
    }
}

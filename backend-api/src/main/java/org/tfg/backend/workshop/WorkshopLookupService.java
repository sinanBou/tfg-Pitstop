package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkshopLookupService {

    private final WorkshopRepository workshopRepository;
    private final WorkshopMapper workshopMapper;

    @Transactional(readOnly = true)
    public List<WorkshopDTO> getAllWorkshops() {
        return workshopRepository.findAll()
                .stream()
                .map(workshopMapper::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkshopDTO> getWorkshopsByOwnerId(UUID ownerId) {
        return workshopRepository.findByOwnerId(ownerId)
                .stream()
                .map(workshopMapper::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WorkshopDTO> searchWorkshops(String query, int page, int size) {
        return workshopRepository.searchWorkshops(query, PageRequest.of(page, size))
                .map(workshopMapper::mapToDTO);
    }

    @Transactional(readOnly = true)
    public WorkshopDTO getWorkshopById(UUID id) {
        Workshop workshop = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado con el ID: " + id));
        return workshopMapper.mapToDTO(workshop);
    }
}

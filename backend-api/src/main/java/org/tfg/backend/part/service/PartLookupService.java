package org.tfg.backend.part.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.part.*;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartLookupService {

    private final PartCatalogRepository partCatalogRepository;
    private final WorkshopInventoryRepository workshopInventoryRepository;
    private final AppointmentPartRepository appointmentPartRepository;
    private final PartCategoryRepository partCategoryRepository;

    @Transactional(readOnly = true)
    public List<PartCatalog> getAllCatalog() {
        return partCatalogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<WorkshopInventory> getInventoryByWorkshop(UUID workshopId) {
        return workshopInventoryRepository.findByWorkshopId(workshopId);
    }

    @Transactional(readOnly = true)
    public List<AppointmentPart> getPartsByAppointment(UUID appointmentId) {
        return appointmentPartRepository.findByAppointmentId(appointmentId);
    }

    @Transactional(readOnly = true)
    public List<PartCategory> getCategoriesByWorkshop(UUID workshopId) {
        return partCategoryRepository.findByWorkshopIdOrderByNameAsc(workshopId);
    }
}

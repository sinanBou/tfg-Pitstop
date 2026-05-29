package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.storage.StorageService;
import org.tfg.backend.taskcatalog.CatalogInitializationService;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkshopAdminService {

    private final WorkshopRepository workshopRepository;
    private final EmployeeRepository employeeRepository;
    private final CatalogInitializationService catalogInitializationService;
    private final StorageService storageService;
    private final WorkshopMapper workshopMapper;

    @Transactional
    public WorkshopDTO saveWorkshop(WorkshopRequest request) {
        if (workshopRepository.existsByCif(request.getCif())) {
            throw new RuntimeException("Ya existe un taller registrado con el CIF: " + request.getCif());
        }

        Employee owner = employeeRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("No se encontró el empleado con ID: " + request.getOwnerId()));

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
        return workshopMapper.mapToDTO(savedWorkshop);
    }

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

        return workshopMapper.mapToDTO(workshopRepository.save(workshop));
    }

    @Transactional
    public WorkshopDTO uploadLogo(UUID workshopId, MultipartFile file) throws IOException {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        if (workshop.getLogoPictureUrl() != null) {
            storageService.deleteFile(workshop.getLogoPictureUrl());
        }

        String fileUrl = storageService.uploadFile(file, "workshop-logos");
        workshop.setLogoPictureUrl(fileUrl);
        workshopRepository.save(workshop);

        return workshopMapper.mapToDTO(workshop);
    }

    @Transactional
    public WorkshopDTO deleteLogo(UUID workshopId) {
        Workshop workshop = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        if (workshop.getLogoPictureUrl() != null) {
            storageService.deleteFile(workshop.getLogoPictureUrl());
            workshop.setLogoPictureUrl(null);
            workshopRepository.save(workshop);
        }

        return workshopMapper.mapToDTO(workshop);
    }
}

package org.tfg.backend.workshop;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.storage.StorageService;

@Component
@RequiredArgsConstructor
public class WorkshopMapper {

    private final StorageService storageService;

    /**
    * Mapea una entidad {@link Workshop} a su DTO correspondiente.
    *
    * @param workshop Entidad del taller.
    * @return DTO con los detalles estructurados del taller.
    */
    public WorkshopDTO mapToDTO(Workshop workshop) {
        if (workshop == null) return null;

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
}
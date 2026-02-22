package org.tfg.backend.workshop;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class WorkshopDTO {
    private UUID id;
    private String cif;
    private String companyName;
    private String ownerName;
    private Integer totalEmployees;
    private Integer vehiclesCurrentCount;
}
package org.tfg.backend.vehicle;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class VehicleSearchDTO {
    private UUID id;
    private String brand;
    private String model;
    private String licensePlate;
    private UUID clientId;
}

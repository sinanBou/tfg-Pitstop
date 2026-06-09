package org.tfg.backend.vehicle;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

/**
 * DTO simplificado para la búsqueda rápida de vehículos en el panel de administración
 * y gerencia del taller (generalmente por matrícula).
 */
@Data
@Builder
public class VehicleSearchDTO {
    private UUID id;
    private String brand;
    private String model;
    private String licensePlate;
    private UUID clientId;
}

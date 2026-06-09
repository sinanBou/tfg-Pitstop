package org.tfg.backend.vehicle;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

/**
 * Data Transfer Object (DTO) simplificado para la búsqueda rápida de vehículos,
 * enfocado en identificar el ID del vehículo, marca, modelo, matrícula y el ID de su propietario.
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

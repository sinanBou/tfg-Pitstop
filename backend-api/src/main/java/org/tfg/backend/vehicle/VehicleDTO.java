package org.tfg.backend.vehicle;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) que contiene la información completa de un Vehículo,
 * incluyendo su estado y el nombre del taller donde está siendo atendido si aplica.
 */
@Data
@Builder
public class VehicleDTO {
    private UUID id;
    private String brand;
    private String model;
    private String licensePlate;
    private String vin;
    private Integer year;
    private String color;
    private String status; // "EN_CASA", "EN_TALLER", "LISTO"
    private String workshopName;
}
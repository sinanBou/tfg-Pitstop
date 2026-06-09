package org.tfg.backend.vehicle;

import lombok.Data;

/**
 * Petición con los campos necesarios para dar de alta o actualizar un vehículo.
 */
@Data
public class VehicleRequest {
    private String brand;
    private String model;
    private String licensePlate;
    private String vin;
    private Integer year;
    private String color;
}
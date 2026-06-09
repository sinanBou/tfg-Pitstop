package org.tfg.backend.vehicle;

import lombok.Data;

/**
 * Objeto de petición para el registro o actualización de los datos de un vehículo.
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
package org.tfg.backend.vehicle;

import lombok.Data;

@Data
public class VehicleRequest {
    private String brand;
    private String model;
    private String licensePlate;
    private String vin;
    private Integer year;
    private String color;
}
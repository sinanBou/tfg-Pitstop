package org.tfg.backend.vehicle;

import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public VehicleDTO mapToDTO(Vehicle vehicle) {
        if (vehicle == null) return null;
        return VehicleDTO.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .year(vehicle.getYear())
                .vin(vehicle.getVin())
                .status(vehicle.getStatus())
                .workshopName(vehicle.getCurrentWorkshop() != null ?
                        vehicle.getCurrentWorkshop().getCompanyName() : null)
                .build();
    }

    public VehicleSearchDTO mapToSearchDTO(Vehicle vehicle) {
        if (vehicle == null) return null;
        return VehicleSearchDTO.builder()
                .id(vehicle.getId())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .licensePlate(vehicle.getLicensePlate())
                .clientId(vehicle.getClient().getId())
                .build();
    }
}

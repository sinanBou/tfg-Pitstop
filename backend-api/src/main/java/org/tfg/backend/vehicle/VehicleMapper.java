package org.tfg.backend.vehicle;

import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    /**
    * Mapea una entidad {@link Vehicle} a su correspondiente DTO extendido {@link VehicleDTO}.
    *
    * @param vehicle Entidad del vehículo a mapear. Puede ser nula.
    * @return DTO detallado resultante, o null si la entidad es nula.
    */
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

    /**
    * Mapea un vehículo en su versión reducida {@link VehicleSearchDTO} para búsquedas rápidas.
    *
    * @param vehicle Entidad del vehículo a mapear. Puede ser nula.
    * @return DTO simplificado, o null si la entidad es nula.
    */
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
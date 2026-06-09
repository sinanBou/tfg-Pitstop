package org.tfg.backend.vehicle;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.client.Client;
import org.tfg.backend.workshop.Workshop;

import java.util.UUID;

/**
 * Entidad de persistencia que representa a un Vehículo en la base de datos de PitStop.
 * Almacena los datos del coche (marca, modelo, matrícula, año, VIN), su estado operativo
 * en el taller ("status") y sus relaciones con el cliente y el taller actual.
 */
@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Generación automática de UUID
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String brand; // Marca (ej: BMW)

    @Column(nullable = false)
    private String model; // Modelo (ej: Serie 3)

    @Column(unique = true, nullable = false)
    private String licensePlate;

    private Integer year; // Año de fabricación

    @Column(nullable = false)
    private String status;


    @Column(unique = true, nullable = true)
    private String vin;
    @PrePersist
    @PreUpdate
    private void prepareVin() {
        if (this.vin != null && this.vin.isBlank()) {
            this.vin = null;
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_workshop_id")
    private Workshop currentWorkshop;

}
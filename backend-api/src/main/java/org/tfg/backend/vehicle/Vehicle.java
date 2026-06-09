package org.tfg.backend.vehicle;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.client.Client;
import org.tfg.backend.workshop.Workshop;

import java.util.UUID;

/**
 * Entidad de persistencia que representa a un vehículo registrado en el sistema.
 * Contiene información de marca, modelo, matrícula, año, número de bastidor (VIN) y estado actual.
 * Se asocia a un cliente único (propietario) y opcionalmente a un taller si se encuentra en servicio.
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

    /** Estado del vehículo. Valores comunes: "EN_CASA", "EN_TALLER", "LISTO". */
    @Column(nullable = false)
    private String status;

    /** Número de Identificación del Vehículo (VIN) o bastidor. */
    @Column(unique = true, nullable = true)
    private String vin;

    @PrePersist
    @PreUpdate
    private void prepareVin() {
        if (this.vin != null && this.vin.isBlank()) {
            this.vin = null;
        }
    }

    /** Cliente propietario del vehículo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    /** Taller actual donde se encuentra ingresado el vehículo, si aplica. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_workshop_id")
    private Workshop currentWorkshop;
}
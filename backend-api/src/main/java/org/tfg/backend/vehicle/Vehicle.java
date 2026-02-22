package org.tfg.backend.vehicle;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.client.Client;
import org.tfg.backend.workshop.Workshop;

@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand; // Marca (ej: BMW)

    @Column(nullable = false)
    private String model; // Modelo (ej: Serie 3)

    @Column(unique = true, nullable = false)
    private String licensePlate;

    private Integer year; // Año de fabricación

    @Column(nullable = false)
    private String status;


    @Column(unique = true)
    private String vin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_workshop_id")
    private Workshop currentWorkshop;

}
package org.tfg.backend.employee;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.user.User;
import org.tfg.backend.workshop.Workshop;
import java.util.UUID;

/**
 * Entidad que representa a un empleado en el sistema de Pitstop.
 * Puede corresponder a un mecánico, gestor o al propietario del taller.
 * Vincula al empleado con su usuario de acceso, el taller al que pertenece,
 * secciones permitidas en el sistema y sus datos personales (NIF, teléfono, dirección).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Workshop workshop;

    @Column(name = "allowed_sections")
    private String allowedSections;

    // Datos personales del empleado/dueño (mismos campos que Client)
    @Column(name = "nif")
    private String nif;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;
}
package org.tfg.backend.employee;

import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.user.User;
import org.tfg.backend.workshop.Workshop;
import java.util.UUID;

/**
 * Entidad de persistencia que representa a un empleado (mecánico, gerente o dueño) en Pitstop.
 * Mantiene la relación con su cuenta de usuario y el taller en el que trabaja, así como sus datos personales.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employee")
public class Employee {

    /**
     * Identificador único del empleado.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Cuenta de usuario y credenciales vinculadas al empleado.
     */
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User user;

    /**
     * Taller al cual pertenece o en el cual está contratado el empleado.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Workshop workshop;

    /**
     * Secciones o módulos de la aplicación a los que el empleado tiene permitido el acceso.
     */
    @Column(name = "allowed_sections")
    private String allowedSections;

    /**
     * Número de Identificación Fiscal (NIF) del empleado.
     */
    @Column(name = "nif")
    private String nif;

    /**
     * Teléfono móvil o fijo de contacto del empleado.
     */
    @Column(name = "phone_number")
    private String phoneNumber;

    /**
     * Dirección postal o residencial del empleado.
     */
    @Column(name = "address")
    private String address;
}
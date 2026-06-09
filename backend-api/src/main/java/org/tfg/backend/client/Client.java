package org.tfg.backend.client;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.vehicle.Vehicle;
import org.tfg.backend.user.User;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad de persistencia que representa a un cliente registrado en Pitstop.
 * Contiene información de contacto y fiscal, y mantiene la relación biunívoca con su cuenta de usuario y vehículos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "client")
public class Client {

    /**
     * Identificador único del cliente.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Usuario propietario de la cuenta y credenciales asociadas a este cliente.
     */
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonBackReference
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User user;

    /**
     * Número de Identificación Fiscal (NIF/DNI/NIE) del cliente. Debe ser único.
     */
    @Column(unique = true)
    private String nif;

    /**
     * Teléfono móvil o fijo de contacto del cliente.
     */
    private String phoneNumber;

    /**
     * Dirección de residencia o postal del cliente.
     */
    private String address;

    /**
     * Listado de vehículos propiedad del cliente registrados en Pitstop.
     */
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<Vehicle> vehicles = new ArrayList<>();
}
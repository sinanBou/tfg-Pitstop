package org.tfg.backend.part;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una categoría lógica de repuestos (ej: Frenos, Motor, Filtros) en un taller específico.
 */
@Entity
@Table(name = "part_categories", uniqueConstraints = {@UniqueConstraint(columnNames = {"workshop_id", "name"})})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"parts", "workshop"})
public class PartCategory {

    /**
     * Identificador único de la categoría.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Nombre interno y simplificado de la categoría.
     */
    @Column(nullable = false)
    private String name;

    /**
     * Nombre descriptivo y público a mostrar en la interfaz de usuario.
     */
    @Column(name = "display_name", nullable = false)
    private String displayName;

    /**
     * Taller al que pertenece esta categoría de repuestos.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private org.tfg.backend.workshop.Workshop workshop;

    /**
     * Lista de repuestos pertenecientes a esta categoría en el catálogo.
     */
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("category")
    @Builder.Default
    private List<PartCatalog> parts = new ArrayList<>();
}

package org.tfg.backend.part;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una categoría o clasificación lógica de repuestos (por ejemplo: Frenos, Filtros, Motor).
 * Agrupa diferentes artículos del catálogo general.
 */
@Entity
@Table(name = "part_categories")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "parts")
public class PartCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("category")
    @Builder.Default
    private List<PartCatalog> parts = new ArrayList<>();
}

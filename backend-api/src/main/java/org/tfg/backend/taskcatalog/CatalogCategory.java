package org.tfg.backend.taskcatalog;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.workshop.Workshop;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una categoría dentro del catálogo de tareas de un taller
 * (por ejemplo: "Sistema Eléctrico", "Neumáticos y Ruedas").
 * Agrupa las distintas tareas estandarizadas de reparación.
 */
@Entity
@Table(name = "catalog_categories")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"workshop", "tasks"})
public class CatalogCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Clave única o identificador técnico de la categoría (ej: "6_sistema_electrico").
     */
    @Column(nullable = false)
    private String name;

    /**
     * Nombre descriptivo de la categoría visible para el usuario (ej: "Sistema Eléctrico").
     */
    @Column(name = "display_name", nullable = false)
    private String displayName;

    /**
     * Taller al que pertenece este catálogo de categorías.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Workshop workshop;

    /**
     * Listado de tareas estandarizadas clasificadas bajo esta categoría.
     */
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<CatalogTask> tasks = new ArrayList<>();
}

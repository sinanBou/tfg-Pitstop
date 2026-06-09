package org.tfg.backend.taskcatalog;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.tfg.backend.workshop.Workshop;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad de persistencia que representa una Categoría de Tareas (como revisiones, frenos, motor, etc.)
 * dentro del catálogo de servicios de un taller mecánico específico.
 */
@Entity
@Table(name = "task_categories")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"workshop", "tasks"})
public class TaskCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Workshop workshop;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<CatalogTask> tasks = new ArrayList<>();
}

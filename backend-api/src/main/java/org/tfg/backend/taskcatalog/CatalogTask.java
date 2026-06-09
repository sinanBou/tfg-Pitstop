package org.tfg.backend.taskcatalog;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entidad de persistencia que representa una tarea de reparación estandarizada en el catálogo.
 * Define la descripción del trabajo y los tiempos estimados de realización (horas)
 * parametrizados según el tipo de intervención (general, 4 cilindros, cilindros extra o ruedas).
 */
@Entity
@Table(name = "catalog_tasks")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "category")
public class CatalogTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Código identificador único de la tarea (ej: "6.1" para cambio de alternador).
     */
    @Column(nullable = false)
    private String code;

    /**
     * Nombre detallado o descripción de la actividad de reparación.
     */
    @Column(nullable = false, length = 1024)
    private String name;

    /**
     * Duración en horas asignada por defecto a la tarea.
     */
    private Double hours;

    /**
     * Duración en horas estimada específicamente para motores de 4 cilindros.
     */
    @Column(name = "hours_4_cil")
    private Double hours4Cil;

    /**
     * Incremento de horas estimado por cada cilindro extra.
     */
    @Column(name = "hours_cil_extra")
    private Double hoursCilExtra;

    /**
     * Horas estimadas para la reparación por unidad de rueda intervenida.
     */
    @Column(name = "hours_1_rueda")
    private Double hours1Rueda;

    /**
     * Categoría clasificatoria a la que se vincula esta tarea de catálogo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private CatalogCategory category;
}

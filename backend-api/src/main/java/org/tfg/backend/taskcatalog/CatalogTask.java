package org.tfg.backend.taskcatalog;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

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

    @Column(nullable = false)
    private String code;

    @Column(nullable = false, length = 1024)
    private String name;

    private Double hours;

    @Column(name = "hours_4_cil")
    private Double hours4Cil;

    @Column(name = "hours_cil_extra")
    private Double hoursCilExtra;

    @Column(name = "hours_1_rueda")
    private Double hours1Rueda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private TaskCategory category;
}

package org.tfg.backend.part;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "part_categories", uniqueConstraints = {@UniqueConstraint(columnNames = {"workshop_id", "name"})})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"parts", "workshop"})
public class PartCategory {

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
    private org.tfg.backend.workshop.Workshop workshop;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("category")
    @Builder.Default
    private List<PartCatalog> parts = new ArrayList<>();
}

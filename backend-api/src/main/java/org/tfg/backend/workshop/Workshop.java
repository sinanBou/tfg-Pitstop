package org.tfg.backend.workshop;// En src/main/java/org/tfg/backend/workshop/Workshop.java

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.vehicle.Vehicle;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "workshop")
public class Workshop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String cif;

    private String companyName;

    @OneToOne
    @JoinColumn(name = "owner_id")
    private Employee owner;


    @OneToMany(mappedBy = "workshop", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Employee> employees = new ArrayList<>();

    @OneToMany(mappedBy = "currentWorkshop", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Vehicle> vehiclesInside = new ArrayList<>();


    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column(name = "slot_duration_minutes")
    private Integer slotDurationMinutes = 60;
}
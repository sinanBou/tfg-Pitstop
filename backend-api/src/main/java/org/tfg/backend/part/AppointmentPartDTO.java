package org.tfg.backend.part;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentPartDTO {
    private UUID id;
    private UUID partId;
    private String name;
    private Integer quantityUsed;
    private Double appliedPrice;
}

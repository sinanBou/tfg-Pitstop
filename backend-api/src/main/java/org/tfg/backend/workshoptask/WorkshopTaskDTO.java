package org.tfg.backend.workshoptask;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkshopTaskDTO {
    private UUID id;
    private LocalDateTime dateTime;
    private String description;
    private String serviceType;
    private WorkshopTaskStatus status;
    private Integer estimatedDuration;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    
    private UUID vehicleId;
    private String vehicleDisplay;
    
    private UUID workshopId;
    private String workshopName;
    
    private UUID assignedEmployeeId;
    private String assignedEmployeeName;
    
    private String clientFullName;
    
    private UUID originAppointmentId;
    private Boolean vehicleReceived;

    private String completedTasks;

    private String mechanicComments;

    /** Explicit flag: when true, the assignedEmployeeId value is applied (even if null = unassign) */
    private Boolean reassignEmployee;

    // Helper for frontend logic
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Boolean isTask = true;
}

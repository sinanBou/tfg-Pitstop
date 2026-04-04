package org.tfg.backend.appointment;

import lombok.Data;
import java.util.UUID;

@Data
public class AppointmentManagementRequest {
    private String serviceType;
    private String mechanicComments;
    private String status;
    private String completedTasks;
    private String taskAssignments;
    private Integer calculatedMinutes;
}

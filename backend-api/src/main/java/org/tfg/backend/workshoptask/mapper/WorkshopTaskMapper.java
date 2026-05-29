package org.tfg.backend.workshoptask.mapper;

import org.springframework.stereotype.Component;
import org.tfg.backend.workshoptask.WorkshopTask;
import org.tfg.backend.workshoptask.WorkshopTaskDTO;

@Component
public class WorkshopTaskMapper {

    public WorkshopTaskDTO convertToDTO(WorkshopTask task) {
        if (task == null) return null;

        return WorkshopTaskDTO.builder()
                .id(task.getId())
                .dateTime(task.getDateTime())
                .description(task.getDescription())
                .serviceType(task.getServiceType())
                .status(task.getStatus())
                .estimatedDuration(task.getEstimatedDuration())
                .actualStartTime(task.getActualStartTime())
                .actualEndTime(task.getActualEndTime())
                .vehicleId(task.getVehicle() != null ? task.getVehicle().getId() : null)
                .vehicleDisplay(task.getVehicle() != null ? task.getVehicle().getBrand() + " " + task.getVehicle().getModel() + " (" + task.getVehicle().getLicensePlate() + ")" : "N/A")
                .workshopId(task.getWorkshop() != null ? task.getWorkshop().getId() : null)
                .workshopName(task.getWorkshop() != null ? task.getWorkshop().getCompanyName() : "N/A")
                .assignedEmployeeId(task.getAssignedEmployee() != null ? task.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(task.getAssignedEmployee() != null && task.getAssignedEmployee().getUser() != null ? task.getAssignedEmployee().getUser().getFirstname() + " " + task.getAssignedEmployee().getUser().getLastname() : null)
                .clientFullName(task.getOriginAppointment() != null && task.getOriginAppointment().getClient() != null && task.getOriginAppointment().getClient().getUser() != null ? task.getOriginAppointment().getClient().getUser().getFirstname() + " " + task.getOriginAppointment().getClient().getUser().getLastname() : "N/A")
                .originAppointmentId(task.getOriginAppointment() != null ? task.getOriginAppointment().getId() : null)
                .vehicleReceived(task.getOriginAppointment() != null ? (task.getOriginAppointment().getVehicleReceived() != null ? task.getOriginAppointment().getVehicleReceived() : false) : true)
                .completedTasks(task.getCompletedTasks())
                .mechanicComments(task.getOriginAppointment() != null ? task.getOriginAppointment().getMechanicComments() : null)
                .isTask(true)
                .build();
    }
}

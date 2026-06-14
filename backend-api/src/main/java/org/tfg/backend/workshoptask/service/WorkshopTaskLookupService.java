package org.tfg.backend.workshoptask.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.workshoptask.*;
import org.tfg.backend.workshoptask.mapper.WorkshopTaskMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkshopTaskLookupService {

    private final WorkshopTaskRepository taskRepository;
    private final WorkshopTaskMapper taskMapper;

    @Transactional(readOnly = true)
    public List<WorkshopTaskDTO> getTasksByWorkshopAndDate(UUID workshopId, LocalDateTime start, LocalDateTime end) {
        List<WorkshopTask> list = new ArrayList<>(taskRepository.findByWorkshopIdAndDateTimeBetween(workshopId, start, end));
        List<WorkshopTask> allTasks = taskRepository.findByWorkshopId(workshopId);

        Set<UUID> existingIds = list.stream().map(WorkshopTask::getId).collect(Collectors.toSet());

        for (WorkshopTask t : allTasks) {
            if (t.getAssignedEmployee() == null &&
                    t.getStatus() != WorkshopTaskStatus.COMPLETED &&
                    t.getStatus() != WorkshopTaskStatus.CANCELLED) {
                if (!existingIds.contains(t.getId())) {
                    list.add(t);
                    existingIds.add(t.getId());
                }
            }
        }

        return list.stream()
                .map(taskMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkshopTaskDTO> getTasksByEmployeeAndDate(UUID employeeId, LocalDateTime start, LocalDateTime end) {
        return taskRepository.findByAssignedEmployeeIdAndDateTimeBetween(employeeId, start, end)
                .stream()
                .map(taskMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkshopTaskDTO> getDelayedTasksByWorkshop(UUID workshopId) {
        return taskRepository.findByWorkshopIdAndStatus(workshopId, WorkshopTaskStatus.DELAYED)
                .stream()
                .map(taskMapper::convertToDTO)
                .collect(Collectors.toList());
    }
}

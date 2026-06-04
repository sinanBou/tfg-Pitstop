package org.tfg.backend.taskcatalog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.taskcatalog.TaskCategory;
import org.tfg.backend.taskcatalog.TaskCategoryRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogLookupService {

    private final TaskCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<TaskCategory> getCatalog(UUID workshopId) {
        return categoryRepository.findByWorkshopIdOrderByNameAsc(workshopId);
    }
}

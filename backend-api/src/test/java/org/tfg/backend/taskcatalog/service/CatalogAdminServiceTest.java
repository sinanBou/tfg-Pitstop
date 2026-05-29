package org.tfg.backend.taskcatalog.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.taskcatalog.*;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogAdminServiceTest {

    @Mock
    private CatalogCategoryRepository categoryRepository;

    @Mock
    private CatalogTaskRepository taskRepository;

    @Mock
    private WorkshopRepository workshopRepository;

    @InjectMocks
    private CatalogAdminService catalogAdminService;

    private Workshop mockWorkshop;
    private CatalogCategory mockCategory;
    private CatalogTask mockTask;

    @BeforeEach
    void setUp() {
        mockWorkshop = Workshop.builder()
                .id(UUID.randomUUID())
                .companyName("PitStop Taller")
                .build();

        mockCategory = CatalogCategory.builder()
                .id(UUID.randomUUID())
                .workshop(mockWorkshop)
                .name("1_consumibles")
                .displayName("Consumibles")
                .tasks(new ArrayList<>())
                .build();

        mockTask = CatalogTask.builder()
                .id(UUID.randomUUID())
                .category(mockCategory)
                .code("1.1")
                .name("Cambio de aceite")
                .hours(0.5)
                .build();
    }

    @Test
    void createCategory_ShouldGenerateUniqueNameAndSave() {
        UUID workshopId = mockWorkshop.getId();
        when(workshopRepository.findById(workshopId)).thenReturn(Optional.of(mockWorkshop));
        when(categoryRepository.existsByWorkshopIdAndName(workshopId, "consumibles")).thenReturn(false);
        when(categoryRepository.save(any(CatalogCategory.class))).thenReturn(mockCategory);

        CatalogCategory result = catalogAdminService.createCategory(workshopId, "Consumibles");

        assertNotNull(result);
        verify(categoryRepository, times(1)).save(any(CatalogCategory.class));
    }

    @Test
    void createTask_ShouldAutoGenerateCodeAndSave() {
        UUID workshopId = mockWorkshop.getId();
        UUID categoryId = mockCategory.getId();

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(taskRepository.save(any(CatalogTask.class))).thenReturn(mockTask);

        CatalogTask taskDto = CatalogTask.builder()
                .name("Cambio de aceite")
                .hours(0.5)
                .build();

        CatalogTask result = catalogAdminService.createTask(workshopId, categoryId, taskDto);

        assertNotNull(result);
        verify(taskRepository, times(1)).save(any(CatalogTask.class));
    }

    @Test
    void createTask_ShouldThrowExceptionWhenWorkshopMismatch() {
        UUID categoryId = mockCategory.getId();
        UUID wrongWorkshopId = UUID.randomUUID();

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));

        CatalogTask taskDto = CatalogTask.builder().name("Oil change").build();

        assertThrows(RuntimeException.class, () -> catalogAdminService.createTask(wrongWorkshopId, categoryId, taskDto));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_ShouldModifyTaskDetails() {
        UUID taskId = mockTask.getId();
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(mockTask)).thenReturn(mockTask);

        CatalogTask taskDto = CatalogTask.builder()
                .name("Cambio de aceite Pro")
                .hours(0.8)
                .build();

        CatalogTask result = catalogAdminService.updateTask(taskId, taskDto);

        assertNotNull(result);
        assertEquals("Cambio de aceite Pro", mockTask.getName());
        assertEquals(0.8, mockTask.getHours());
        verify(taskRepository, times(1)).save(mockTask);
    }

    @Test
    void deleteTask_ShouldDeleteFromRepo() {
        UUID taskId = mockTask.getId();
        when(taskRepository.existsById(taskId)).thenReturn(true);

        catalogAdminService.deleteTask(taskId);

        verify(taskRepository, times(1)).deleteById(taskId);
    }

    @Test
    void deleteTask_ShouldThrowExceptionWhenNotFound() {
        UUID taskId = UUID.randomUUID();
        when(taskRepository.existsById(taskId)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> catalogAdminService.deleteTask(taskId));
        verify(taskRepository, never()).deleteById(any());
    }
}

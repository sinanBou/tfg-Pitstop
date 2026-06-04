package org.tfg.backend.taskcatalog.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.taskcatalog.TaskCategory;
import org.tfg.backend.taskcatalog.TaskCategoryRepository;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogLookupServiceTest {

    @Mock
    private TaskCategoryRepository categoryRepository;

    @InjectMocks
    private CatalogLookupService catalogLookupService;

    private TaskCategory mockCategory;

    @BeforeEach
    void setUp() {
        mockCategory = TaskCategory.builder()
                .id(UUID.randomUUID())
                .name("1_consumibles")
                .displayName("Consumibles")
                .build();
    }

    @Test
    void getCatalog_ShouldReturnListOrderedByName() {
        UUID workshopId = UUID.randomUUID();
        when(categoryRepository.findByWorkshopIdOrderByNameAsc(workshopId)).thenReturn(List.of(mockCategory));

        List<TaskCategory> result = catalogLookupService.getCatalog(workshopId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Consumibles", result.get(0).getDisplayName());
        verify(categoryRepository, times(1)).findByWorkshopIdOrderByNameAsc(workshopId);
    }
}

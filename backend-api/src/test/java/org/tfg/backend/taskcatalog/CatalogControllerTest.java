package org.tfg.backend.taskcatalog;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.tfg.backend.taskcatalog.service.CatalogAdminService;
import org.tfg.backend.taskcatalog.service.CatalogLookupService;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CatalogControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CatalogAdminService catalogAdminService;

    @Mock
    private CatalogLookupService catalogLookupService;

    @InjectMocks
    private CatalogController catalogController;

    private CatalogCategory mockCategory;
    private CatalogTask mockTask;

    @BeforeEach
    void setUp() {
        mockCategory = CatalogCategory.builder()
                .id(UUID.randomUUID())
                .name("1_consumibles")
                .displayName("Consumibles")
                .build();

        mockTask = CatalogTask.builder()
                .id(UUID.randomUUID())
                .code("1.1")
                .name("Cambio de aceite")
                .hours(0.5)
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(catalogController).build();
    }

    @Test
    void getCatalog_ShouldReturnList() throws Exception {
        UUID workshopId = UUID.randomUUID();
        when(catalogLookupService.getCatalog(workshopId)).thenReturn(List.of(mockCategory));

        mockMvc.perform(get("/api/catalog/workshop/{workshopId}", workshopId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].displayName", is("Consumibles")));

        verify(catalogLookupService, times(1)).getCatalog(workshopId);
    }

    @Test
    void createCategory_ShouldReturnCreated() throws Exception {
        UUID workshopId = UUID.randomUUID();
        when(catalogAdminService.createCategory(workshopId, "Consumibles")).thenReturn(mockCategory);

        String payload = "{\"displayName\":\"Consumibles\"}";

        mockMvc.perform(post("/api/catalog/workshop/{workshopId}/categories", workshopId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName", is("Consumibles")));

        verify(catalogAdminService, times(1)).createCategory(workshopId, "Consumibles");
    }

    @Test
    void createTask_ShouldReturnTask() throws Exception {
        UUID workshopId = UUID.randomUUID();
        UUID categoryId = mockCategory.getId();
        when(catalogAdminService.createTask(eq(workshopId), eq(categoryId), any(CatalogTask.class))).thenReturn(mockTask);

        String payload = "{\"name\":\"Cambio de aceite\",\"hours\":0.5}";

        mockMvc.perform(post("/api/catalog/workshop/{workshopId}/categories/{categoryId}/tasks", workshopId, categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Cambio de aceite")));

        verify(catalogAdminService, times(1)).createTask(eq(workshopId), eq(categoryId), any(CatalogTask.class));
    }

    @Test
    void updateTask_ShouldReturnUpdatedTask() throws Exception {
        UUID taskId = mockTask.getId();
        when(catalogAdminService.updateTask(eq(taskId), any(CatalogTask.class))).thenReturn(mockTask);

        String payload = "{\"name\":\"Cambio de aceite Pro\",\"hours\":0.8}";

        mockMvc.perform(put("/api/catalog/tasks/{taskId}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Cambio de aceite"))); // returns mockTask

        verify(catalogAdminService, times(1)).updateTask(eq(taskId), any(CatalogTask.class));
    }

    @Test
    void deleteTask_ShouldReturnOk() throws Exception {
        UUID taskId = mockTask.getId();

        mockMvc.perform(delete("/api/catalog/tasks/{taskId}", taskId))
                .andExpect(status().isOk());

        verify(catalogAdminService, times(1)).deleteTask(taskId);
    }
}

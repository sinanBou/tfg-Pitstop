package org.tfg.backend.part;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.tfg.backend.part.service.PartAdminService;
import org.tfg.backend.part.service.PartAssignmentService;
import org.tfg.backend.part.service.PartLookupService;

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
class PartControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PartAdminService partAdminService;

    @Mock
    private PartLookupService partLookupService;

    @Mock
    private PartAssignmentService partAssignmentService;

    @Mock
    private PartInventoryFacade partInventoryFacade;

    @InjectMocks
    private PartController partController;

    private PartCatalog mockPart;
    private WorkshopInventory mockInventory;
    private AppointmentPart mockAppointmentPart;
    private PartCategory mockCategory;

    @BeforeEach
    void setUp() {
        mockPart = PartCatalog.builder()
                .id(UUID.randomUUID())
                .oemReference("REF-123")
                .name("Pastillas Brembo")
                .manufacturer("Brembo")
                .build();

        mockInventory = WorkshopInventory.builder()
                .id(UUID.randomUUID())
                .part(mockPart)
                .stockQuantity(10)
                .costPrice(20.0)
                .retailPrice(35.0)
                .build();

        mockAppointmentPart = AppointmentPart.builder()
                .id(UUID.randomUUID())
                .part(mockPart)
                .quantityUsed(2)
                .appliedPrice(35.0)
                .build();

        mockCategory = PartCategory.builder()
                .id(UUID.randomUUID())
                .name("frenos")
                .displayName("Frenos")
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(partController).build();
    }

    @Test
    void getCatalog_ShouldReturnList() throws Exception {
        when(partLookupService.getAllCatalog()).thenReturn(List.of(mockPart));

        mockMvc.perform(get("/api/parts/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Pastillas Brembo")));

        verify(partLookupService, times(1)).getAllCatalog();
    }

    @Test
    void getInventory_ShouldReturnList() throws Exception {
        when(partLookupService.getAllInventory()).thenReturn(List.of(mockInventory));

        mockMvc.perform(get("/api/parts/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].stockQuantity", is(10)));

        verify(partLookupService, times(1)).getAllInventory();
    }

    @Test
    void getAppointmentParts_ShouldReturnList() throws Exception {
        UUID appId = UUID.randomUUID();
        when(partLookupService.getPartsByAppointment(appId)).thenReturn(List.of(mockAppointmentPart));

        mockMvc.perform(get("/api/parts/appointments/{appointmentId}", appId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].quantityUsed", is(2)));

        verify(partLookupService, times(1)).getPartsByAppointment(appId);
    }

    @Test
    void addPartToAppointment_Standard_ShouldReturnDTO() throws Exception {
        UUID appId = UUID.randomUUID();
        UUID partId = mockPart.getId();
        when(partInventoryFacade.addStandardPartToAppointment(appId, partId, 2)).thenReturn(mockAppointmentPart);

        String payload = "{\"partId\":\"" + partId + "\",\"quantity\":2,\"discount\":0.0}";

        mockMvc.perform(post("/api/parts/appointments/{appointmentId}", appId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityUsed", is(2)));

        verify(partInventoryFacade, times(1)).addStandardPartToAppointment(appId, partId, 2);
    }

    @Test
    void addPartToAppointment_Discounted_ShouldReturnDTO() throws Exception {
        UUID appId = UUID.randomUUID();
        UUID partId = mockPart.getId();
        when(partInventoryFacade.addDiscountedPartToAppointment(appId, partId, 2, 0.1)).thenReturn(mockAppointmentPart);

        String payload = "{\"partId\":\"" + partId + "\",\"quantity\":2,\"discount\":0.1}";

        mockMvc.perform(post("/api/parts/appointments/{appointmentId}", appId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityUsed", is(2)));

        verify(partInventoryFacade, times(1)).addDiscountedPartToAppointment(appId, partId, 2, 0.1);
    }

    @Test
    void addPartToAppointment_Custom_ShouldReturnDTO() throws Exception {
        UUID appId = UUID.randomUUID();
        when(partAssignmentService.assignCustomPartToAppointment(appId, "Pastillas Custom", 2)).thenReturn(mockAppointmentPart);

        String payload = "{\"customName\":\"Pastillas Custom\",\"quantity\":2}";

        mockMvc.perform(post("/api/parts/appointments/{appointmentId}", appId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityUsed", is(2)));

        verify(partAssignmentService, times(1)).assignCustomPartToAppointment(appId, "Pastillas Custom", 2);
    }

    @Test
    void removePartFromAppointment_ShouldReturnSuccess() throws Exception {
        UUID appId = UUID.randomUUID();
        UUID partId = mockPart.getId();

        mockMvc.perform(delete("/api/parts/appointments/{appointmentId}/parts/{partId}", appId, partId))
                .andExpect(status().isOk())
                .andExpect(content().string("Repuesto eliminado y stock devuelto"));

        verify(partInventoryFacade, times(1)).removePartAndRestoreInventory(appId, partId);
    }

    @Test
    void addInventoryItem_ShouldReturnCreated() throws Exception {
        UUID categoryId = UUID.randomUUID();
        when(partAdminService.addPartToInventory(
                eq("REF-123"), eq("Pastillas Brembo"), eq("Brembo"), eq("Specs"), eq(categoryId),
                eq(20.0), eq(35.0), eq(10), eq(5)
        )).thenReturn(mockInventory);

        String payload = "{\"oemReference\":\"REF-123\",\"name\":\"Pastillas Brembo\",\"manufacturer\":\"Brembo\"," +
                "\"technicalSpecs\":\"Specs\",\"categoryId\":\"" + categoryId + "\",\"costPrice\":20.0,\"retailPrice\":35.0," +
                "\"stockQuantity\":10,\"avisoThreshold\":5}";

        mockMvc.perform(post("/api/parts/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.stockQuantity", is(10)));

        verify(partAdminService, times(1)).addPartToInventory(
                eq("REF-123"), eq("Pastillas Brembo"), eq("Brembo"), eq("Specs"), eq(categoryId),
                eq(20.0), eq(35.0), eq(10), eq(5)
        );
    }

    @Test
    void updateInventoryItem_ShouldReturnOk() throws Exception {
        UUID inventoryId = mockInventory.getId();
        UUID categoryId = UUID.randomUUID();
        when(partAdminService.updateInventoryItem(
                eq(inventoryId), eq("REF-123"), eq("Pastillas Brembo"), eq("Brembo"), eq("Specs"), eq(categoryId),
                eq(20.0), eq(35.0), eq(10), eq(5)
        )).thenReturn(mockInventory);

        String payload = "{\"oemReference\":\"REF-123\",\"name\":\"Pastillas Brembo\",\"manufacturer\":\"Brembo\"," +
                "\"technicalSpecs\":\"Specs\",\"categoryId\":\"" + categoryId + "\",\"costPrice\":20.0,\"retailPrice\":35.0," +
                "\"stockQuantity\":10,\"avisoThreshold\":5}";

        mockMvc.perform(put("/api/parts/inventory/{id}", inventoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockQuantity", is(10)));

        verify(partAdminService, times(1)).updateInventoryItem(
                eq(inventoryId), eq("REF-123"), eq("Pastillas Brembo"), eq("Brembo"), eq("Specs"), eq(categoryId),
                eq(20.0), eq(35.0), eq(10), eq(5)
        );
    }

    @Test
    void deleteInventoryItem_ShouldReturnOk() throws Exception {
        UUID inventoryId = mockInventory.getId();

        mockMvc.perform(delete("/api/parts/inventory/{id}", inventoryId))
                .andExpect(status().isOk())
                .andExpect(content().string("Pieza de inventario eliminada correctamente"));

        verify(partAdminService, times(1)).deleteInventoryItem(inventoryId);
    }

    @Test
    void getCategories_ShouldReturnList() throws Exception {
        when(partLookupService.getAllCategories()).thenReturn(List.of(mockCategory));

        mockMvc.perform(get("/api/parts/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].displayName", is("Frenos")));

        verify(partLookupService, times(1)).getAllCategories();
    }

    @Test
    void createCategory_ShouldReturnCreated() throws Exception {
        when(partAdminService.createCategory("Filtros")).thenReturn(mockCategory);

        String payload = "{\"displayName\":\"Filtros\"}";

        mockMvc.perform(post("/api/parts/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.displayName", is("Frenos")));

        verify(partAdminService, times(1)).createCategory("Filtros");
    }

    @Test
    void deleteCategory_ShouldReturnOk() throws Exception {
        UUID categoryId = mockCategory.getId();

        mockMvc.perform(delete("/api/parts/categories/{id}", categoryId))
                .andExpect(status().isOk())
                .andExpect(content().string("Categoría eliminada correctamente"));

        verify(partAdminService, times(1)).deleteCategory(categoryId);
    }
}

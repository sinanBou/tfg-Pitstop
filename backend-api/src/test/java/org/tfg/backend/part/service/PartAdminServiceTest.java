package org.tfg.backend.part.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.part.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartAdminServiceTest {

    @Mock
    private PartCatalogRepository partCatalogRepository;

    @Mock
    private WorkshopInventoryRepository workshopInventoryRepository;

    @Mock
    private PartCategoryRepository partCategoryRepository;

    @Mock
    private AppointmentPartRepository appointmentPartRepository;

    @Mock
    private PartAssignmentService partAssignmentService;

    @InjectMocks
    private PartAdminService partAdminService;

    private PartCategory mockCategory;
    private PartCatalog mockPart;
    private WorkshopInventory mockInventory;

    @BeforeEach
    void setUp() {
        mockCategory = PartCategory.builder()
                .id(UUID.randomUUID())
                .name("frenos")
                .displayName("Frenos")
                .parts(new ArrayList<>())
                .build();

        mockPart = PartCatalog.builder()
                .id(UUID.randomUUID())
                .oemReference("REF-123")
                .name("Pastillas Brembo")
                .manufacturer("Brembo")
                .category(mockCategory)
                .build();

        mockInventory = WorkshopInventory.builder()
                .id(UUID.randomUUID())
                .part(mockPart)
                .stockQuantity(10)
                .costPrice(20.0)
                .retailPrice(35.0)
                .avisoThreshold(5)
                .build();
    }

    @Test
    void addPartToInventory_ShouldCreateItem() {
        UUID categoryId = mockCategory.getId();
        when(partCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(partCatalogRepository.findByOemReference("REF-123")).thenReturn(Optional.empty());
        when(partCatalogRepository.save(any(PartCatalog.class))).thenReturn(mockPart);
        when(workshopInventoryRepository.save(any(WorkshopInventory.class))).thenReturn(mockInventory);

        WorkshopInventory result = partAdminService.addPartToInventory(
                "REF-123", "Pastillas Brembo", "Brembo", "Specs", categoryId, 20.0, 35.0, 10, 5
        );

        assertNotNull(result);
        verify(partCategoryRepository, times(1)).findById(categoryId);
        verify(partCatalogRepository, times(1)).save(any(PartCatalog.class));
        verify(workshopInventoryRepository, times(1)).save(any(WorkshopInventory.class));
    }

    @Test
    void updateInventoryItem_ShouldModifyAttributes() {
        UUID categoryId = mockCategory.getId();
        when(workshopInventoryRepository.findById(mockInventory.getId())).thenReturn(Optional.of(mockInventory));
        when(partCategoryRepository.findById(categoryId)).thenReturn(Optional.of(mockCategory));
        when(partCatalogRepository.save(mockPart)).thenReturn(mockPart);
        when(appointmentPartRepository.findByPartId(mockPart.getId())).thenReturn(new ArrayList<>());
        when(workshopInventoryRepository.save(mockInventory)).thenReturn(mockInventory);

        WorkshopInventory result = partAdminService.updateInventoryItem(
                mockInventory.getId(), "REF-123", "Pastillas Brembo New", "Brembo", "Specs New", categoryId, 25.0, 40.0, 15, 6
        );

        assertNotNull(result);
        assertEquals("Pastillas Brembo New", mockPart.getName());
        assertEquals(15, mockInventory.getStockQuantity());
        assertEquals(40.0, mockInventory.getRetailPrice());
        verify(workshopInventoryRepository, times(1)).save(mockInventory);
    }

    @Test
    void deleteInventoryItem_ShouldDeleteFromRepo() {
        when(workshopInventoryRepository.findById(mockInventory.getId())).thenReturn(Optional.of(mockInventory));
        when(appointmentPartRepository.findByPartId(mockPart.getId())).thenReturn(new ArrayList<>());

        partAdminService.deleteInventoryItem(mockInventory.getId());

        verify(appointmentPartRepository, times(1)).deleteAll(anyList());
        verify(workshopInventoryRepository, times(1)).delete(mockInventory);
        verify(partCatalogRepository, times(1)).delete(mockPart);
    }

    @Test
    void createCategory_ShouldSaveNewCategory() {
        when(partCategoryRepository.findByName("filtros")).thenReturn(Optional.empty());
        when(partCategoryRepository.save(any(PartCategory.class))).thenReturn(mockCategory);

        PartCategory result = partAdminService.createCategory("Filtros");

        assertNotNull(result);
        verify(partCategoryRepository, times(1)).save(any(PartCategory.class));
    }

    @Test
    void createCategory_ShouldThrowExceptionWhenDuplicate() {
        when(partCategoryRepository.findByName("frenos")).thenReturn(Optional.of(mockCategory));

        assertThrows(RuntimeException.class, () -> partAdminService.createCategory("Frenos"));
        verify(partCategoryRepository, never()).save(any());
    }

    @Test
    void deleteCategory_ShouldRemoveCategory() {
        when(partCategoryRepository.findById(mockCategory.getId())).thenReturn(Optional.of(mockCategory));

        partAdminService.deleteCategory(mockCategory.getId());

        verify(partCategoryRepository, times(1)).delete(mockCategory);
    }
}

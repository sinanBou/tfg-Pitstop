package org.tfg.backend.part.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.part.*;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartLookupServiceTest {

    @Mock
    private PartCatalogRepository partCatalogRepository;

    @Mock
    private WorkshopInventoryRepository workshopInventoryRepository;

    @Mock
    private AppointmentPartRepository appointmentPartRepository;

    @Mock
    private PartCategoryRepository partCategoryRepository;

    @InjectMocks
    private PartLookupService partLookupService;

    private PartCatalog mockPart;
    private WorkshopInventory mockInventory;
    private AppointmentPart mockAppointmentPart;
    private PartCategory mockCategory;

    @BeforeEach
    void setUp() {
        mockPart = PartCatalog.builder().id(UUID.randomUUID()).name("Brambo").build();
        mockInventory = WorkshopInventory.builder().id(UUID.randomUUID()).part(mockPart).build();
        mockAppointmentPart = AppointmentPart.builder().id(UUID.randomUUID()).part(mockPart).build();
        mockCategory = PartCategory.builder().id(UUID.randomUUID()).name("filters").build();
    }

    @Test
    void getAllCatalog_ShouldReturnList() {
        when(partCatalogRepository.findAll()).thenReturn(List.of(mockPart));
        List<PartCatalog> result = partLookupService.getAllCatalog();
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(partCatalogRepository, times(1)).findAll();
    }

    @Test
    void getInventoryByWorkshop_ShouldReturnList() {
        UUID workshopId = UUID.randomUUID();
        when(workshopInventoryRepository.findByWorkshopId(workshopId)).thenReturn(List.of(mockInventory));
        List<WorkshopInventory> result = partLookupService.getInventoryByWorkshop(workshopId);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(workshopInventoryRepository, times(1)).findByWorkshopId(workshopId);
    }

    @Test
    void getPartsByAppointment_ShouldReturnList() {
        UUID appId = UUID.randomUUID();
        when(appointmentPartRepository.findByAppointmentId(appId)).thenReturn(List.of(mockAppointmentPart));
        List<AppointmentPart> result = partLookupService.getPartsByAppointment(appId);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(appointmentPartRepository, times(1)).findByAppointmentId(appId);
    }

    @Test
    void getCategoriesByWorkshop_ShouldReturnList() {
        UUID workshopId = UUID.randomUUID();
        when(partCategoryRepository.findByWorkshopIdOrderByNameAsc(workshopId)).thenReturn(List.of(mockCategory));
        List<PartCategory> result = partLookupService.getCategoriesByWorkshop(workshopId);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(partCategoryRepository, times(1)).findByWorkshopIdOrderByNameAsc(workshopId);
    }
}

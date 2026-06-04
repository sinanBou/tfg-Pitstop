package org.tfg.backend.part.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.part.*;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartAssignmentServiceTest {

    @Mock
    private PartCatalogRepository partCatalogRepository;

    @Mock
    private WorkshopInventoryRepository workshopInventoryRepository;

    @Mock
    private AppointmentPartRepository appointmentPartRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private PartCategoryRepository partCategoryRepository;

    @InjectMocks
    private PartAssignmentService partAssignmentService;

    private org.tfg.backend.workshop.Workshop mockWorkshop;
    private Appointment mockAppointment;
    private PartCatalog mockPart;
    private WorkshopInventory mockInventory;
    private AppointmentPart mockAppointmentPart;
    private PartCategory mockCategory;

    @BeforeEach
    void setUp() {
        mockWorkshop = org.tfg.backend.workshop.Workshop.builder()
                .id(UUID.randomUUID())
                .companyName("Taller Test")
                .build();

        mockAppointment = Appointment.builder()
                .id(UUID.randomUUID())
                .estimatedDuration(120)
                .workshop(mockWorkshop)
                .build();

        mockCategory = PartCategory.builder()
                .id(UUID.randomUUID())
                .name("frenos")
                .displayName("Frenos")
                .workshop(mockWorkshop)
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
                .workshop(mockWorkshop)
                .build();

        mockAppointmentPart = AppointmentPart.builder()
                .id(UUID.randomUUID())
                .appointment(mockAppointment)
                .part(mockPart)
                .quantityUsed(2)
                .appliedPrice(35.0)
                .build();
    }

    @Test
    void assignPartToAppointment_ShouldReduceStockAndSavePart() {
        UUID partId = mockPart.getId();
        when(appointmentRepository.findById(mockAppointment.getId())).thenReturn(Optional.of(mockAppointment));
        when(partCatalogRepository.findById(partId)).thenReturn(Optional.of(mockPart));
        when(workshopInventoryRepository.findByPartIdAndWorkshopId(partId, mockWorkshop.getId())).thenReturn(Optional.of(mockInventory));
        when(appointmentPartRepository.findByAppointmentIdAndPartId(mockAppointment.getId(), partId)).thenReturn(Optional.empty());
        when(appointmentPartRepository.save(any(AppointmentPart.class))).thenReturn(mockAppointmentPart);

        AppointmentPart result = partAssignmentService.assignPartToAppointment(
                mockAppointment.getId(), partId, 2, new StandardPricingStrategy()
        );

        assertNotNull(result);
        assertEquals(8, mockInventory.getStockQuantity()); // 10 - 2
        verify(workshopInventoryRepository, times(1)).save(mockInventory);
        verify(appointmentPartRepository, times(1)).save(any(AppointmentPart.class));
    }

    @Test
    void assignPartToAppointment_ShouldThrowExceptionWhenStockInsufficient() {
        UUID partId = mockPart.getId();
        when(appointmentRepository.findById(mockAppointment.getId())).thenReturn(Optional.of(mockAppointment));
        when(partCatalogRepository.findById(partId)).thenReturn(Optional.of(mockPart));
        when(workshopInventoryRepository.findByPartIdAndWorkshopId(partId, mockWorkshop.getId())).thenReturn(Optional.of(mockInventory));

        assertThrows(RuntimeException.class, () -> partAssignmentService.assignPartToAppointment(
                mockAppointment.getId(), partId, 20, new StandardPricingStrategy()
        ));
    }

    @Test
    void assignCustomPartToAppointment_ShouldCreateOrUseCustomPart() {
        when(appointmentRepository.findById(mockAppointment.getId())).thenReturn(Optional.of(mockAppointment));
        when(partCategoryRepository.findByNameAndWorkshopId("recambios_personalizados", mockWorkshop.getId())).thenReturn(Optional.of(mockCategory));
        when(partCatalogRepository.findByName("Pastillas Custom")).thenReturn(new ArrayList<>());
        when(partCatalogRepository.save(any(PartCatalog.class))).thenReturn(mockPart);
        when(workshopInventoryRepository.findByPartIdAndWorkshopId(any(), eq(mockWorkshop.getId()))).thenReturn(Optional.empty());
        when(workshopInventoryRepository.save(any(WorkshopInventory.class))).thenReturn(mockInventory);
        when(appointmentPartRepository.findByAppointmentIdAndPartId(any(), any())).thenReturn(Optional.empty());
        when(appointmentPartRepository.save(any(AppointmentPart.class))).thenReturn(mockAppointmentPart);

        AppointmentPart result = partAssignmentService.assignCustomPartToAppointment(
                mockAppointment.getId(), "Pastillas Custom", 2
        );

        assertNotNull(result);
        verify(partCatalogRepository, times(1)).save(any(PartCatalog.class));
        verify(workshopInventoryRepository, times(1)).save(any(WorkshopInventory.class));
        verify(appointmentPartRepository, times(1)).save(any(AppointmentPart.class));
    }

    @Test
    void removePartFromAppointment_ShouldRestoreStockAndDeleteAssoc() {
        UUID partId = mockPart.getId();
        when(appointmentRepository.findById(mockAppointment.getId())).thenReturn(Optional.of(mockAppointment));
        when(appointmentPartRepository.findByAppointmentIdAndPartId(mockAppointment.getId(), partId)).thenReturn(Optional.of(mockAppointmentPart));
        when(workshopInventoryRepository.findByPartIdAndWorkshopId(partId, mockWorkshop.getId())).thenReturn(Optional.of(mockInventory));

        partAssignmentService.removePartFromAppointment(mockAppointment.getId(), partId);

        assertEquals(12, mockInventory.getStockQuantity()); // 10 + 2
        verify(workshopInventoryRepository, times(1)).save(mockInventory);
        verify(appointmentPartRepository, times(1)).delete(mockAppointmentPart);
    }
}

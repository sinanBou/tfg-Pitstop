package org.tfg.backend.workshop;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.tfg.backend.employee.Employee;
import org.tfg.backend.employee.EmployeeRepository;
import org.tfg.backend.storage.StorageService;
import org.tfg.backend.taskcatalog.CatalogInitializationService;

import java.io.IOException;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkshopAdminServiceTest {

    @Mock
    private WorkshopRepository workshopRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CatalogInitializationService catalogInitializationService;

    @Mock
    private StorageService storageService;

    @Mock
    private WorkshopMapper workshopMapper;

    @InjectMocks
    private WorkshopAdminService workshopAdminService;

    private Employee mockOwner;
    private Workshop mockWorkshop;
    private WorkshopDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockOwner = Employee.builder()
                .id(UUID.randomUUID())
                .build();

        mockWorkshop = Workshop.builder()
                .id(UUID.randomUUID())
                .cif("B12345678")
                .companyName("PitStop Central")
                .address("Calle Falsa 123")
                .owner(mockOwner)
                .openTime(LocalTime.of(8, 0))
                .closeTime(LocalTime.of(18, 0))
                .slotDurationMinutes(60)
                .workingDays("1,2,3,4,5")
                .hourlyRate(50.0)
                .includeOwnerInPlanning(false)
                .build();

        mockDTO = WorkshopDTO.builder()
                .id(mockWorkshop.getId())
                .cif("B12345678")
                .companyName("PitStop Central")
                .address("Calle Falsa 123")
                .openTime(LocalTime.of(8, 0))
                .closeTime(LocalTime.of(18, 0))
                .slotDurationMinutes(60)
                .workingDays("1,2,3,4,5")
                .hourlyRate(50.0)
                .includeOwnerInPlanning(false)
                .build();
    }

    @Test
    void saveWorkshop_ShouldCreateWorkshopAndInitializeCatalog() {
        WorkshopRequest request = new WorkshopRequest();
        request.setCif("B12345678");
        request.setCompanyName("PitStop Central");
        request.setAddress("Calle Falsa 123");
        request.setOwnerId(mockOwner.getId());
        request.setOpenTime(LocalTime.of(8, 0));
        request.setCloseTime(LocalTime.of(18, 0));
        request.setSlotDurationMinutes(60);
        request.setWorkingDays("1,2,3,4,5");
        request.setHourlyRate(50.0);
        request.setIncludeOwnerInPlanning(false);

        when(workshopRepository.existsByCif("B12345678")).thenReturn(false);
        when(employeeRepository.findById(mockOwner.getId())).thenReturn(Optional.of(mockOwner));
        when(workshopRepository.save(any(Workshop.class))).thenReturn(mockWorkshop);
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        WorkshopDTO result = workshopAdminService.saveWorkshop(request);

        assertNotNull(result);
        assertEquals(mockWorkshop.getId(), result.getId());
        verify(workshopRepository, times(1)).existsByCif("B12345678");
        verify(employeeRepository, times(1)).findById(mockOwner.getId());
        verify(workshopRepository, times(1)).save(any(Workshop.class));
        verify(employeeRepository, times(1)).save(mockOwner);
        verify(catalogInitializationService, times(1)).initializeCatalogForWorkshop(any(Workshop.class));
        verify(workshopMapper, times(1)).mapToDTO(mockWorkshop);
    }

    @Test
    void saveWorkshop_ShouldThrowExceptionWhenCifDuplicate() {
        WorkshopRequest request = new WorkshopRequest();
        request.setCif("B12345678");

        when(workshopRepository.existsByCif("B12345678")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> workshopAdminService.saveWorkshop(request));
        verify(workshopRepository, never()).save(any(Workshop.class));
    }

    @Test
    void updateWorkshopSettings_ShouldModifySettings() {
        WorkshopRequest request = new WorkshopRequest();
        request.setOpenTime(LocalTime.of(9, 0));
        request.setCloseTime(LocalTime.of(19, 0));
        request.setSlotDurationMinutes(30);
        request.setAddress("Avenida Siempre Viva");
        request.setWorkingDays("1,2,3,4");
        request.setHourlyRate(60.0);
        request.setIncludeOwnerInPlanning(true);

        when(workshopRepository.findById(mockWorkshop.getId())).thenReturn(Optional.of(mockWorkshop));
        when(workshopRepository.save(mockWorkshop)).thenReturn(mockWorkshop);
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        WorkshopDTO result = workshopAdminService.updateWorkshopSettings(mockWorkshop.getId(), request);

        assertNotNull(result);
        assertEquals(LocalTime.of(9, 0), mockWorkshop.getOpenTime());
        assertEquals(LocalTime.of(19, 0), mockWorkshop.getCloseTime());
        assertEquals(30, mockWorkshop.getSlotDurationMinutes());
        assertEquals("Avenida Siempre Viva", mockWorkshop.getAddress());
        assertEquals("1,2,3,4", mockWorkshop.getWorkingDays());
        assertEquals(60.0, mockWorkshop.getHourlyRate());
        assertTrue(mockWorkshop.getIncludeOwnerInPlanning());

        verify(workshopRepository, times(1)).findById(mockWorkshop.getId());
        verify(workshopRepository, times(1)).save(mockWorkshop);
    }

    @Test
    void uploadLogo_ShouldStoreFileAndSetUrl() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "some-bytes".getBytes());
        when(workshopRepository.findById(mockWorkshop.getId())).thenReturn(Optional.of(mockWorkshop));
        when(storageService.uploadFile(file, "workshop-logos")).thenReturn("http://s3/logo.png");
        when(workshopRepository.save(mockWorkshop)).thenReturn(mockWorkshop);
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        WorkshopDTO result = workshopAdminService.uploadLogo(mockWorkshop.getId(), file);

        assertNotNull(result);
        assertEquals("http://s3/logo.png", mockWorkshop.getLogoPictureUrl());
        verify(storageService, times(1)).uploadFile(file, "workshop-logos");
        verify(workshopRepository, times(1)).save(mockWorkshop);
    }

    @Test
    void deleteLogo_ShouldRemoveFile() {
        mockWorkshop.setLogoPictureUrl("http://s3/logo.png");
        when(workshopRepository.findById(mockWorkshop.getId())).thenReturn(Optional.of(mockWorkshop));
        when(workshopRepository.save(mockWorkshop)).thenReturn(mockWorkshop);
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        WorkshopDTO result = workshopAdminService.deleteLogo(mockWorkshop.getId());

        assertNotNull(result);
        assertNull(mockWorkshop.getLogoPictureUrl());
        verify(storageService, times(1)).deleteFile("http://s3/logo.png");
        verify(workshopRepository, times(1)).save(mockWorkshop);
    }
}

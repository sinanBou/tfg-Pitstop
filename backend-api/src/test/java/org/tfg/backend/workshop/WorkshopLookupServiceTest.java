package org.tfg.backend.workshop;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkshopLookupServiceTest {

    @Mock
    private WorkshopRepository workshopRepository;

    @Mock
    private WorkshopMapper workshopMapper;

    @InjectMocks
    private WorkshopLookupService workshopLookupService;

    private Workshop mockWorkshop;
    private WorkshopDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockWorkshop = Workshop.builder()
                .id(UUID.randomUUID())
                .cif("B12345678")
                .companyName("PitStop Central")
                .address("Calle Falsa 123")
                .build();

        mockDTO = WorkshopDTO.builder()
                .id(mockWorkshop.getId())
                .cif("B12345678")
                .companyName("PitStop Central")
                .address("Calle Falsa 123")
                .build();
    }

    @Test
    void getAllWorkshops_ShouldReturnList() {
        when(workshopRepository.findAll()).thenReturn(List.of(mockWorkshop));
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        List<WorkshopDTO> result = workshopLookupService.getAllWorkshops();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(mockWorkshop.getId(), result.get(0).getId());
        verify(workshopRepository, times(1)).findAll();
    }

    @Test
    void getWorkshopsByOwnerId_ShouldReturnList() {
        UUID ownerId = UUID.randomUUID();
        when(workshopRepository.findByOwnerId(ownerId)).thenReturn(List.of(mockWorkshop));
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        List<WorkshopDTO> result = workshopLookupService.getWorkshopsByOwnerId(ownerId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(mockWorkshop.getId(), result.get(0).getId());
        verify(workshopRepository, times(1)).findByOwnerId(ownerId);
    }

    @Test
    void searchWorkshops_ShouldReturnPage() {
        Page<Workshop> mockPage = new PageImpl<>(List.of(mockWorkshop));
        when(workshopRepository.searchWorkshops(eq("PitStop"), any(PageRequest.class))).thenReturn(mockPage);
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        Page<WorkshopDTO> result = workshopLookupService.searchWorkshops("PitStop", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(mockWorkshop.getId(), result.getContent().get(0).getId());
        verify(workshopRepository, times(1)).searchWorkshops(eq("PitStop"), any(PageRequest.class));
    }

    @Test
    void getWorkshopById_ShouldReturnDTO() {
        UUID workshopId = mockWorkshop.getId();
        when(workshopRepository.findById(workshopId)).thenReturn(Optional.of(mockWorkshop));
        when(workshopMapper.mapToDTO(mockWorkshop)).thenReturn(mockDTO);

        WorkshopDTO result = workshopLookupService.getWorkshopById(workshopId);

        assertNotNull(result);
        assertEquals(mockWorkshop.getId(), result.getId());
        verify(workshopRepository, times(1)).findById(workshopId);
    }

    @Test
    void getWorkshopById_ShouldThrowExceptionWhenNotFound() {
        UUID randomId = UUID.randomUUID();
        when(workshopRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> workshopLookupService.getWorkshopById(randomId));
    }
}

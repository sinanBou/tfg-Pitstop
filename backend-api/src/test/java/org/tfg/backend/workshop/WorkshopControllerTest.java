package org.tfg.backend.workshop;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalTime;
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
class WorkshopControllerTest {

    private MockMvc mockMvc;

    @Mock
    private WorkshopLookupService workshopLookupService;

    @Mock
    private WorkshopAdminService workshopAdminService;

    @InjectMocks
    private WorkshopController workshopController;

    private WorkshopDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockDTO = WorkshopDTO.builder()
                .id(UUID.randomUUID())
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

        mockMvc = MockMvcBuilders.standaloneSetup(workshopController).build();
    }

    @Test
    void createWorkshop_ShouldReturnDTO() throws Exception {
        when(workshopAdminService.saveWorkshop(any(WorkshopRequest.class))).thenReturn(mockDTO);

        String payload = "{\"cif\":\"B12345678\",\"companyName\":\"PitStop Central\",\"address\":\"Calle Falsa 123\",\"ownerId\":\"" + UUID.randomUUID() + "\"}";

        mockMvc.perform(post("/api/workshops")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("PitStop Central")))
                .andExpect(jsonPath("$.cif", is("B12345678")));

        verify(workshopAdminService, times(1)).saveWorkshop(any(WorkshopRequest.class));
    }

    @Test
    void getAllWorkshops_ShouldReturnList() throws Exception {
        when(workshopLookupService.getAllWorkshops()).thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/workshops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName", is("PitStop Central")));

        verify(workshopLookupService, times(1)).getAllWorkshops();
    }

    @Test
    void getWorkshopById_ShouldReturnDTO() throws Exception {
        UUID workshopId = mockDTO.getId();
        when(workshopLookupService.getWorkshopById(workshopId)).thenReturn(mockDTO);

        mockMvc.perform(get("/api/workshops/{id}", workshopId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("PitStop Central")));

        verify(workshopLookupService, times(1)).getWorkshopById(workshopId);
    }

    @Test
    void getWorkshopsByOwner_ShouldReturnList() throws Exception {
        UUID ownerId = UUID.randomUUID();
        when(workshopLookupService.getWorkshopsByOwnerId(ownerId)).thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/workshops/owner/{ownerId}", ownerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName", is("PitStop Central")));

        verify(workshopLookupService, times(1)).getWorkshopsByOwnerId(ownerId);
    }

    @Test
    void updateSettings_ShouldReturnDTO() throws Exception {
        UUID workshopId = mockDTO.getId();
        when(workshopAdminService.updateWorkshopSettings(eq(workshopId), any(WorkshopRequest.class))).thenReturn(mockDTO);

        String payload = "{\"openTime\":\"09:00\",\"closeTime\":\"19:00\",\"slotDurationMinutes\":30}";

        mockMvc.perform(put("/api/workshops/{id}/settings", workshopId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("PitStop Central")));

        verify(workshopAdminService, times(1)).updateWorkshopSettings(eq(workshopId), any(WorkshopRequest.class));
    }

    @Test
    void searchWorkshops_ShouldReturnPage() throws Exception {
        when(workshopLookupService.searchWorkshops(eq("PitStop"), eq(0), eq(10)))
                .thenReturn(new PageImpl<>(List.of(mockDTO), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/workshops/search")
                        .param("query", "PitStop")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].companyName", is("PitStop Central")));

        verify(workshopLookupService, times(1)).searchWorkshops(eq("PitStop"), eq(0), eq(10));
    }

    @Test
    void uploadLogo_ShouldReturnDTO() throws Exception {
        UUID workshopId = mockDTO.getId();
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "some-bytes".getBytes());
        when(workshopAdminService.uploadLogo(eq(workshopId), any())).thenReturn(mockDTO);

        mockMvc.perform(multipart("/api/workshops/{id}/logo", workshopId)
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("PitStop Central")));

        verify(workshopAdminService, times(1)).uploadLogo(eq(workshopId), any());
    }

    @Test
    void deleteLogo_ShouldReturnDTO() throws Exception {
        UUID workshopId = mockDTO.getId();
        when(workshopAdminService.deleteLogo(workshopId)).thenReturn(mockDTO);

        mockMvc.perform(delete("/api/workshops/{id}/logo", workshopId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("PitStop Central")));

        verify(workshopAdminService, times(1)).deleteLogo(workshopId);
    }
}

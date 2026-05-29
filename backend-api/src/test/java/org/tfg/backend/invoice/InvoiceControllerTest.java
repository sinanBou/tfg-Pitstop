package org.tfg.backend.invoice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private InvoiceAdminService invoiceAdminService;

    @Mock
    private InvoiceLookupService invoiceLookupService;

    @InjectMocks
    private InvoiceController invoiceController;

    private InvoiceDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockDTO = InvoiceDTO.builder()
                .id(UUID.randomUUID())
                .appointmentId(UUID.randomUUID())
                .workshopId(UUID.randomUUID())
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .createdAt(LocalDateTime.now())
                .clientFullName("John Doe")
                .vehicleDisplay("BMW M3 (1234BBB)")
                .serviceType("Revision")
                .description("Cambio de aceite")
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(invoiceController).build();
    }

    @Test
    void createInvoice_ShouldReturnDTO() throws Exception {
        when(invoiceAdminService.createInvoice(any(InvoiceDTO.class))).thenReturn(mockDTO);

        String payload = "{\"appointmentId\":\"" + mockDTO.getAppointmentId() + "\",\"laborRate\":50,\"totalLabor\":100,\"totalParts\":50,\"totalPrice\":150}";

        mockMvc.perform(post("/api/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientFullName", is("John Doe")))
                .andExpect(jsonPath("$.vehicleDisplay", is("BMW M3 (1234BBB)")));

        verify(invoiceAdminService, times(1)).createInvoice(any(InvoiceDTO.class));
    }

    @Test
    void getWorkshopInvoices_ShouldReturnList() throws Exception {
        UUID workshopId = mockDTO.getWorkshopId();
        when(invoiceAdminService.getInvoicesByWorkshop(workshopId)).thenReturn(List.of(mockDTO));

        mockMvc.perform(get("/api/invoices/workshop/{workshopId}", workshopId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clientFullName", is("John Doe")));

        verify(invoiceAdminService, times(1)).getInvoicesByWorkshop(workshopId);
    }

    @Test
    void getInvoiceByAppointment_ShouldReturnDTO() throws Exception {
        UUID appointmentId = mockDTO.getAppointmentId();
        when(invoiceLookupService.getInvoiceByAppointment(appointmentId)).thenReturn(mockDTO);

        mockMvc.perform(get("/api/invoices/appointment/{appointmentId}", appointmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientFullName", is("John Doe")));

        verify(invoiceLookupService, times(1)).getInvoiceByAppointment(appointmentId);
    }

    @Test
    void getInvoiceByAppointment_ShouldReturnNotFound() throws Exception {
        UUID randomId = UUID.randomUUID();
        when(invoiceLookupService.getInvoiceByAppointment(randomId)).thenReturn(null);

        mockMvc.perform(get("/api/invoices/appointment/{appointmentId}", randomId))
                .andExpect(status().isNotFound());

        verify(invoiceLookupService, times(1)).getInvoiceByAppointment(randomId);
    }
}

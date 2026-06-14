package org.tfg.backend.invoice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceLookupServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceMapper invoiceMapper;

    @InjectMocks
    private InvoiceLookupService invoiceLookupService;

    private Invoice mockInvoice;
    private InvoiceDTO mockDTO;

    @BeforeEach
    void setUp() {
        mockInvoice = Invoice.builder()
                .id(UUID.randomUUID())
                .appointmentId(UUID.randomUUID())
                .workshopId(UUID.randomUUID())
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .createdAt(LocalDateTime.now())
                .build();

        mockDTO = InvoiceDTO.builder()
                .id(mockInvoice.getId())
                .appointmentId(mockInvoice.getAppointmentId())
                .workshopId(mockInvoice.getWorkshopId())
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .createdAt(mockInvoice.getCreatedAt())
                .build();
    }

    @Test
    void getInvoiceByAppointment_ShouldReturnDTO() {
        UUID appointmentId = mockInvoice.getAppointmentId();
        when(invoiceRepository.findByAppointmentId(appointmentId)).thenReturn(Optional.of(mockInvoice));
        when(invoiceMapper.mapToDTO(mockInvoice)).thenReturn(mockDTO);

        InvoiceDTO result = invoiceLookupService.getInvoiceByAppointment(appointmentId);

        assertNotNull(result);
        assertEquals(mockInvoice.getId(), result.getId());

        verify(invoiceRepository, times(1)).findByAppointmentId(appointmentId);
        verify(invoiceMapper, times(1)).mapToDTO(mockInvoice);
    }

    @Test
    void getInvoicesByWorkshop_ShouldReturnList() {
        UUID workshopId = mockInvoice.getWorkshopId();
        when(invoiceRepository.findByWorkshopIdOrderByCreatedAtDesc(workshopId)).thenReturn(List.of(mockInvoice));
        when(invoiceMapper.mapToDTO(mockInvoice)).thenReturn(mockDTO);

        List<InvoiceDTO> result = invoiceLookupService.getInvoicesByWorkshop(workshopId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(mockInvoice.getId(), result.get(0).getId());

        verify(invoiceRepository, times(1)).findByWorkshopIdOrderByCreatedAtDesc(workshopId);
        verify(invoiceMapper, times(1)).mapToDTO(mockInvoice);
    }
}

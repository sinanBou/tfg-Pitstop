package org.tfg.backend.invoice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.appointment.AppointmentStatus;
import org.tfg.backend.workshop.Workshop;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceAdminServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private InvoiceMapper invoiceMapper;

    @InjectMocks
    private InvoiceAdminService invoiceAdminService;

    private Appointment mockAppointment;
    private Invoice mockInvoice;
    private InvoiceDTO mockDTO;

    @BeforeEach
    void setUp() {
        Workshop workshop = Workshop.builder()
                .id(UUID.randomUUID())
                .companyName("PitStop Central")
                .build();

        mockAppointment = Appointment.builder()
                .id(UUID.randomUUID())
                .status(AppointmentStatus.CONFIRMED)
                .workshop(workshop)
                .build();

        mockInvoice = Invoice.builder()
                .id(UUID.randomUUID())
                .appointmentId(mockAppointment.getId())
                .workshopId(workshop.getId())
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .createdAt(LocalDateTime.now())
                .build();

        mockDTO = InvoiceDTO.builder()
                .id(mockInvoice.getId())
                .appointmentId(mockAppointment.getId())
                .workshopId(workshop.getId())
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .createdAt(mockInvoice.getCreatedAt())
                .build();
    }

    @Test
    void createInvoice_ShouldTransitionAppointmentToCompletedAndSaveInvoice() {
        when(appointmentRepository.findById(mockAppointment.getId())).thenReturn(Optional.of(mockAppointment));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(mockInvoice);
        when(invoiceMapper.mapToDTO(mockInvoice, mockAppointment)).thenReturn(mockDTO);

        InvoiceDTO inputDTO = InvoiceDTO.builder()
                .appointmentId(mockAppointment.getId())
                .laborRate(50.0)
                .totalLabor(100.0)
                .totalParts(50.0)
                .totalPrice(150.0)
                .build();

        InvoiceDTO result = invoiceAdminService.createInvoice(inputDTO);

        assertNotNull(result);
        assertEquals(mockInvoice.getId(), result.getId());
        assertEquals(AppointmentStatus.COMPLETED, mockAppointment.getStatus());
        assertNotNull(mockAppointment.getActualEndTime());

        verify(appointmentRepository, times(1)).findById(mockAppointment.getId());
        verify(appointmentRepository, times(1)).save(mockAppointment);
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
        verify(invoiceMapper, times(1)).mapToDTO(mockInvoice, mockAppointment);
    }

    @Test
    void createInvoice_ShouldThrowExceptionWhenAppointmentIdMissing() {
        InvoiceDTO inputDTO = InvoiceDTO.builder().build();

        assertThrows(RuntimeException.class, () -> invoiceAdminService.createInvoice(inputDTO));
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    @Test
    void createInvoice_ShouldThrowExceptionWhenAppointmentNotFound() {
        UUID randomId = UUID.randomUUID();
        when(appointmentRepository.findById(randomId)).thenReturn(Optional.empty());

        InvoiceDTO inputDTO = InvoiceDTO.builder()
                .appointmentId(randomId)
                .build();

        assertThrows(RuntimeException.class, () -> invoiceAdminService.createInvoice(inputDTO));
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }
}

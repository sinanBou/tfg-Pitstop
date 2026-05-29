package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceLookupService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;

    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceByAppointment(UUID appointmentId) {
        return invoiceRepository.findByAppointmentId(appointmentId)
                .map(invoiceMapper::mapToDTO)
                .orElse(null);
    }
}

package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<InvoiceDTO> getInvoicesByWorkshop(UUID workshopId) {
        return invoiceRepository.findByWorkshopIdOrderByCreatedAtDesc(workshopId)
                .stream()
                .map(invoiceMapper::mapToDTO)
                .collect(Collectors.toList());
    }
}

package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Servicio especializado en consultas seguras y rápidas de facturas.
 * Proporciona métodos de lectura sin escritura para evitar bloqueos en base de datos.
 */
@Service
@RequiredArgsConstructor
public class InvoiceLookupService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;

    /**
     * Busca la factura asociada a una cita específica y la convierte en DTO de forma optimizada de solo lectura.
     *
     * @param appointmentId Identificador de la cita asociada.
     * @return DTO de la factura encontrada, o null si no existe.
     */
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceByAppointment(UUID appointmentId) {
        return invoiceRepository.findByAppointmentId(appointmentId)
                .map(invoiceMapper::mapToDTO)
                .orElse(null);
    }
}

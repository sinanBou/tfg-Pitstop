package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.appointment.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio administrativo para la gestión y creación de facturas, utilizado en
 * flujos avanzados de supervisión del negocio.
 */
@Service
@RequiredArgsConstructor
public class InvoiceAdminService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceMapper invoiceMapper;

    /**
     * Crea una nueva factura asociada a una cita de taller a nivel administrativo.
     * Marca la cita asociada como completada de forma atómica.
     *
     * @param dto DTO con la información de facturación de la cita.
     * @return DTO de la factura generada.
     * @throws RuntimeException Si el ID de la cita no es provisto o la cita no existe.
     */
    @Transactional
    public InvoiceDTO createInvoice(InvoiceDTO dto) {
        if (dto.getAppointmentId() == null) {
            throw new RuntimeException("El ID de la cita es obligatorio");
        }

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // 1. Completar la cita en la base de datos
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setActualEndTime(LocalDateTime.now());
        appointmentRepository.save(appointment);

        // 2. Crear y persistir la Factura
        Invoice invoice = Invoice.builder()
                .appointmentId(appointment.getId())
                .workshopId(appointment.getWorkshop().getId())
                .laborRate(dto.getLaborRate())
                .totalLabor(dto.getTotalLabor())
                .partsJson(dto.getPartsJson())
                .totalParts(dto.getTotalParts())
                .totalPrice(dto.getTotalPrice())
                .createdAt(LocalDateTime.now())
                .build();

        Invoice saved = invoiceRepository.save(invoice);

        // 3. Devolver el DTO con campos mapeados
        return invoiceMapper.mapToDTO(saved, appointment);
    }

    /**
     * Recupera el histórico de facturas para un taller específico a nivel administrativo.
     *
     * @param workshopId Identificador único del taller.
     * @return Lista de DTOs de las facturas pertenecientes al taller.
     */
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getInvoicesByWorkshop(UUID workshopId) {
        return invoiceRepository.findByWorkshopIdOrderByCreatedAtDesc(workshopId)
                .stream()
                .map(invoiceMapper::mapToDTO)
                .collect(Collectors.toList());
    }
}

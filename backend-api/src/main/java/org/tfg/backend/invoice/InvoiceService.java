package org.tfg.backend.invoice;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;
import org.tfg.backend.appointment.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;

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
        return mapToDTO(saved);
    }

    @Transactional
    public List<InvoiceDTO> getInvoicesByWorkshop(UUID workshopId) {
        return invoiceRepository.findByWorkshopIdOrderByCreatedAtDesc(workshopId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceDTO getInvoiceByAppointment(UUID appointmentId) {
        return invoiceRepository.findByAppointmentId(appointmentId)
                .map(this::mapToDTO)
                .orElse(null); // Return null instead of throwing to be graceful in frontend
    }

    /**
    * Mapea de manera privada una entidad {@link Invoice} a su {@link InvoiceDTO},
    * rellenando los datos de la cita y tolerando eliminaciones fÃ­sicas previas.
    *
    * @param invoice Entidad de la factura.
    * @return DTO de la factura listo para el frontend.
    */
    private InvoiceDTO mapToDTO(Invoice invoice) {
        InvoiceDTO dto = InvoiceDTO.builder()
                .id(invoice.getId())
                .appointmentId(invoice.getAppointmentId())
                .workshopId(invoice.getWorkshopId())
                .laborRate(invoice.getLaborRate())
                .totalLabor(invoice.getTotalLabor())
                .partsJson(invoice.getPartsJson())
                .totalParts(invoice.getTotalParts())
                .totalPrice(invoice.getTotalPrice())
                .createdAt(invoice.getCreatedAt())
                .build();

        // Rellenar campos de la cita con tolerancia a borrados físicos
        appointmentRepository.findById(invoice.getAppointmentId()).ifPresentOrElse(
            appointment -> {
                dto.setClientFullName(appointment.getClient().getUser().getFirstname() + " " +
                        appointment.getClient().getUser().getLastname());
                dto.setVehicleDisplay(appointment.getVehicle().getBrand() + " " +
                        appointment.getVehicle().getModel() + " (" +
                        appointment.getVehicle().getLicensePlate() + ")");
                dto.setServiceType(appointment.getServiceType());
                dto.setDescription(appointment.getDescription());
            },
            () -> {
                dto.setClientFullName("Cliente (Histórico)");
                dto.setVehicleDisplay("Vehículo (Histórico)");
                dto.setServiceType("Servicio");
                dto.setDescription("Detalle no disponible");
            }
        );

        return dto;
    }
}
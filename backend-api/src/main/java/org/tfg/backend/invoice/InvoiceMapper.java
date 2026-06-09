package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;

/**
 * Componente encargado de realizar la conversión entre la entidad {@link Invoice}
 * y su correspondiente {@link InvoiceDTO}, inyectando tolerancias a eliminaciones físicas de citas.
 */
@Component
@RequiredArgsConstructor
public class InvoiceMapper {

    private final AppointmentRepository appointmentRepository;

    /**
     * Convierte una factura en su correspondiente DTO, recuperando la cita asociada
     * de la base de datos para rellenar los datos extendidos.
     *
     * @param invoice Entidad de la factura a mapear.
     * @return DTO con la información de la factura y de la cita asociada, o null si la factura es nula.
     */
    public InvoiceDTO mapToDTO(Invoice invoice) {
        if (invoice == null) return null;
        Appointment appointment = appointmentRepository.findById(invoice.getAppointmentId()).orElse(null);
        return mapToDTO(invoice, appointment);
    }

    /**
     * Convierte una factura en su correspondiente DTO, asociándole directamente una cita
     * ya cargada previamente para optimizar las consultas a la base de datos.
     *
     * @param invoice Entidad de la factura a mapear.
     * @param appointment Cita de taller asociada a la factura.
     * @return DTO con la información consolidada de factura y cita, o null si la factura es nula.
     */
    public InvoiceDTO mapToDTO(Invoice invoice, Appointment appointment) {
        if (invoice == null) return null;
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

        if (appointment != null) {
            dto.setClientFullName(appointment.getClient().getUser().getFirstname() + " " +
                    appointment.getClient().getUser().getLastname());
            dto.setVehicleDisplay(appointment.getVehicle().getBrand() + " " +
                    appointment.getVehicle().getModel() + " (" +
                    appointment.getVehicle().getLicensePlate() + ")");
            dto.setServiceType(appointment.getServiceType());
            dto.setDescription(appointment.getDescription());
        } else {
            dto.setClientFullName("Cliente (Histórico)");
            dto.setVehicleDisplay("Vehículo (Histórico)");
            dto.setServiceType("Servicio");
            dto.setDescription("Detalle no disponible");
        }
        return dto;
    }
}

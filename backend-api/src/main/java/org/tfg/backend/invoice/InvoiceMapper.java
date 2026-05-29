package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.tfg.backend.appointment.Appointment;
import org.tfg.backend.appointment.AppointmentRepository;

@Component
@RequiredArgsConstructor
public class InvoiceMapper {

    private final AppointmentRepository appointmentRepository;

    public InvoiceDTO mapToDTO(Invoice invoice) {
        if (invoice == null) return null;
        Appointment appointment = appointmentRepository.findById(invoice.getAppointmentId()).orElse(null);
        return mapToDTO(invoice, appointment);
    }

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

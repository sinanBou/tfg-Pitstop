package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST que expone los servicios de consulta y creación de facturas.
 * Permite emitir facturas al completar citas de taller y recuperar el historial
 * por taller o por cita individual.
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Registra y genera una nueva factura en el sistema a partir de los datos recibidos.
     * Al completarse la cita correspondiente, esta cambia a estado completado de forma atómica.
     *
     * @param dto DTO con la información de facturación de la cita.
     * @return Respuesta HTTP con el DTO de la factura creada y el detalle de la cita asociada.
     */
    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestBody InvoiceDTO dto) {
        return ResponseEntity.ok(invoiceService.createInvoice(dto));
    }

    /**
     * Recupera el listado completo de facturas emitidas por un taller en particular.
     *
     * @param workshopId Identificador único del taller.
     * @return Respuesta HTTP con la lista de DTOs de las facturas del taller.
     */
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<InvoiceDTO>> getWorkshopInvoices(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByWorkshop(workshopId));
    }

    /**
     * Busca la factura asociada a una cita de taller específica.
     *
     * @param appointmentId Identificador de la cita asociada.
     * @return Respuesta HTTP con el DTO de la factura encontrada, o error 404 si no existe.
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<InvoiceDTO> getInvoiceByAppointment(@PathVariable UUID appointmentId) {
        InvoiceDTO invoice = invoiceService.getInvoiceByAppointment(appointmentId);
        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(invoice);
    }
}

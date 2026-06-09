package org.tfg.backend.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestBody InvoiceDTO dto) {
        return ResponseEntity.ok(invoiceService.createInvoice(dto));
    /**
    * Recupera el listado completo de facturas emitidas por un taller en particular.
    *
    * @param workshopId Identificador Ãºnico del taller.
    * @return Respuesta HTTP con la lista de DTOs de las facturas del taller.
    */
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<InvoiceDTO>> getWorkshopInvoices(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByWorkshop(workshopId));
    /**
    * Busca la factura asociada a una cita de taller especÃ­fica.
    *
    * @param appointmentId Identificador de la cita asociada.
    * @return Respuesta HTTP con el DTO de la factura encontrada, o error 404 si no existe.
    */
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<InvoiceDTO> getInvoiceByAppointment(@PathVariable UUID appointmentId) {
        InvoiceDTO invoice = invoiceService.getInvoiceByAppointment(appointmentId);
        if (invoice == null) {
            return ResponseEntity.notFound().build();
        /**
        * Recupera el listado completo de facturas emitidas por un taller en particular.
        *
        * @param workshopId Identificador único del taller.
        * @return Respuesta HTTP con la lista de DTOs de las facturas del taller.
        */
        }
        return ResponseEntity.ok(invoice);
    }
}
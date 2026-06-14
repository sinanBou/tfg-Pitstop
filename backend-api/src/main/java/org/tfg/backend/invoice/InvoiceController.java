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

    private final InvoiceLookupService invoiceLookupService;
    private final InvoiceAdminService invoiceAdminService;

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestBody InvoiceDTO dto) {
        return ResponseEntity.ok(invoiceAdminService.createInvoice(dto));
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<InvoiceDTO>> getWorkshopInvoices(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(invoiceLookupService.getInvoicesByWorkshop(workshopId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<InvoiceDTO> getInvoiceByAppointment(@PathVariable UUID appointmentId) {
        InvoiceDTO invoice = invoiceLookupService.getInvoiceByAppointment(appointmentId);
        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(invoice);
    }
}
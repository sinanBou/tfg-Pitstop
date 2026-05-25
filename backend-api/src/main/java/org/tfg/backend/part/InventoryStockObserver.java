package org.tfg.backend.part;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class InventoryStockObserver {

    @EventListener
    public void handleLowStock(LowStockEvent event) {
        System.out.printf("[ALERTA DE ALMACÉN] El repuesto %s (ID: %s) ha caído por debajo de su umbral de aviso. Stock actual: %d, Umbral límite: %d%n",
                event.getPartName(),
                event.getPartId(),
                event.getCurrentStock(),
                event.getThreshold());
    }
}

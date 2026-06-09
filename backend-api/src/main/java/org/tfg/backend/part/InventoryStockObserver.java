package org.tfg.backend.part;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observador encargado de monitorizar el nivel de stock en el inventario del taller.
 * Escucha los eventos de bajo stock y genera las alertas de aviso correspondientes.
 */
@Component
public class InventoryStockObserver {

    /**
     * Maneja el evento de bajo stock imprimiendo una alerta en la consola del sistema.
     *
     * @param event El evento que contiene la información del repuesto con bajo stock.
     */
    @EventListener
    public void handleLowStock(LowStockEvent event) {
        System.out.printf("[ALERTA DE ALMACÉN] El repuesto %s (ID: %s) ha caído por debajo de su umbral de aviso. Stock actual: %d, Umbral límite: %d%n",
                event.getPartName(),
                event.getPartId(),
                event.getCurrentStock(),
                event.getThreshold());
    }
}


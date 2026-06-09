package org.tfg.backend.part;

import org.springframework.context.ApplicationEvent;
import java.util.UUID;

/**
 * Evento de aplicación publicado cuando las existencias de un repuesto en el inventario
 * caen por debajo del umbral mínimo de seguridad establecido.
 */
public class LowStockEvent extends ApplicationEvent {
    private final UUID partId;
    private final String partName;
    private final int currentStock;
    private final int threshold;

    /**
     * Crea una nueva instancia del evento de bajo stock.
     *
     * @param source El objeto que originó el evento.
     * @param partId El identificador único del repuesto.
     * @param partName El nombre o descripción del repuesto.
     * @param currentStock Las existencias actuales en el inventario.
     * @param threshold El umbral mínimo establecido para el repuesto.
     */
    public LowStockEvent(Object source, UUID partId, String partName, int currentStock, int threshold) {
        super(source);
        this.partId = partId;
        this.partName = partName;
        this.currentStock = currentStock;
        this.threshold = threshold;
    }

    /**
     * Obtiene el identificador único del repuesto.
     * @return El UUID del repuesto.
     */
    public UUID getPartId() { return partId; }

    /**
     * Obtiene el nombre del repuesto.
     * @return El nombre del repuesto.
     */
    public String getPartName() { return partName; }

    /**
     * Obtiene el stock actual disponible.
     * @return La cantidad de existencias actuales.
     */
    public int getCurrentStock() { return currentStock; }

    /**
     * Obtiene el umbral mínimo de seguridad.
     * @return El valor del umbral de stock bajo.
     */
    public int getThreshold() { return threshold; }
}


package org.tfg.backend.part;

import org.springframework.context.ApplicationEvent;
import java.util.UUID;

public class LowStockEvent extends ApplicationEvent {
    private final UUID partId;
    private final String partName;
    private final int currentStock;
    private final int threshold;

    public LowStockEvent(Object source, UUID partId, String partName, int currentStock, int threshold) {
        super(source);
        this.partId = partId;
        this.partName = partName;
        this.currentStock = currentStock;
        this.threshold = threshold;
    }

    public UUID getPartId() { return partId; }
    public String getPartName() { return partName; }
    public int getCurrentStock() { return currentStock; }
    public int getThreshold() { return threshold; }
}

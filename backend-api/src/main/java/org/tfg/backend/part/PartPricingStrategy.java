package org.tfg.backend.part;

/**
 * Interfaz que define la estrategia para calcular el precio de un repuesto.
 * Permite aplicar diferentes políticas de precios (por ejemplo, precio estándar o con descuento)
 * de forma dinámica sobre el precio base de venta.
 */
public interface PartPricingStrategy {
    /**
     * Calcula el precio final del repuesto basándose en la política de precios de la estrategia.
     *
     * @param baseRetailPrice Precio base de venta al público.
     * @return El precio calculado.
     */
    double calculatePrice(double baseRetailPrice);
}
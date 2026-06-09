package org.tfg.backend.part;

/**
 * Interfaz que define la estrategia para calcular el precio de un repuesto.
 * Permite aplicar diferentes políticas de precios (por ejemplo, precio estándar o con descuento)
 * de forma dinámica sobre el precio base de venta.
 */
public interface PartPricingStrategy {
    /**
     * Calcula el precio final del repuesto aplicando la estrategia específica.
     *
     * @param baseRetailPrice El precio base de venta al público del repuesto.
     * @return El precio final calculado.
     */
    double calculatePrice(double baseRetailPrice);
}


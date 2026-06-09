package org.tfg.backend.part;

/**
 * Estrategia de precios estándar que no aplica ningún descuento ni recargo.
 * Devuelve el precio base de venta al público sin modificaciones.
 */
public class StandardPricingStrategy implements PartPricingStrategy {
    /**
     * Calcula el precio final, que en este caso es idéntico al precio base.
     *
     * @param baseRetailPrice El precio base de venta al público del repuesto.
     * @return El mismo precio base de venta sin alteraciones.
     */
    @Override
    public double calculatePrice(double baseRetailPrice) {
        return baseRetailPrice;
    }
}


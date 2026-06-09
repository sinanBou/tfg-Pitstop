package org.tfg.backend.part;

/**
 * Estrategia de precios que aplica un descuento porcentual sobre el precio base del repuesto.
 */
public class DiscountPricingStrategy implements PartPricingStrategy {
    /**
     * Tasa de descuento expresada como fracción (ej: 0.10 para un 10% de descuento).
     */
    private final double discountRate;

    /**
     * Crea una estrategia de precios con la tasa de descuento especificada.
     *
     * @param discountRate Tasa de descuento (ej. 0.15 para el 15%).
     */
    public DiscountPricingStrategy(double discountRate) {
        this.discountRate = discountRate;
    }

    /**
     * Calcula el precio final aplicando el descuento sobre el precio base de venta.
     *
     * @param baseRetailPrice Precio base de venta al público.
     * @return Precio calculado con el descuento aplicado.
     */
    @Override
    public double calculatePrice(double baseRetailPrice) {
        return baseRetailPrice * (1.0 - discountRate);
    }
}
package org.tfg.backend.part;

/**
 * Estrategia de precios que aplica un descuento porcentual sobre el precio base del repuesto.
 */
public class DiscountPricingStrategy implements PartPricingStrategy {
    private final double discountRate;

    /**
     * Construye la estrategia con una tasa de descuento específica.
     *
     * @param discountRate La tasa de descuento a aplicar (ej. 0.15 para un 15% de descuento).
     */
    public DiscountPricingStrategy(double discountRate) {
        this.discountRate = discountRate;
    }

    /**
     * Calcula el precio final aplicando la tasa de descuento sobre el precio base.
     *
     * @param baseRetailPrice El precio base de venta al público del repuesto.
     * @return El precio final con el descuento aplicado.
     */
    @Override
    public double calculatePrice(double baseRetailPrice) {
        return baseRetailPrice * (1.0 - discountRate);
    }
}


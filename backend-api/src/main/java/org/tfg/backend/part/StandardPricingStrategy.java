package org.tfg.backend.part;

/**
 * Estrategia de precios estándar que no aplica ningún descuento ni recargo.
 * Devuelve el precio base de venta al público sin modificaciones.
 */
public class StandardPricingStrategy implements PartPricingStrategy {
    /**
     * Devuelve el precio de venta original sin aplicar ningún tipo de modificación o descuento.
     *
     * @param baseRetailPrice Precio base de venta al público.
     * @return El mismo precio de venta al público sin alterar.
     */
    @Override
    public double calculatePrice(double baseRetailPrice) {
        return baseRetailPrice;
    }
}
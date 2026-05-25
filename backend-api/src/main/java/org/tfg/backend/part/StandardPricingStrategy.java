package org.tfg.backend.part;

public class StandardPricingStrategy implements PartPricingStrategy {
    @Override
    public double calculatePrice(double baseRetailPrice) {
        return baseRetailPrice;
    }
}

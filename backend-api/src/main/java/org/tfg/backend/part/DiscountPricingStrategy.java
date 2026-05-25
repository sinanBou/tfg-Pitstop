package org.tfg.backend.part;

public class DiscountPricingStrategy implements PartPricingStrategy {
    private final double discountRate;

    public DiscountPricingStrategy(double discountRate) {
        this.discountRate = discountRate;
    }

    @Override
    public double calculatePrice(double baseRetailPrice) {
        return baseRetailPrice * (1.0 - discountRate);
    }
}

package com.example.SocialMedia.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DeliveryService {

    @Value("${app.delivery.charge-inside-dhaka:60}")
    private BigDecimal chargeInsideDhaka;

    @Value("${app.delivery.charge-outside-dhaka:120}")
    private BigDecimal chargeOutsideDhaka;

    @Value("${app.delivery.free-shipping-threshold:5000}")
    private BigDecimal freeShippingThreshold;

    public BigDecimal calculateDeliveryCharge(BigDecimal subtotal, String district, String division) {
        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }

        // Free delivery rule across Bangladesh if subtotal meets or exceeds threshold
        if (freeShippingThreshold.compareTo(BigDecimal.ZERO) > 0 
                && subtotal.compareTo(freeShippingThreshold) >= 0) {
            return BigDecimal.ZERO;
        }

        // Location check: Inside Dhaka vs Outside Dhaka
        if (isInsideDhaka(district, division)) {
            return chargeInsideDhaka;
        } else {
            return chargeOutsideDhaka;
        }
    }

    public boolean isInsideDhaka(String district, String division) {
        if (district != null && district.trim().equalsIgnoreCase("dhaka")) {
            return true;
        }
        // Fallback: If district not specified but division is explicitly Dhaka
        if (district == null && division != null && division.trim().equalsIgnoreCase("dhaka")) {
            return true;
        }
        return false;
    }

    public BigDecimal getChargeInsideDhaka() {
        return chargeInsideDhaka;
    }

    public BigDecimal getChargeOutsideDhaka() {
        return chargeOutsideDhaka;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }
}

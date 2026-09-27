package com.example.SocialMedia.cart.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Cart {

    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal deliveryCharge = BigDecimal.valueOf(60); // Default BDT 60 standard inside Dhaka
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;
    private String currency = "BDT";

    public Cart() {
    }

    public Cart(String userId) {
        this.userId = userId;
        recalculate();
    }

    public void recalculate() {
        this.subtotal = items.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Free delivery in Bangladesh on orders above BDT 5,000
        if (this.subtotal.compareTo(BigDecimal.valueOf(5000)) >= 0 || items.isEmpty()) {
            this.deliveryCharge = items.isEmpty() ? BigDecimal.ZERO : BigDecimal.ZERO;
        } else {
            this.deliveryCharge = BigDecimal.valueOf(60);
        }

        this.total = this.subtotal.add(this.deliveryCharge).subtract(this.discount);
        if (this.total.compareTo(BigDecimal.ZERO) < 0) {
            this.total = BigDecimal.ZERO;
        }
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
        recalculate();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDeliveryCharge() {
        return deliveryCharge;
    }

    public void setDeliveryCharge(BigDecimal deliveryCharge) {
        this.deliveryCharge = deliveryCharge;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}

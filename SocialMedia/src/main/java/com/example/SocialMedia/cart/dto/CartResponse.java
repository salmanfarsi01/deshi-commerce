package com.example.SocialMedia.cart.dto;

import com.example.SocialMedia.cart.model.Cart;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CartResponse {

    private List<CartItemResponse> items = new ArrayList<>();
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;
    private BigDecimal total;
    private String currency;

    public CartResponse() {
    }

    public static CartResponse fromEntity(Cart cart) {
        if (cart == null) {
            return null;
        }
        CartResponse dto = new CartResponse();
        dto.setSubtotal(cart.getSubtotal());
        dto.setDeliveryCharge(cart.getDeliveryCharge());
        dto.setDiscount(cart.getDiscount());
        dto.setTotal(cart.getTotal());
        dto.setCurrency(cart.getCurrency());
        if (cart.getItems() != null) {
            dto.setItems(cart.getItems().stream()
                    .map(CartItemResponse::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
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

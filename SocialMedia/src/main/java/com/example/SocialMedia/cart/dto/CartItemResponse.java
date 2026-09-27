package com.example.SocialMedia.cart.dto;

import com.example.SocialMedia.cart.model.CartItem;

import java.math.BigDecimal;

public class CartItemResponse {

    private String cartItemId;
    private String productId;
    private String name;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public CartItemResponse() {
    }

    public CartItemResponse(String cartItemId, String productId, String name, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.cartItemId = cartItemId;
        this.productId = productId;
        this.name = name;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null) {
            return null;
        }
        return new CartItemResponse(
                item.getCartItemId(),
                item.getProductId(),
                item.getProductName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }

    public String getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(String cartItemId) {
        this.cartItemId = cartItemId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}

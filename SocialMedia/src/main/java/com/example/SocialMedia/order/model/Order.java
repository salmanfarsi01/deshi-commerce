package com.example.SocialMedia.order.model;

import com.example.SocialMedia.address.model.Address;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Order {

    private String id;
    private String orderNumber;
    private String userId;
    private List<OrderItem> items = new ArrayList<>();
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;
    private BigDecimal total;
    private String currency = "BDT";
    private Address shippingAddress;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus status;
    private String notes;
    private String tenantId;
    private Instant createdAt;
    private Instant updatedAt;

    public Order() {
        this.tenantId = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Order(String id, String orderNumber, String userId, List<OrderItem> items,
                 BigDecimal subtotal, BigDecimal deliveryCharge, BigDecimal discount,
                 BigDecimal total, String currency, Address shippingAddress,
                 PaymentMethod paymentMethod, PaymentStatus paymentStatus,
                 OrderStatus status, String notes) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.items = items;
        this.subtotal = subtotal;
        this.deliveryCharge = deliveryCharge;
        this.discount = discount;
        this.total = total;
        this.currency = currency != null ? currency : "BDT";
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.notes = notes;
        this.tenantId = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
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

    public Address getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(Address shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

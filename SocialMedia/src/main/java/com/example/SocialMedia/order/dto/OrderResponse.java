package com.example.SocialMedia.order.dto;

import com.example.SocialMedia.address.dto.AddressResponse;
import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.payment.dto.PaymentResponse;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {

    private String id;
    private String orderNumber;
    private String userId;
    private List<OrderItemResponse> items = new ArrayList<>();
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;
    private BigDecimal total;
    private String currency;
    private AddressResponse shippingAddress;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus status;
    private String notes;
    private String courierName;
    private String trackingNumber;
    private String trackingUrl;
    private String estimatedDeliveryDate;
    private PaymentResponse payment;
    private Instant createdAt;
    private Instant updatedAt;

    public OrderResponse() {
    }

    public static OrderResponse fromEntity(Order order, PaymentResponse payment) {
        if (order == null) {
            return null;
        }
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setSubtotal(order.getSubtotal());
        dto.setDeliveryCharge(order.getDeliveryCharge());
        dto.setDiscount(order.getDiscount());
        dto.setTotal(order.getTotal());
        dto.setCurrency(order.getCurrency());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setStatus(order.getStatus());
        dto.setNotes(order.getNotes());
        dto.setCourierName(order.getCourierName());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setTrackingUrl(order.getTrackingUrl());
        dto.setEstimatedDeliveryDate(order.getEstimatedDeliveryDate());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setPayment(payment);

        if (order.getShippingAddress() != null) {
            dto.setShippingAddress(AddressResponse.fromEntity(order.getShippingAddress()));
        }

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                    .map(OrderItemResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
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

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
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

    public AddressResponse getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(AddressResponse shippingAddress) {
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
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public PaymentResponse getPayment() {
        return payment;
    }

    public void setPayment(PaymentResponse payment) {
        this.payment = payment;
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

    public String getCourierName() {
        return courierName;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getTrackingUrl() {
        return trackingUrl;
    }

    public void setTrackingUrl(String trackingUrl) {
        this.trackingUrl = trackingUrl;
    }

    public String getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(String estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }
}

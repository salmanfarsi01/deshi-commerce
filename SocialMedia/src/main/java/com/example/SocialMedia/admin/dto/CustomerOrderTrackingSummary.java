package com.example.SocialMedia.admin.dto;

import com.example.SocialMedia.order.dto.OrderResponse;

import java.math.BigDecimal;
import java.util.List;

public class CustomerOrderTrackingSummary {

    private String userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private int totalOrdersCount;
    private BigDecimal totalAmountSpent;
    private int pendingOrdersCount;
    private int deliveredOrdersCount;
    private List<OrderResponse> orders;

    public CustomerOrderTrackingSummary() {
    }

    public CustomerOrderTrackingSummary(String userId, String customerName, String customerPhone,
                                       String customerEmail, int totalOrdersCount, BigDecimal totalAmountSpent,
                                       int pendingOrdersCount, int deliveredOrdersCount, List<OrderResponse> orders) {
        this.userId = userId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.totalOrdersCount = totalOrdersCount;
        this.totalAmountSpent = totalAmountSpent;
        this.pendingOrdersCount = pendingOrdersCount;
        this.deliveredOrdersCount = deliveredOrdersCount;
        this.orders = orders;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public int getTotalOrdersCount() {
        return totalOrdersCount;
    }

    public void setTotalOrdersCount(int totalOrdersCount) {
        this.totalOrdersCount = totalOrdersCount;
    }

    public BigDecimal getTotalAmountSpent() {
        return totalAmountSpent;
    }

    public void setTotalAmountSpent(BigDecimal totalAmountSpent) {
        this.totalAmountSpent = totalAmountSpent;
    }

    public int getPendingOrdersCount() {
        return pendingOrdersCount;
    }

    public void setPendingOrdersCount(int pendingOrdersCount) {
        this.pendingOrdersCount = pendingOrdersCount;
    }

    public int getDeliveredOrdersCount() {
        return deliveredOrdersCount;
    }

    public void setDeliveredOrdersCount(int deliveredOrdersCount) {
        this.deliveredOrdersCount = deliveredOrdersCount;
    }

    public List<OrderResponse> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderResponse> orders) {
        this.orders = orders;
    }
}

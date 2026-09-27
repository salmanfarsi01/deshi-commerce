package com.example.SocialMedia.admin.dto;

import java.math.BigDecimal;

public class DashboardSummaryResponse {

    private long totalOrders;
    private BigDecimal totalSales;
    private long pendingOrders;
    private long totalCustomers;
    private long totalProducts;
    private long lowStockProducts;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(long totalOrders, BigDecimal totalSales, long pendingOrders,
                                    long totalCustomers, long totalProducts, long lowStockProducts) {
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
        this.pendingOrders = pendingOrders;
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
}

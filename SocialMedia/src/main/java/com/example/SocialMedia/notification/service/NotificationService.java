package com.example.SocialMedia.notification.service;

import com.example.SocialMedia.notification.model.NotificationLog;
import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.payment.model.PaymentRecord;
import com.example.SocialMedia.user.model.User;

import java.util.List;

public interface NotificationService {

    void notifyOrderPlaced(Order order, User user);

    void notifyPaymentReceived(Order order, PaymentRecord payment, User user);

    void notifyOrderShipped(Order order, User user);

    void notifyOrderDelivered(Order order, User user);

    void notifyOrderCancelled(Order order, User user);

    List<NotificationLog> getOrderNotifications(String orderId);

    List<NotificationLog> getAllNotifications();
}

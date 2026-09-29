package com.example.SocialMedia.order.repository;

import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpringDataOrderRepository extends JpaRepository<Order, String> {

    Optional<Order> findByOrderNumberIgnoreCase(String orderNumber);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:userId IS NULL OR :userId = '' OR LOWER(o.userId) = LOWER(:userId)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (o.shippingAddress IS NOT NULL AND (" +
           "  LOWER(o.shippingAddress.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(o.shippingAddress.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(o.shippingAddress.district) LIKE LOWER(CONCAT('%', :search, '%'))" +
           " ))) " +
           "ORDER BY o.createdAt DESC")
    List<Order> findWithFilter(
            @Param("status") OrderStatus status,
            @Param("userId") String userId,
            @Param("search") String search
    );
}

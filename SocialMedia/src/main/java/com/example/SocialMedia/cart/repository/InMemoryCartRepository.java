package com.example.SocialMedia.cart.repository;

import com.example.SocialMedia.cart.model.Cart;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryCartRepository implements CartRepository {

    private final Map<String, Cart> userCarts = new ConcurrentHashMap<>();

    @Override
    public Cart save(Cart cart) {
        userCarts.put(cart.getUserId(), cart);
        return cart;
    }

    @Override
    public Optional<Cart> findByUserId(String userId) {
        return Optional.ofNullable(userCarts.get(userId));
    }

    @Override
    public void deleteByUserId(String userId) {
        userCarts.remove(userId);
    }
}

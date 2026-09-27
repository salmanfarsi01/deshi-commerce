package com.example.SocialMedia.cart.repository;

import com.example.SocialMedia.cart.model.Cart;
import java.util.Optional;

public interface CartRepository {

    Cart save(Cart cart);

    Optional<Cart> findByUserId(String userId);

    void deleteByUserId(String userId);
}

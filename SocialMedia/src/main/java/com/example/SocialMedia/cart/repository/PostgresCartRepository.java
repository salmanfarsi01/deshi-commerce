package com.example.SocialMedia.cart.repository;

import com.example.SocialMedia.cart.model.Cart;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
@Primary
public class PostgresCartRepository implements CartRepository {

    private final SpringDataCartRepository springDataCartRepository;

    public PostgresCartRepository(SpringDataCartRepository springDataCartRepository) {
        this.springDataCartRepository = springDataCartRepository;
    }

    @Override
    @Transactional
    public Cart save(Cart cart) {
        return springDataCartRepository.save(cart);
    }

    @Override
    public Optional<Cart> findByUserId(String userId) {
        return springDataCartRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteByUserId(String userId) {
        springDataCartRepository.deleteByUserId(userId);
    }
}

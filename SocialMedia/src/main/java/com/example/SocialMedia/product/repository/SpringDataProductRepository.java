package com.example.SocialMedia.product.repository;

import com.example.SocialMedia.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCase(String slug);
}

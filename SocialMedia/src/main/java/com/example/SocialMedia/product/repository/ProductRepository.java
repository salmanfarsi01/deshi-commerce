package com.example.SocialMedia.product.repository;

import com.example.SocialMedia.product.model.Product;
import java.util.List;
import java.util.Optional;

public interface ProductRepository {

    Product save(Product product);

    Optional<Product> findById(String id);

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Product> findAll();

    void deleteById(String id);
}

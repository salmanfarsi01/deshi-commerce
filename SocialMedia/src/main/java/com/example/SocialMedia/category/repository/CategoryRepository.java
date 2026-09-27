package com.example.SocialMedia.category.repository;

import com.example.SocialMedia.category.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository {

    Category save(Category category);

    Optional<Category> findById(String id);

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Category> findAll();

    void deleteById(String id);
}

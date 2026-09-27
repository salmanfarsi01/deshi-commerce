package com.example.SocialMedia.category.service;

import com.example.SocialMedia.category.dto.CategoryResponse;
import com.example.SocialMedia.category.dto.CreateCategoryRequest;
import com.example.SocialMedia.category.dto.UpdateCategoryRequest;
import com.example.SocialMedia.category.model.Category;
import com.example.SocialMedia.category.repository.CategoryRepository;
import com.example.SocialMedia.common.exception.ConflictException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return CategoryResponse.fromEntity(category);
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return CategoryResponse.fromEntity(category);
    }

    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Category with slug '" + slug + "' already exists", "CATEGORY_SLUG_CONFLICT");
        }

        String id = "cat_" + UUID.randomUUID().toString().substring(0, 8);
        Category category = new Category(
                id,
                request.getName().trim(),
                slug,
                request.getDescription(),
                true
        );

        categoryRepository.save(category);
        return CategoryResponse.fromEntity(category);
    }

    public CategoryResponse updateCategory(String id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setName(request.getName().trim());
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        categoryRepository.save(category);
        return CategoryResponse.fromEntity(category);
    }

    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.deleteById(category.getId());
    }

    private String toSlug(String input) {
        return input.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}

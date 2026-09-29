package com.example.SocialMedia.category.repository;

import com.example.SocialMedia.category.model.Category;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class PostgresCategoryRepository implements CategoryRepository {

    private final SpringDataCategoryRepository springDataCategoryRepository;

    public PostgresCategoryRepository(SpringDataCategoryRepository springDataCategoryRepository) {
        this.springDataCategoryRepository = springDataCategoryRepository;
    }

    @Override
    public Category save(Category category) {
        return springDataCategoryRepository.save(category);
    }

    @Override
    public Optional<Category> findById(String id) {
        return springDataCategoryRepository.findById(id);
    }

    @Override
    public Optional<Category> findBySlug(String slug) {
        return springDataCategoryRepository.findBySlugIgnoreCase(slug);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return springDataCategoryRepository.existsBySlugIgnoreCase(slug);
    }

    @Override
    public List<Category> findAll() {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        return springDataCategoryRepository.findAll().stream()
                .filter(c -> c.getTenantId() == null || c.getTenantId().equalsIgnoreCase(currentTenant))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        springDataCategoryRepository.deleteById(id);
    }
}

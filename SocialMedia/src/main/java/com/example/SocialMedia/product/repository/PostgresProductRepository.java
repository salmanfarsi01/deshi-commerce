package com.example.SocialMedia.product.repository;

import com.example.SocialMedia.product.model.Product;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class PostgresProductRepository implements ProductRepository {

    private final SpringDataProductRepository springDataProductRepository;

    public PostgresProductRepository(SpringDataProductRepository springDataProductRepository) {
        this.springDataProductRepository = springDataProductRepository;
    }

    @Override
    public Product save(Product product) {
        return springDataProductRepository.save(product);
    }

    @Override
    public Optional<Product> findById(String id) {
        return springDataProductRepository.findById(id);
    }

    @Override
    public Optional<Product> findBySlug(String slug) {
        return springDataProductRepository.findBySlugIgnoreCase(slug);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return springDataProductRepository.existsBySlugIgnoreCase(slug);
    }

    @Override
    public List<Product> findAll() {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        return springDataProductRepository.findAll().stream()
                .filter(p -> p.getTenantId() == null || p.getTenantId().equalsIgnoreCase(currentTenant))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        springDataProductRepository.deleteById(id);
    }
}

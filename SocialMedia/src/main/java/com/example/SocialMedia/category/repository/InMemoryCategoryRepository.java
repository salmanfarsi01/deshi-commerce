package com.example.SocialMedia.category.repository;

import com.example.SocialMedia.category.model.Category;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryCategoryRepository implements CategoryRepository {

    private final Map<String, Category> categoryMap = new ConcurrentHashMap<>();

    public InMemoryCategoryRepository() {
        Category cat1 = new Category("cat_01", "Mobile", "mobile", "Smartphones, feature phones, and mobile accessories", true);
        Category cat2 = new Category("cat_02", "Electronics", "electronics", "Laptops, audio, wearables, and gadgets", true);
        Category cat3 = new Category("cat_03", "Fashion", "fashion", "Men and women clothing, footwear, and accessories", true);
        Category cat4 = new Category("cat_04", "Home Appliance", "home-appliance", "Kitchen and home electronic appliances", true);

        categoryMap.put(cat1.getId(), cat1);
        categoryMap.put(cat2.getId(), cat2);
        categoryMap.put(cat3.getId(), cat3);
        categoryMap.put(cat4.getId(), cat4);
    }

    @Override
    public Category save(Category category) {
        categoryMap.put(category.getId(), category);
        return category;
    }

    @Override
    public Optional<Category> findById(String id) {
        return Optional.ofNullable(categoryMap.get(id));
    }

    @Override
    public Optional<Category> findBySlug(String slug) {
        return categoryMap.values().stream()
                .filter(c -> slug.equalsIgnoreCase(c.getSlug()))
                .findFirst();
    }

    @Override
    public boolean existsBySlug(String slug) {
        return categoryMap.values().stream()
                .anyMatch(c -> slug.equalsIgnoreCase(c.getSlug()));
    }

    @Override
    public List<Category> findAll() {
        return new ArrayList<>(categoryMap.values());
    }

    @Override
    public void deleteById(String id) {
        categoryMap.remove(id);
    }
}

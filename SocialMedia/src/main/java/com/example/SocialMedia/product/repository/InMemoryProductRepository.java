package com.example.SocialMedia.product.repository;

import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.model.ProductImage;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryProductRepository implements ProductRepository {

    private final Map<String, Product> productMap = new ConcurrentHashMap<>();

    public InMemoryProductRepository() {
        seedProducts();
    }

    private void seedProducts() {
        Product p1 = new Product(
                "prd_01",
                "Samsung Galaxy A55 5G",
                "samsung-galaxy-a55",
                "Flagship style design with Awesome Iceblue finish, Super AMOLED 120Hz display, and 50MP OIS camera.",
                BigDecimal.valueOf(44999),
                BigDecimal.valueOf(41999),
                "BDT",
                25,
                "cat_01",
                List.of(new ProductImage("https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600", "Samsung Galaxy A55 Front View")),
                true,
                4.8,
                Instant.now()
        );

        Product p2 = new Product(
                "prd_02",
                "Xiaomi Redmi Note 13 Pro",
                "xiaomi-redmi-note-13-pro",
                "200MP camera with ultra-clear shots, 120Hz AMOLED curved display, and 67W turbo fast charging.",
                BigDecimal.valueOf(32999),
                BigDecimal.valueOf(29999),
                "BDT",
                40,
                "cat_01",
                List.of(new ProductImage("https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600", "Redmi Note 13 Pro")),
                true,
                4.6,
                Instant.now()
        );

        Product p3 = new Product(
                "prd_03",
                "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
                "sony-wh-1000xm5",
                "Industry-leading noise cancellation with two processors and 8 microphones for extraordinary sound quality.",
                BigDecimal.valueOf(38500),
                BigDecimal.valueOf(35000),
                "BDT",
                12,
                "cat_02",
                List.of(new ProductImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", "Sony WH-1000XM5 Black")),
                true,
                4.9,
                Instant.now()
        );

        Product p4 = new Product(
                "prd_04",
                "Aarong Handcrafted Silk Cotton Festive Panjabi",
                "aarong-silk-cotton-panjabi",
                "Elegant dark navy embroidered neckline panjabi crafted with premium breathable silk-cotton blend fabric.",
                BigDecimal.valueOf(4500),
                BigDecimal.valueOf(3999),
                "BDT",
                50,
                "cat_03",
                List.of(new ProductImage("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600", "Men Festive Panjabi")),
                true,
                4.7,
                Instant.now()
        );

        Product p5 = new Product(
                "prd_05",
                "Apex Men Genuine Leather Formal Oxford Shoes",
                "apex-genuine-leather-oxford-shoes",
                "Handcrafted from genuine full-grain leather with cushioned inner sole for all-day comfort.",
                BigDecimal.valueOf(5200),
                BigDecimal.valueOf(4800),
                "BDT",
                30,
                "cat_03",
                List.of(new ProductImage("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600", "Apex Leather Shoes")),
                true,
                4.5,
                Instant.now()
        );

        productMap.put(p1.getId(), p1);
        productMap.put(p2.getId(), p2);
        productMap.put(p3.getId(), p3);
        productMap.put(p4.getId(), p4);
        productMap.put(p5.getId(), p5);
    }

    @Override
    public Product save(Product product) {
        productMap.put(product.getId(), product);
        return product;
    }

    @Override
    public Optional<Product> findById(String id) {
        return Optional.ofNullable(productMap.get(id));
    }

    @Override
    public Optional<Product> findBySlug(String slug) {
        return productMap.values().stream()
                .filter(p -> slug.equalsIgnoreCase(p.getSlug()))
                .findFirst();
    }

    @Override
    public boolean existsBySlug(String slug) {
        return productMap.values().stream()
                .anyMatch(p -> slug.equalsIgnoreCase(p.getSlug()));
    }

    @Override
    public List<Product> findAll() {
        return new ArrayList<>(productMap.values());
    }

    @Override
    public void deleteById(String id) {
        productMap.remove(id);
    }
}

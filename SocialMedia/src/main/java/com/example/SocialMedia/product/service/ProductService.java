package com.example.SocialMedia.product.service;

import com.example.SocialMedia.category.dto.CategoryResponse;
import com.example.SocialMedia.category.service.CategoryService;
import com.example.SocialMedia.common.exception.ConflictException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.common.response.PagedResponse;
import com.example.SocialMedia.product.dto.CreateProductRequest;
import com.example.SocialMedia.product.dto.ProductFilter;
import com.example.SocialMedia.product.dto.ProductResponse;
import com.example.SocialMedia.product.dto.UpdateProductRequest;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.model.ProductImage;
import com.example.SocialMedia.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    public ProductService(ProductRepository productRepository, CategoryService categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }

    public PagedResponse<ProductResponse> getProducts(ProductFilter filter) {
        List<Product> all = productRepository.findAll();

        // 1. Filter by category
        if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
            String catParam = filter.getCategory().trim().toLowerCase();
            all = all.stream().filter(p -> {
                if (p.getCategoryId().equalsIgnoreCase(catParam)) return true;
                try {
                    CategoryResponse cat = categoryService.getCategoryById(p.getCategoryId());
                    return cat.getSlug().equalsIgnoreCase(catParam);
                } catch (Exception e) {
                    return false;
                }
            }).collect(Collectors.toList());
        }

        // 2. Filter by search keyword
        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            String keyword = filter.getSearch().trim().toLowerCase();
            all = all.stream().filter(p ->
                    p.getName().toLowerCase().contains(keyword) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(keyword))
            ).collect(Collectors.toList());
        }

        // 3. Filter by price range
        if (filter.getMinPrice() != null) {
            all = all.stream()
                    .filter(p -> (p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice())
                            .compareTo(filter.getMinPrice()) >= 0)
                    .collect(Collectors.toList());
        }
        if (filter.getMaxPrice() != null) {
            all = all.stream()
                    .filter(p -> (p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice())
                            .compareTo(filter.getMaxPrice()) <= 0)
                    .collect(Collectors.toList());
        }

        // 4. Filter by availability
        if (filter.getAvailability() != null && filter.getAvailability()) {
            all = all.stream().filter(Product::isAvailable).collect(Collectors.toList());
        }

        // 5. Sort
        if ("price_asc".equalsIgnoreCase(filter.getSort())) {
            all.sort(Comparator.comparing(p -> (p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice())));
        } else if ("price_desc".equalsIgnoreCase(filter.getSort())) {
            all.sort((p1, p2) -> (p2.getDiscountPrice() != null ? p2.getDiscountPrice() : p2.getPrice())
                    .compareTo(p1.getDiscountPrice() != null ? p1.getDiscountPrice() : p1.getPrice()));
        } else if ("rating".equalsIgnoreCase(filter.getSort())) {
            all.sort((p1, p2) -> Double.compare(p2.getRating(), p1.getRating()));
        } else {
            // Default newest
            all.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
        }

        // 6. Pagination
        long totalItems = all.size();
        int fromIndex = filter.getPage() * filter.getSize();
        List<Product> pageItems;
        if (fromIndex >= totalItems) {
            pageItems = Collections.emptyList();
        } else {
            int toIndex = Math.min(fromIndex + filter.getSize(), (int) totalItems);
            pageItems = all.subList(fromIndex, toIndex);
        }

        List<ProductResponse> dtos = pageItems.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(dtos, filter.getPage(), filter.getSize(), totalItems);
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return toResponseDto(product);
    }

    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return toResponseDto(product);
    }

    public Product getRawProduct(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    public ProductResponse createProduct(CreateProductRequest request) {
        // Validate category exists
        CategoryResponse category = categoryService.getCategoryById(request.getCategoryId());

        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            throw new ConflictException("Product with slug '" + slug + "' already exists", "PRODUCT_SLUG_CONFLICT");
        }

        String id = "prd_" + UUID.randomUUID().toString().substring(0, 8);
        List<ProductImage> images = request.getImages() != null
                ? request.getImages().stream().map(img -> new ProductImage(img.getUrl(), img.getAlt())).collect(Collectors.toList())
                : new ArrayList<>();

        Product product = new Product(
                id,
                request.getName().trim(),
                slug,
                request.getDescription(),
                request.getPrice(),
                request.getDiscountPrice(),
                "BDT",
                request.getStock(),
                category.getId(),
                images,
                true,
                5.0,
                Instant.now()
        );

        if (request.getBrand() != null && !request.getBrand().isBlank()) {
            product.setBrand(request.getBrand().trim());
        } else {
            product.setBrand("Deshi Commerce");
        }

        productRepository.save(product);
        return toResponseDto(product);
    }

    public ProductResponse updateProduct(String id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Validate category exists
        categoryService.getCategoryById(request.getCategoryId());

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStock(request.getStock());
        product.setCategoryId(request.getCategoryId());

        if (request.getImages() != null) {
            product.setImages(request.getImages().stream()
                    .map(img -> new ProductImage(img.getUrl(), img.getAlt()))
                    .collect(Collectors.toList()));
        }

        if (request.getBrand() != null) {
            product.setBrand(request.getBrand().trim());
        }

        if (request.getAvailable() != null) {
            product.setAvailable(request.getAvailable());
        }

        productRepository.save(product);
        return toResponseDto(product);
    }

    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.deleteById(product.getId());
    }

    public void decreaseStock(String productId, int quantity) {
        Product product = getRawProduct(productId);
        if (product.getStock() < quantity) {
            throw new ConflictException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStock());
        }
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    public void restoreStock(String productId, int quantity) {
        Product product = getRawProduct(productId);
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
    }

    private ProductResponse toResponseDto(Product product) {
        CategoryResponse category = null;
        try {
            category = categoryService.getCategoryById(product.getCategoryId());
        } catch (Exception ignored) {
        }
        return ProductResponse.fromEntity(product, category);
    }

    private String toSlug(String input) {
        return input.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}

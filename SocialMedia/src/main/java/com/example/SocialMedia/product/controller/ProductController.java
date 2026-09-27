package com.example.SocialMedia.product.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.common.response.PagedResponse;
import com.example.SocialMedia.product.dto.ProductFilter;
import com.example.SocialMedia.product.dto.ProductResponse;
import com.example.SocialMedia.product.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getProducts(
            @ModelAttribute ProductFilter filter) {
        PagedResponse<ProductResponse> pagedProducts = productService.getProducts(filter);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", pagedProducts));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String productId) {
        ProductResponse product = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }
}

package com.example.SocialMedia.cart.controller;

import com.example.SocialMedia.cart.dto.AddToCartRequest;
import com.example.SocialMedia.cart.dto.CartResponse;
import com.example.SocialMedia.cart.dto.UpdateCartItemRequest;
import com.example.SocialMedia.cart.service.CartService;
import com.example.SocialMedia.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        CartResponse cart = cartService.getCart(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(authHeader, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String productId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateItemQuantity(authHeader, productId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", cart));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String productId) {
        CartResponse cart = cartService.removeItem(authHeader, productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        cartService.clearCart(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}

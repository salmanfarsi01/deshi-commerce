package com.example.SocialMedia.cart.service;

import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.cart.dto.AddToCartRequest;
import com.example.SocialMedia.cart.dto.CartResponse;
import com.example.SocialMedia.cart.dto.UpdateCartItemRequest;
import com.example.SocialMedia.cart.model.Cart;
import com.example.SocialMedia.cart.model.CartItem;
import com.example.SocialMedia.cart.repository.CartRepository;
import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.service.ProductService;
import com.example.SocialMedia.user.model.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductService productService;
    private final AuthService authService;

    public CartService(CartRepository cartRepository, ProductService productService, AuthService authService) {
        this.cartRepository = cartRepository;
        this.productService = productService;
        this.authService = authService;
    }

    public CartResponse getCart(String authHeader) {
        User user = authService.getAuthenticatedUser(authHeader);
        Cart cart = getOrCreateCart(user.getId());
        return CartResponse.fromEntity(cart);
    }

    public CartResponse addItem(String authHeader, AddToCartRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);
        Cart cart = getOrCreateCart(user.getId());

        Product product = productService.getRawProduct(request.getProductId());
        if (!product.isAvailable() || product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStock() + ")");
        }

        BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();

        // Check if product already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getStock() < newQty) {
                throw new BadRequestException("Total requested quantity (" + newQty + ") exceeds available stock (" + product.getStock() + ")");
            }
            item.setUnitPrice(effectivePrice);
            item.updateQuantity(newQty);
        } else {
            String cartItemId = "ci_" + UUID.randomUUID().toString().substring(0, 8);
            CartItem newItem = new CartItem(
                    cartItemId,
                    product.getId(),
                    product.getName(),
                    effectivePrice,
                    request.getQuantity()
            );
            cart.getItems().add(newItem);
        }

        cart.recalculate();
        cartRepository.save(cart);
        return CartResponse.fromEntity(cart);
    }

    public CartResponse updateItemQuantity(String authHeader, String productId, UpdateCartItemRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);
        Cart cart = getOrCreateCart(user.getId());

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId) || i.getCartItemId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        Product product = productService.getRawProduct(item.getProductId());
        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStock() + ")");
        }

        BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
        item.setUnitPrice(effectivePrice);
        item.updateQuantity(request.getQuantity());

        cart.recalculate();
        cartRepository.save(cart);
        return CartResponse.fromEntity(cart);
    }

    public CartResponse removeItem(String authHeader, String productId) {
        User user = authService.getAuthenticatedUser(authHeader);
        Cart cart = getOrCreateCart(user.getId());

        boolean removed = cart.getItems().removeIf(i -> i.getProductId().equals(productId) || i.getCartItemId().equals(productId));
        if (!removed) {
            throw new ResourceNotFoundException("Item not found in cart");
        }

        cart.recalculate();
        cartRepository.save(cart);
        return CartResponse.fromEntity(cart);
    }

    public void clearCart(String authHeader) {
        User user = authService.getAuthenticatedUser(authHeader);
        Cart cart = getOrCreateCart(user.getId());
        cart.getItems().clear();
        cart.recalculate();
        cartRepository.save(cart);
    }

    public Cart getRawCart(String userId) {
        return getOrCreateCart(userId);
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart(userId);
            return cartRepository.save(newCart);
        });
    }
}

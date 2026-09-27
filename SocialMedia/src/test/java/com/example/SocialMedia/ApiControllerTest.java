package com.example.SocialMedia;

import com.example.SocialMedia.admin.controller.AdminDashboardController;
import com.example.SocialMedia.admin.dto.DashboardSummaryResponse;
import com.example.SocialMedia.auth.controller.AuthController;
import com.example.SocialMedia.auth.dto.LoginRequest;
import com.example.SocialMedia.auth.dto.RefreshTokenRequest;
import com.example.SocialMedia.auth.dto.RegisterRequest;
import com.example.SocialMedia.auth.dto.TokenResponse;
import com.example.SocialMedia.cart.controller.CartController;
import com.example.SocialMedia.cart.dto.AddToCartRequest;
import com.example.SocialMedia.cart.dto.CartResponse;
import com.example.SocialMedia.category.controller.CategoryController;
import com.example.SocialMedia.category.dto.CategoryResponse;
import com.example.SocialMedia.common.exception.UnauthorizedException;
import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.common.response.PagedResponse;
import com.example.SocialMedia.common.security.jwt.JwtTokenProvider;
import com.example.SocialMedia.order.controller.OrderController;
import com.example.SocialMedia.order.dto.CreateOrderRequest;
import com.example.SocialMedia.order.dto.OrderResponse;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.payment.controller.PaymentController;
import com.example.SocialMedia.payment.dto.PaymentMethodDto;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.product.controller.ProductController;
import com.example.SocialMedia.product.dto.ProductFilter;
import com.example.SocialMedia.product.dto.ProductResponse;
import com.example.SocialMedia.user.model.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ApiControllerTest {

    @Autowired
    private CategoryController categoryController;

    @Autowired
    private ProductController productController;

    @Autowired
    private AuthController authController;

    @Autowired
    private CartController cartController;

    @Autowired
    private OrderController orderController;

    @Autowired
    private PaymentController paymentController;

    @Autowired
    private AdminDashboardController adminDashboardController;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("GET /api/v1/categories - Returns active categories")
    void testGetCategories() {
        ResponseEntity<ApiResponse<List<CategoryResponse>>> response = categoryController.getAllCategories();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isEmpty());
    }

    @Test
    @DisplayName("GET /api/v1/products - Returns paged products with search and filter")
    void testGetProducts() {
        ProductFilter filter = new ProductFilter();
        filter.setSearch("Samsung");
        filter.setPage(0);
        filter.setSize(10);

        ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> response = productController.getProducts(filter);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        PagedResponse<ProductResponse> paged = response.getBody().getData();
        assertNotNull(paged);
        assertTrue(paged.getTotalItems() >= 1);
        assertTrue(paged.getItems().get(0).getName().contains("Samsung"));
        assertEquals("BDT", paged.getItems().get(0).getCurrency());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Successfully registers user with normalized phone and BCrypt password")
    void testRegisterUser() {
        RegisterRequest request = new RegisterRequest(
                "Tanvir Hasan",
                "+8801912345699",
                "tanvir@example.com",
                "SecretPass123!"
        );

        ResponseEntity<ApiResponse<TokenResponse>> response = authController.register(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        TokenResponse tokenData = response.getBody().getData();
        assertNotNull(tokenData.getAccessToken());
        assertEquals("01912345699", tokenData.getUser().getPhone());

        // Verify that the generated token is a valid JWT
        assertTrue(jwtTokenProvider.validateToken(tokenData.getAccessToken()));
        assertEquals(Role.CUSTOMER, jwtTokenProvider.extractRole(tokenData.getAccessToken()));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Authenticates with BCrypt password and issues HMAC-SHA256 JWT")
    void testLoginWithBcryptAndJwt() {
        LoginRequest loginRequest = new LoginRequest("01722222222", "Password123!");
        ResponseEntity<ApiResponse<TokenResponse>> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        TokenResponse tokenData = response.getBody().getData();
        assertNotNull(tokenData.getAccessToken());
        assertNotNull(tokenData.getRefreshToken());

        // Validate JWT signature and claims
        assertTrue(jwtTokenProvider.validateToken(tokenData.getAccessToken()));
        assertEquals("usr_customer_01", jwtTokenProvider.extractUserId(tokenData.getAccessToken()));
        assertEquals(Role.CUSTOMER, jwtTokenProvider.extractRole(tokenData.getAccessToken()));

        // Test refresh token rotation
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(tokenData.getRefreshToken());
        ResponseEntity<ApiResponse<TokenResponse>> refreshResponse = authController.refresh(refreshReq);
        assertEquals(HttpStatus.OK, refreshResponse.getStatusCode());
        assertNotNull(refreshResponse.getBody().getData().getAccessToken());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Rejects invalid password")
    void testLoginInvalidPasswordFails() {
        LoginRequest badLogin = new LoginRequest("01722222222", "WrongPassword!");
        assertThrows(UnauthorizedException.class, () -> authController.login(badLogin));
    }

    @Test
    @DisplayName("POST /api/v1/cart/items - Adds item to cart and calculates subtotal")
    void testCartOperations() {
        AddToCartRequest request = new AddToCartRequest("prd_01", 1);
        ResponseEntity<ApiResponse<CartResponse>> response = cartController.addItem(null, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        CartResponse cart = response.getBody().getData();
        assertNotNull(cart);
        assertFalse(cart.getItems().isEmpty());
        assertNotNull(cart.getTotal());
        assertEquals("BDT", cart.getCurrency());
    }

    @Test
    @DisplayName("POST /api/v1/orders - Checkout cart and creates order with payment intent")
    void testCreateOrder() {
        // Add item to cart
        cartController.addItem(null, new AddToCartRequest("prd_02", 1));

        CreateOrderRequest orderRequest = new CreateOrderRequest(
                "addr_123",
                PaymentMethod.COD,
                "Please call before delivery"
        );

        ResponseEntity<ApiResponse<OrderResponse>> response = orderController.createOrder(null, orderRequest);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        OrderResponse order = response.getBody().getData();
        assertNotNull(order.getOrderNumber());
        assertTrue(order.getOrderNumber().startsWith("BD-"));
        assertEquals(PaymentMethod.COD, order.getPaymentMethod());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertNotNull(order.getPayment());
    }

    @Test
    @DisplayName("GET /api/v1/payments/methods - Returns supported Bangladesh payment channels")
    void testPaymentMethods() {
        ResponseEntity<ApiResponse<List<PaymentMethodDto>>> response = paymentController.getAvailableMethods();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<PaymentMethodDto> methods = response.getBody().getData();
        assertEquals(4, methods.size());
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/summary - Returns aggregated admin metrics")
    void testAdminDashboard() {
        ResponseEntity<ApiResponse<DashboardSummaryResponse>> response = adminDashboardController.getDashboardSummary();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        DashboardSummaryResponse summary = response.getBody().getData();
        assertTrue(summary.getTotalProducts() >= 5);
    }
}

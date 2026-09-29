package com.example.SocialMedia.common.config;

import com.example.SocialMedia.category.model.Category;
import com.example.SocialMedia.category.repository.CategoryRepository;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.model.ProductImage;
import com.example.SocialMedia.product.repository.ProductRepository;
import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Component
public class DatabaseDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final com.example.SocialMedia.address.repository.AddressRepository addressRepository;

    public DatabaseDataSeeder(UserRepository userRepository,
                              CategoryRepository categoryRepository,
                              ProductRepository productRepository,
                              com.example.SocialMedia.address.repository.AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCategories();
        seedProducts();
        seedAddresses();
    }

    private void seedAddresses() {
        if (addressRepository.findById("addr_123").isEmpty()) {
            log.info("Seeding default customer address into PostgreSQL...");
            com.example.SocialMedia.address.model.Address defaultAddress = new com.example.SocialMedia.address.model.Address(
                    "addr_123",
                    "usr_customer_01",
                    "Karim Ahmed",
                    "01722222222",
                    "Dhaka",
                    "Dhaka",
                    "Dhanmondi",
                    "Dhanmondi 27",
                    "House 12, Road 5, Block A",
                    "1209",
                    true
            );
            addressRepository.save(defaultAddress);
            log.info("Default customer address seeded successfully.");
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@store.com.bd")) {
            log.info("Seeding initial admin and customer accounts into PostgreSQL...");
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String hashedPassword = encoder.encode("Password123!");

            User admin = new User(
                    "usr_admin_01",
                    "Rahim Chowdhury",
                    "01711111111",
                    "admin@store.com.bd",
                    hashedPassword,
                    Role.ADMIN,
                    true,
                    Instant.now()
            );

            User customer = new User(
                    "usr_customer_01",
                    "Karim Ahmed",
                    "01722222222",
                    "karim@example.com",
                    hashedPassword,
                    Role.CUSTOMER,
                    true,
                    Instant.now()
            );

            userRepository.save(admin);
            userRepository.save(customer);
            log.info("Admin and customer seeded successfully.");
        }
    }

    private void seedCategories() {
        if (categoryRepository.findAll().isEmpty()) {
            log.info("Seeding initial categories into PostgreSQL...");
            categoryRepository.save(new Category("cat_01", "Mobile", "mobile", "Smartphones, feature phones, and mobile accessories", true));
            categoryRepository.save(new Category("cat_02", "Electronics", "electronics", "Laptops, audio, wearables, and gadgets", true));
            categoryRepository.save(new Category("cat_03", "Fashion", "fashion", "Men and women clothing, footwear, and accessories", true));
            categoryRepository.save(new Category("cat_04", "Home Appliance", "home-appliance", "Kitchen and home electronic appliances", true));
            log.info("Initial categories seeded successfully.");
        }
    }

    private void seedProducts() {
        if (productRepository.findAll().isEmpty()) {
            log.info("Seeding showcase products into PostgreSQL...");
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

            productRepository.save(p1);
            productRepository.save(p2);
            productRepository.save(p3);
            productRepository.save(p4);
            productRepository.save(p5);
            log.info("Showcase products seeded successfully.");
        }
    }
}

package com.example.SocialMedia.user.repository;

import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.database.in-memory", havingValue = "true")
public class InMemoryUserRepository implements UserRepository {

    private final Map<String, User> userMap = new ConcurrentHashMap<>();

    public InMemoryUserRepository() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode("Password123!");

        // Seed initial admin and test customer with BCrypt hashed passwords
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
        userMap.put(admin.getId(), admin);
        userMap.put(customer.getId(), customer);
    }

    @Override
    public User save(User user) {
        userMap.put(user.getId(), user);
        return user;
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(userMap.get(id));
    }

    @Override
    public Optional<User> findByPhone(String phone) {
        return userMap.values().stream()
                .filter(u -> phone.equalsIgnoreCase(u.getPhone()))
                .findFirst();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userMap.values().stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst();
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userMap.values().stream()
                .anyMatch(u -> phone.equalsIgnoreCase(u.getPhone()));
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMap.values().stream()
                .anyMatch(u -> email.equalsIgnoreCase(u.getEmail()));
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(userMap.values());
    }

    @Override
    public void deleteById(String id) {
        userMap.remove(id);
    }
}

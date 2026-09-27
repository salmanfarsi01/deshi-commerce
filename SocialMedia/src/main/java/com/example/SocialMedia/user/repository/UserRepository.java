package com.example.SocialMedia.user.repository;

import com.example.SocialMedia.user.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {

    User save(User user);

    Optional<User> findById(String id);

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    List<User> findAll();

    void deleteById(String id);
}

package com.example.SocialMedia.address.repository;

import com.example.SocialMedia.address.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataAddressRepository extends JpaRepository<Address, String> {
    List<Address> findByUserId(String userId);
}

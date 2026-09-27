package com.example.SocialMedia.address.repository;

import com.example.SocialMedia.address.model.Address;
import java.util.List;
import java.util.Optional;

public interface AddressRepository {

    Address save(Address address);

    Optional<Address> findById(String id);

    List<Address> findByUserId(String userId);

    void deleteById(String id);
}

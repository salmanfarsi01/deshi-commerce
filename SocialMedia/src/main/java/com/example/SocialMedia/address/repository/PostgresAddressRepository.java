package com.example.SocialMedia.address.repository;

import com.example.SocialMedia.address.model.Address;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class PostgresAddressRepository implements AddressRepository {

    private final SpringDataAddressRepository springDataAddressRepository;

    public PostgresAddressRepository(SpringDataAddressRepository springDataAddressRepository) {
        this.springDataAddressRepository = springDataAddressRepository;
    }

    @Override
    public Address save(Address address) {
        return springDataAddressRepository.save(address);
    }

    @Override
    public Optional<Address> findById(String id) {
        return springDataAddressRepository.findById(id);
    }

    @Override
    public List<Address> findByUserId(String userId) {
        return springDataAddressRepository.findByUserId(userId);
    }

    @Override
    public void deleteById(String id) {
        springDataAddressRepository.deleteById(id);
    }
}

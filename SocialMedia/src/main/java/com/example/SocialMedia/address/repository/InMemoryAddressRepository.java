package com.example.SocialMedia.address.repository;

import com.example.SocialMedia.address.model.Address;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.database.in-memory", havingValue = "true")
public class InMemoryAddressRepository implements AddressRepository {

    private final Map<String, Address> addressMap = new ConcurrentHashMap<>();

    public InMemoryAddressRepository() {
        Address addr1 = new Address(
                "addr_123",
                "usr_customer_01",
                "Karim Ahmed",
                "01722222222",
                "Dhaka",
                "Dhaka",
                "Dhanmondi",
                "Dhanmondi 27",
                "House 12, Road 5, Apt 4B",
                "1209",
                true
        );
        addressMap.put(addr1.getId(), addr1);
    }

    @Override
    public Address save(Address address) {
        addressMap.put(address.getId(), address);
        return address;
    }

    @Override
    public Optional<Address> findById(String id) {
        return Optional.ofNullable(addressMap.get(id));
    }

    @Override
    public List<Address> findByUserId(String userId) {
        return addressMap.values().stream()
                .filter(a -> userId.equals(a.getUserId()))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        addressMap.remove(id);
    }
}

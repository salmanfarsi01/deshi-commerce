package com.example.SocialMedia.address.service;

import com.example.SocialMedia.address.dto.AddressRequest;
import com.example.SocialMedia.address.dto.AddressResponse;
import com.example.SocialMedia.address.model.Address;
import com.example.SocialMedia.address.repository.AddressRepository;
import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.common.exception.UnauthorizedException;
import com.example.SocialMedia.common.util.PhoneNormalizer;
import com.example.SocialMedia.user.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final AuthService authService;

    public AddressService(AddressRepository addressRepository, AuthService authService) {
        this.addressRepository = addressRepository;
        this.authService = authService;
    }

    public List<AddressResponse> getUserAddresses(String authHeader) {
        User user = authService.getAuthenticatedUser(authHeader);
        return addressRepository.findByUserId(user.getId()).stream()
                .map(AddressResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AddressResponse getAddressById(String authHeader, String addressId) {
        User user = authService.getAuthenticatedUser(authHeader);
        Address address = findAndVerifyOwnership(addressId, user.getId());
        return AddressResponse.fromEntity(address);
    }

    public Address getRawAddress(String addressId, String userId) {
        return findAndVerifyOwnership(addressId, userId);
    }

    public AddressResponse createAddress(String authHeader, AddressRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);
        String normalizedPhone = PhoneNormalizer.normalize(request.getPhone());

        List<Address> existing = addressRepository.findByUserId(user.getId());
        boolean isFirst = existing.isEmpty();
        boolean makeDefault = isFirst || Boolean.TRUE.equals(request.getIsDefault());

        if (makeDefault) {
            clearDefaultAddress(user.getId());
        }

        String id = "addr_" + UUID.randomUUID().toString().substring(0, 8);
        Address address = new Address(
                id,
                user.getId(),
                request.getName().trim(),
                normalizedPhone,
                request.getDivision().trim(),
                request.getDistrict().trim(),
                request.getUpazila().trim(),
                request.getArea() != null ? request.getArea().trim() : null,
                request.getAddressLine().trim(),
                request.getPostalCode() != null ? request.getPostalCode().trim() : null,
                makeDefault
        );

        addressRepository.save(address);
        return AddressResponse.fromEntity(address);
    }

    public AddressResponse updateAddress(String authHeader, String addressId, AddressRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);
        Address address = findAndVerifyOwnership(addressId, user.getId());

        String normalizedPhone = PhoneNormalizer.normalize(request.getPhone());

        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.isDefault()) {
            clearDefaultAddress(user.getId());
            address.setDefault(true);
        }

        address.setName(request.getName().trim());
        address.setPhone(normalizedPhone);
        address.setDivision(request.getDivision().trim());
        address.setDistrict(request.getDistrict().trim());
        address.setUpazila(request.getUpazila().trim());
        address.setArea(request.getArea() != null ? request.getArea().trim() : null);
        address.setAddressLine(request.getAddressLine().trim());
        address.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null);

        addressRepository.save(address);
        return AddressResponse.fromEntity(address);
    }

    public void deleteAddress(String authHeader, String addressId) {
        User user = authService.getAuthenticatedUser(authHeader);
        Address address = findAndVerifyOwnership(addressId, user.getId());
        addressRepository.deleteById(address.getId());
    }

    public AddressResponse setDefaultAddress(String authHeader, String addressId) {
        User user = authService.getAuthenticatedUser(authHeader);
        Address address = findAndVerifyOwnership(addressId, user.getId());

        clearDefaultAddress(user.getId());
        address.setDefault(true);
        addressRepository.save(address);

        return AddressResponse.fromEntity(address);
    }

    private void clearDefaultAddress(String userId) {
        List<Address> list = addressRepository.findByUserId(userId);
        for (Address a : list) {
            if (a.isDefault()) {
                a.setDefault(false);
                addressRepository.save(a);
            }
        }
    }

    private Address findAndVerifyOwnership(String addressId, String userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this address");
        }
        return address;
    }
}

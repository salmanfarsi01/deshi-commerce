package com.example.SocialMedia.address.controller;

import com.example.SocialMedia.address.dto.AddressRequest;
import com.example.SocialMedia.address.dto.AddressResponse;
import com.example.SocialMedia.address.service.AddressService;
import com.example.SocialMedia.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        List<AddressResponse> addresses = addressService.getUserAddresses(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.createAddress(authHeader, request);
        return new ResponseEntity<>(ApiResponse.success("Address created successfully", address), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        AddressResponse address = addressService.getAddressById(authHeader, id);
        return ResponseEntity.ok(ApiResponse.success("Address retrieved successfully", address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.updateAddress(authHeader, id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        addressService.deleteAddress(authHeader, id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        AddressResponse address = addressService.setDefaultAddress(authHeader, id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", address));
    }
}

package com.example.SocialMedia.address.dto;

import com.example.SocialMedia.address.model.Address;

public class AddressResponse {

    private String id;
    private String name;
    private String phone;
    private String division;
    private String district;
    private String upazila;
    private String area;
    private String addressLine;
    private String postalCode;
    private boolean isDefault;

    public AddressResponse() {
    }

    public static AddressResponse fromEntity(Address address) {
        if (address == null) {
            return null;
        }
        AddressResponse dto = new AddressResponse();
        dto.setId(address.getId());
        dto.setName(address.getName());
        dto.setPhone(address.getPhone());
        dto.setDivision(address.getDivision());
        dto.setDistrict(address.getDistrict());
        dto.setUpazila(address.getUpazila());
        dto.setArea(address.getArea());
        dto.setAddressLine(address.getAddressLine());
        dto.setPostalCode(address.getPostalCode());
        dto.setDefault(address.isDefault());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDivision() {
        return division;
    }

    public void setDivision(String division) {
        this.division = division;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getUpazila() {
        return upazila;
    }

    public void setUpazila(String upazila) {
        this.upazila = upazila;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}

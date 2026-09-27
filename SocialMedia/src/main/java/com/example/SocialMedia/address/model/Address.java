package com.example.SocialMedia.address.model;

public class Address {

    private String id;
    private String userId;
    private String name;
    private String phone;
    private String division;
    private String district;
    private String upazila;
    private String area;
    private String addressLine;
    private String postalCode;
    private boolean isDefault;

    public Address() {
    }

    public Address(String id, String userId, String name, String phone, String division,
                   String district, String upazila, String area, String addressLine,
                   String postalCode, boolean isDefault) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.division = division;
        this.district = district;
        this.upazila = upazila;
        this.area = area;
        this.addressLine = addressLine;
        this.postalCode = postalCode;
        this.isDefault = isDefault;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

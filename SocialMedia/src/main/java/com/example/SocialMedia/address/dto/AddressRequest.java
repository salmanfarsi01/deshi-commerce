package com.example.SocialMedia.address.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressRequest {

    @NotBlank(message = "Recipient name is required")
    private String name;

    @NotBlank(message = "Recipient contact phone is required")
    private String phone;

    @NotBlank(message = "Division is required (e.g. Dhaka, Chittagong, Sylhet)")
    private String division;

    @NotBlank(message = "District is required (e.g. Dhaka, Gazipur, Narayanganj)")
    private String district;

    @NotBlank(message = "Upazila / Thana is required (e.g. Dhanmondi, Gulshan, Mirpur)")
    private String upazila;

    private String area;

    @NotBlank(message = "Detailed address line is required (e.g. House 12, Road 5)")
    private String addressLine;

    private String postalCode;

    private Boolean isDefault = false;

    public AddressRequest() {
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

    public Boolean getIsDefault() {
        return isDefault != null ? isDefault : false;
    }

    public void setIsDefault(Boolean aDefault) {
        isDefault = aDefault;
    }
}

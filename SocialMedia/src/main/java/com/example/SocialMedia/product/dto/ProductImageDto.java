package com.example.SocialMedia.product.dto;

import com.example.SocialMedia.product.model.ProductImage;

public class ProductImageDto {

    private String url;
    private String alt;

    public ProductImageDto() {
    }

    public ProductImageDto(String url, String alt) {
        this.url = url;
        this.alt = alt;
    }

    public static ProductImageDto fromEntity(ProductImage image) {
        if (image == null) {
            return null;
        }
        return new ProductImageDto(image.getUrl(), image.getAlt());
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getAlt() {
        return alt;
    }

    public void setAlt(String alt) {
        this.alt = alt;
    }
}

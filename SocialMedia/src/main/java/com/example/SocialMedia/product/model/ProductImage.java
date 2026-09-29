package com.example.SocialMedia.product.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProductImage {

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String url;

    @Column(name = "alt_text")
    private String alt;

    public ProductImage() {
    }

    public ProductImage(String url, String alt) {
        this.url = url;
        this.alt = alt;
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

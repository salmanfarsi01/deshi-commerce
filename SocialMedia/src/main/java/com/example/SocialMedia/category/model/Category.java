package com.example.SocialMedia.category.model;

public class Category {

    private String id;
    private String name;
    private String slug;
    private String description;
    private boolean active;
    private String tenantId;

    public Category() {
        this.tenantId = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
    }

    public Category(String id, String name, String slug, String description, boolean active) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.active = active;
        this.tenantId = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

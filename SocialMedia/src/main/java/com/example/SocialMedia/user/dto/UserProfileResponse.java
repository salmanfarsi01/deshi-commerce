package com.example.SocialMedia.user.dto;

import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;

public class UserProfileResponse {

    private String id;
    private String name;
    private String phone;
    private String email;
    private Role role;
    private boolean active;
    private String avatarUrl;

    public UserProfileResponse() {
    }

    public UserProfileResponse(String id, String name, String phone, String email, Role role, boolean active) {
        this(id, name, phone, email, role, active, null);
    }

    public UserProfileResponse(String id, String name, String phone, String email, Role role, boolean active, String avatarUrl) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.role = role;
        this.active = active;
        this.avatarUrl = avatarUrl;
    }

    public static UserProfileResponse fromUser(User user) {
        if (user == null) {
            return null;
        }
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getAvatarUrl()
        );
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}

package com.gymsystem.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long gymId;
    private String profilePhotoUrl;

    public AuthResponse(String token, Long userId, String name, String email, String role, Long gymId, String profilePhotoUrl) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.gymId = gymId;
        this.profilePhotoUrl = profilePhotoUrl;
    }

    // Getters
    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getGymId() { return gymId; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
}

package com.gymsystem.dto;

public class UpdateAdminRequest {
    private String name;
    private String email;
    private Long gymId;
    
    // Optional field for resetting password during update
    private String password;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getGymId() { return gymId; }
    public void setGymId(Long gymId) { this.gymId = gymId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

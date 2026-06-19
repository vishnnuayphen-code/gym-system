package com.gymsystem.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreateTenantRequest {
    private String gymName;
    private String gymAddress;
    private String gymPhone;

    private String ownerName;
    @JsonProperty(value = "ownerEmail", access = JsonProperty.Access.WRITE_ONLY)
    private String ownerEmail;
    @JsonProperty(value = "ownerPassword", access = JsonProperty.Access.WRITE_ONLY)
    private String ownerPassword;

    @JsonProperty("email")
    public void setEmail(String email) { this.ownerEmail = email; }

    @JsonProperty("password")
    public void setPassword(String password) { this.ownerPassword = password; }

    // Getters and setters
    public String getGymName() { return gymName; }
    public void setGymName(String gymName) { this.gymName = gymName; }
    
    public String getGymAddress() { return gymAddress; }
    public void setGymAddress(String gymAddress) { this.gymAddress = gymAddress; }
    
    public String getGymPhone() { return gymPhone; }
    public void setGymPhone(String gymPhone) { this.gymPhone = gymPhone; }
    
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    
    public String getOwnerPassword() { return ownerPassword; }
    public void setOwnerPassword(String ownerPassword) { this.ownerPassword = ownerPassword; }
}

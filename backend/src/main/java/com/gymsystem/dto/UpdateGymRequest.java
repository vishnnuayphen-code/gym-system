package com.gymsystem.dto;

public class UpdateGymRequest {
    private String gymName;
    private String gymAddress;
    private String gymPhone;

    // Getters and Setters
    public String getGymName() { return gymName; }
    public void setGymName(String gymName) { this.gymName = gymName; }

    public String getGymAddress() { return gymAddress; }
    public void setGymAddress(String gymAddress) { this.gymAddress = gymAddress; }

    public String getGymPhone() { return gymPhone; }
    public void setGymPhone(String gymPhone) { this.gymPhone = gymPhone; }
}

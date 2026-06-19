package com.gymsystem.dto;

import java.util.List;

public class MachineResponse {
    private Long id;
    private String name;
    private String type;
    private String description;
    private int quantity;
    private String imageUrl;
    private String status;
    private String serialNumber;
    private String locationInGym;
    private List<AvailabilitySlotResponse> availabilitySlots;
    private int totalBookingsToday;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getLocationInGym() { return locationInGym; }
    public void setLocationInGym(String locationInGym) { this.locationInGym = locationInGym; }
    public List<AvailabilitySlotResponse> getAvailabilitySlots() { return availabilitySlots; }
    public void setAvailabilitySlots(List<AvailabilitySlotResponse> availabilitySlots) { this.availabilitySlots = availabilitySlots; }
    public int getTotalBookingsToday() { return totalBookingsToday; }
    public void setTotalBookingsToday(int totalBookingsToday) { this.totalBookingsToday = totalBookingsToday; }
}

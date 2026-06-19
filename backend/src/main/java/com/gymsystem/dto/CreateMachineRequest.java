package com.gymsystem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import com.gymsystem.entity.Machine;

public class CreateMachineRequest {
    @NotBlank(message = "Machine name is required")
    private String name;
    
    @NotBlank(message = "Machine type is required")
    private String type;
    
    private String description;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;
    
    private Machine.Status status = Machine.Status.ACTIVE;
    
    private String serialNumber;
    private String locationInGym;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public Machine.Status getStatus() { return status; }
    public void setStatus(Machine.Status status) { this.status = status; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getLocationInGym() { return locationInGym; }
    public void setLocationInGym(String locationInGym) { this.locationInGym = locationInGym; }
}

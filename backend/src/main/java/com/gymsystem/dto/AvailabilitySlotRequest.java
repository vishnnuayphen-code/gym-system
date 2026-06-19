package com.gymsystem.dto;

public class AvailabilitySlotRequest {
    private String dayOfWeek;  // MON, TUE, etc.
    private String startTime;  // "09:00"
    private String endTime;    // "10:00"
    private int maxBookings;
    private boolean isActive = true;

    // Getters and Setters
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public int getMaxBookings() { return maxBookings; }
    public void setMaxBookings(int maxBookings) { this.maxBookings = maxBookings; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}

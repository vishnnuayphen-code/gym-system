package com.gymsystem.dto;

public class CoachAttendanceUpdateRequest {
    private String checkOutTime; // "HH:mm"
    private String notes;

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

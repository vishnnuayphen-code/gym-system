package com.gymsystem.dto;

public class AttendanceUpdateRequest {
    private String status;       // "PRESENT" | "ABSENT" | "EXCUSED"
    private String checkOutTime; // "HH:mm"
    private String notes;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

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

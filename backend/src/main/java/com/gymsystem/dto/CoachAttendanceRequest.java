package com.gymsystem.dto;

import java.time.LocalDate;

public class CoachAttendanceRequest {
    private Long coachId;
    private LocalDate attendanceDate;
    private String sessionAttended; // "MORNING", "EVENING"
    private String status;          // "PRESENT", "HALF_DAY", "ABSENT"
    private String notes;
    private String checkInTime;     // "HH:mm"
    private String checkOutTime;    // "HH:mm"

    // Getters and Setters
    public Long getCoachId() { return coachId; }
    public void setCoachId(Long coachId) { this.coachId = coachId; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getSessionAttended() { return sessionAttended; }
    public void setSessionAttended(String sessionAttended) { this.sessionAttended = sessionAttended; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }

    public String getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(String checkOutTime) { this.checkOutTime = checkOutTime; }
}

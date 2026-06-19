package com.gymsystem.dto;

public class CoachAttendanceResponse {
    private Long id;
    private Long coachId;
    private String coachName;
    private String coachPhoto;
    private String attendanceDate;
    private String sessionAttended;
    private String status;
    private String checkInTime;
    private String checkOutTime;
    private String markedBy;
    private String notes;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCoachId() { return coachId; }
    public void setCoachId(Long coachId) { this.coachId = coachId; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public String getCoachPhoto() { return coachPhoto; }
    public void setCoachPhoto(String coachPhoto) { this.coachPhoto = coachPhoto; }

    public String getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(String attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getSessionAttended() { return sessionAttended; }
    public void setSessionAttended(String sessionAttended) { this.sessionAttended = sessionAttended; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }

    public String getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(String checkOutTime) { this.checkOutTime = checkOutTime; }

    public String getMarkedBy() { return markedBy; }
    public void setMarkedBy(String markedBy) { this.markedBy = markedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

package com.gymsystem.dto;

import com.gymsystem.entity.SessionStatus;
import com.gymsystem.entity.SessionType;
import java.time.LocalDate;
import java.time.LocalTime;

public class UpdateSessionRequest {
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private SessionType sessionType;
    private SessionStatus status;
    private LocalTime actualStartTime;
    private LocalTime actualEndTime;
    private String sessionLocation;
    private String sessionNotes;
    private Integer traineeRating;
    private Integer estimatedCaloriesBurned;
    private String recordingUrl;

    // Getters and Setters
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
    public LocalTime getActualStartTime() { return actualStartTime; }
    public void setActualStartTime(LocalTime actualStartTime) { this.actualStartTime = actualStartTime; }
    public LocalTime getActualEndTime() { return actualEndTime; }
    public void setActualEndTime(LocalTime actualEndTime) { this.actualEndTime = actualEndTime; }
    public String getSessionLocation() { return sessionLocation; }
    public void setSessionLocation(String sessionLocation) { this.sessionLocation = sessionLocation; }
    public String getSessionNotes() { return sessionNotes; }
    public void setSessionNotes(String sessionNotes) { this.sessionNotes = sessionNotes; }
    public Integer getTraineeRating() { return traineeRating; }
    public void setTraineeRating(Integer traineeRating) { this.traineeRating = traineeRating; }
    public Integer getEstimatedCaloriesBurned() { return estimatedCaloriesBurned; }
    public void setEstimatedCaloriesBurned(Integer estimatedCaloriesBurned) { this.estimatedCaloriesBurned = estimatedCaloriesBurned; }
    public String getRecordingUrl() { return recordingUrl; }
    public void setRecordingUrl(String recordingUrl) { this.recordingUrl = recordingUrl; }
}

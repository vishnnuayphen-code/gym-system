package com.gymsystem.dto;

import java.time.LocalTime;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;

public class CreateAvailabilityRequest {
    private Long coachId;
    private DayOfWeek dayOfWeek;
    private LocalDate specificDate;
    private List<LocalDate> specificDates; // multiple dates from frontend
    private LocalTime startTime;
    private LocalTime endTime;
    private String recurrenceType; // NONE, WEEKLY, MONTHLY
    private Boolean isAvailable;

    // Getters and Setters
    public Long getCoachId() { return coachId; }
    public void setCoachId(Long coachId) { this.coachId = coachId; }
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalDate getSpecificDate() { return specificDate; }
    public void setSpecificDate(LocalDate specificDate) { this.specificDate = specificDate; }
    public List<LocalDate> getSpecificDates() { return specificDates; }
    public void setSpecificDates(List<LocalDate> specificDates) { this.specificDates = specificDates; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(String recurrenceType) { this.recurrenceType = recurrenceType; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}

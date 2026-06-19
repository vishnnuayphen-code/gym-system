package com.gymsystem.dto;

import jakarta.validation.constraints.NotNull;

public class AssignTraineeRequest {

    @NotNull(message = "Coach ID is required")
    private Long coachId;

    @NotNull(message = "Trainee ID is required")
    private Long traineeId;

    // Getters and Setters
    public Long getCoachId() {
        return coachId;
    }

    public void setCoachId(Long coachId) {
        this.coachId = coachId;
    }

    public Long getTraineeId() {
        return traineeId;
    }

    public void setTraineeId(Long traineeId) {
        this.traineeId = traineeId;
    }
}

package com.gymsystem.dto;

import com.gymsystem.entity.WorkoutPlanStatus;
import java.time.LocalDate;

public record UpdateWorkoutPlanRequest(
    String title,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    WorkoutPlanStatus status
) {}

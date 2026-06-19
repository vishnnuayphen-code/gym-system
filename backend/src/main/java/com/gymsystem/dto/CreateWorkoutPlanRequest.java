package com.gymsystem.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateWorkoutPlanRequest(
    String title,
    String description,
    Long traineeId,
    LocalDate startDate,
    LocalDate endDate,
    List<WorkoutDayRequest> workoutDays
) {}

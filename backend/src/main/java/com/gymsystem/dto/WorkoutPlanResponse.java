package com.gymsystem.dto;

import com.gymsystem.entity.WorkoutPlanStatus;
import java.time.LocalDate;
import java.util.List;

public record WorkoutPlanResponse(
    Long id,
    String title,
    String description,
    Long coachId,
    String coachName,
    Long traineeId,
    String traineeName,
    LocalDate startDate,
    LocalDate endDate,
    WorkoutPlanStatus status,
    List<WorkoutDayResponse> workoutDays
) {
    public record WorkoutDayResponse(
        Long id,
        String dayLabel,
        String focusArea,
        List<ExerciseResponse> exercises
    ) {}

    public record ExerciseResponse(
        Long id,
        String name,
        Integer sets,
        Integer reps,
        Integer restSeconds,
        String notes,
        String videoUrl
    ) {}
}

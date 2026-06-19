package com.gymsystem.dto;

import java.util.List;

public record WorkoutDayRequest(
    String dayLabel,
    String focusArea,
    List<ExerciseRequest> exercises
) {}

package com.gymsystem.dto;


public record ExerciseRequest(
    String name,
    Integer sets,
    Integer reps,
    Integer restSeconds,
    String notes,
    String videoUrl
) {}

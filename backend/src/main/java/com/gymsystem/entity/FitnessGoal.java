package com.gymsystem.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum FitnessGoal {
    WEIGHT_LOSS,
    MUSCLE_GAIN,
    ENDURANCE,
    GENERAL;

    @JsonCreator
    public static FitnessGoal fromString(String value) {
        if (value == null || value.isBlank()) return GENERAL;
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        try {
            return FitnessGoal.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return GENERAL;
        }
    }
}

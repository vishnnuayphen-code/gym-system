package com.gymsystem.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class FitnessGoalConverter implements AttributeConverter<FitnessGoal, String> {

    @Override
    public String convertToDatabaseColumn(FitnessGoal attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public FitnessGoal convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return FitnessGoal.GENERAL;
        }
        
        // Normalize: trim, uppercase, replace spaces with underscores
        String normalized = dbData.trim().toUpperCase().replace(" ", "_");
        
        try {
            return FitnessGoal.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return FitnessGoal.GENERAL;
        }
    }
}

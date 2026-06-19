package com.gymsystem.dto;

import com.gymsystem.entity.PlanCategory;
import java.math.BigDecimal;

public class UpdateMembershipPlanRequest {
    private String name;
    private String description;
    private Integer durationDays;
    private BigDecimal price;
    private PlanCategory category;
    private Integer validityDays;
    private Integer maxConsultations;
    private Boolean isPersonalTrainingIncluded;
    private String accessLevel;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public PlanCategory getCategory() { return category; }
    public void setCategory(PlanCategory category) { this.category = category; }
    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }
    public Integer getMaxConsultations() { return maxConsultations; }
    public void setMaxConsultations(Integer maxConsultations) { this.maxConsultations = maxConsultations; }
    public Boolean getIsPersonalTrainingIncluded() { return isPersonalTrainingIncluded; }
    public void setIsPersonalTrainingIncluded(Boolean personalTrainingIncluded) { isPersonalTrainingIncluded = personalTrainingIncluded; }
    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }
}

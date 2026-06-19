package com.gymsystem.dto;

import java.time.LocalDate;
import com.gymsystem.entity.SalaryType;

public class UpdateCoachRequest {
    private String name;
    private String phone;
    private com.gymsystem.entity.Gender gender;
    private LocalDate dateOfBirth;
    private String specialization;
    private Integer experienceYears;
    private String certificationName;
    private LocalDate certificationExpiryDate;
    private Double averageRating;
    private Integer maxTraineeCapacity;
    private String languagesSpoken;
    private String bio;
    private SalaryType salaryType;
    private String profilePhotoUrl;
    private String employmentType;
    private String sessionType;

    // Getters and Setters
    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public String getCertificationName() { return certificationName; }
    public void setCertificationName(String certificationName) { this.certificationName = certificationName; }
    public LocalDate getCertificationExpiryDate() { return certificationExpiryDate; }
    public void setCertificationExpiryDate(LocalDate certificationExpiryDate) { this.certificationExpiryDate = certificationExpiryDate; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getMaxTraineeCapacity() { return maxTraineeCapacity; }
    public void setMaxTraineeCapacity(Integer maxTraineeCapacity) { this.maxTraineeCapacity = maxTraineeCapacity; }
    public String getLanguagesSpoken() { return languagesSpoken; }
    public void setLanguagesSpoken(String languagesSpoken) { this.languagesSpoken = languagesSpoken; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public SalaryType getSalaryType() { return salaryType; }
    public void setSalaryType(SalaryType salaryType) { this.salaryType = salaryType; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public com.gymsystem.entity.Gender getGender() { return gender; }
    public void setGender(com.gymsystem.entity.Gender gender) { this.gender = gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
}

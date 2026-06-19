package com.gymsystem.dto;

import java.util.List;

public class CoachWorkloadResponse {

    private Long coachId;
    private String coachName;
    private String coachPhotoUrl;
    private String specialization;
    private String employmentType;   // "FULL_TIME" | "SESSION_BASED"
    private String sessionType;      // "MORNING" | "EVENING" | "BOTH" | null

    private int traineeCount;         // total assigned trainees
    private int personalTraineeCount; // PERSONAL_TRAINING members only
    private int upcomingSessionCount; // sessions from today onwards

    private String workloadLevel; // "UNASSIGNED"|"LOW"|"MEDIUM"|"HIGH"|"OVERLOADED"

    private List<AssignedTraineeSummary> assignedTrainees;

    public static class AssignedTraineeSummary {
        private Long traineeId;
        private String traineeName;
        private String traineePhotoUrl;
        private String preferredTime;   // "MORNING"|"EVENING"|"FLEXIBLE" etc.
        private String membershipStatus; // "ACTIVE"|"EXPIRED"|"NO_PLAN"
        private int upcomingSessions; // sessions for this trainee with this coach

        // Getters and Setters
        public Long getTraineeId() { return traineeId; }
        public void setTraineeId(Long traineeId) { this.traineeId = traineeId; }
        public String getTraineeName() { return traineeName; }
        public void setTraineeName(String traineeName) { this.traineeName = traineeName; }
        public String getTraineePhotoUrl() { return traineePhotoUrl; }
        public void setTraineePhotoUrl(String traineePhotoUrl) { this.traineePhotoUrl = traineePhotoUrl; }
        public String getPreferredTime() { return preferredTime; }
        public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }
        public String getMembershipStatus() { return membershipStatus; }
        public void setMembershipStatus(String membershipStatus) { this.membershipStatus = membershipStatus; }
        public int getUpcomingSessions() { return upcomingSessions; }
        public void setUpcomingSessions(int upcomingSessions) { this.upcomingSessions = upcomingSessions; }
    }

    // Getters and Setters
    public Long getCoachId() { return coachId; }
    public void setCoachId(Long coachId) { this.coachId = coachId; }
    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }
    public String getCoachPhotoUrl() { return coachPhotoUrl; }
    public void setCoachPhotoUrl(String coachPhotoUrl) { this.coachPhotoUrl = coachPhotoUrl; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public int getTraineeCount() { return traineeCount; }
    public void setTraineeCount(int traineeCount) { this.traineeCount = traineeCount; }
    public int getPersonalTraineeCount() { return personalTraineeCount; }
    public void setPersonalTraineeCount(int personalTraineeCount) { this.personalTraineeCount = personalTraineeCount; }
    public int getUpcomingSessionCount() { return upcomingSessionCount; }
    public void setUpcomingSessionCount(int upcomingSessionCount) { this.upcomingSessionCount = upcomingSessionCount; }
    public String getWorkloadLevel() { return workloadLevel; }
    public void setWorkloadLevel(String workloadLevel) { this.workloadLevel = workloadLevel; }
    public List<AssignedTraineeSummary> getAssignedTrainees() { return assignedTrainees; }
    public void setAssignedTrainees(List<AssignedTraineeSummary> assignedTrainees) { this.assignedTrainees = assignedTrainees; }
}

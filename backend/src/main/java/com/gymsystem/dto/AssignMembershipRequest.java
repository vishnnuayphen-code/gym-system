package com.gymsystem.dto;

import java.time.LocalDate;

public class AssignMembershipRequest {
    private Long traineeId;
    private Long membershipPlanId;
    private LocalDate startDate;

    public Long getTraineeId() { return traineeId; }
    public void setTraineeId(Long traineeId) { this.traineeId = traineeId; }
    public Long getMembershipPlanId() { return membershipPlanId; }
    public void setMembershipPlanId(Long membershipPlanId) { this.membershipPlanId = membershipPlanId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
}

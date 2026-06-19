package com.gymsystem.dto;

import java.math.BigDecimal;

public class PlanSubscriberResponse {

    // Trainee info
    private Long traineeId;
    private String traineeName;
    private String traineeEmail;
    private String traineePhotoUrl;
    private String traineePhone;

    // Plan info
    private Long planId;
    private String planName;
    private BigDecimal planPrice;
    private Integer planDurationDays;

    // Membership info
    private Long membershipId;
    private String startDate;
    private String endDate;
    private Integer daysRemaining;
    private String membershipStatus;

    // Payment info
    private BigDecimal amountPaid;
    private String paymentMethod;
    private String paymentDate;

    public PlanSubscriberResponse() {}

    // Getters and Setters
    public Long getTraineeId() { return traineeId; }
    public void setTraineeId(Long traineeId) { this.traineeId = traineeId; }
    public String getTraineeName() { return traineeName; }
    public void setTraineeName(String traineeName) { this.traineeName = traineeName; }
    public String getTraineeEmail() { return traineeEmail; }
    public void setTraineeEmail(String traineeEmail) { this.traineeEmail = traineeEmail; }
    public String getTraineePhotoUrl() { return traineePhotoUrl; }
    public void setTraineePhotoUrl(String traineePhotoUrl) { this.traineePhotoUrl = traineePhotoUrl; }
    public String getTraineePhone() { return traineePhone; }
    public void setTraineePhone(String traineePhone) { this.traineePhone = traineePhone; }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public BigDecimal getPlanPrice() { return planPrice; }
    public void setPlanPrice(BigDecimal planPrice) { this.planPrice = planPrice; }
    public Integer getPlanDurationDays() { return planDurationDays; }
    public void setPlanDurationDays(Integer planDurationDays) { this.planDurationDays = planDurationDays; }
    public Long getMembershipId() { return membershipId; }
    public void setMembershipId(Long membershipId) { this.membershipId = membershipId; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }
    public String getMembershipStatus() { return membershipStatus; }
    public void setMembershipStatus(String membershipStatus) { this.membershipStatus = membershipStatus; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentDate() { return paymentDate; }
    public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }
}

package com.gymsystem.dto;

public class AcceptSessionRequest {
    private Long workoutPlanId;
    private Long machineId;

    public AcceptSessionRequest() {}

    public Long getWorkoutPlanId() { return workoutPlanId; }
    public void setWorkoutPlanId(Long workoutPlanId) { this.workoutPlanId = workoutPlanId; }

    public Long getMachineId() { return machineId; }
    public void setMachineId(Long machineId) { this.machineId = machineId; }
}

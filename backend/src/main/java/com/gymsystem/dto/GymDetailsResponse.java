package com.gymsystem.dto;

import com.gymsystem.entity.Gym;

public class GymDetailsResponse {
    private Gym gym;
    private long totalMembers;
    private long totalCoaches;
    private String revenue;
    private int activeSessions;

    public GymDetailsResponse(Gym gym, long totalMembers, long totalCoaches, String revenue, int activeSessions) {
        this.gym = gym;
        this.totalMembers = totalMembers;
        this.totalCoaches = totalCoaches;
        this.revenue = revenue;
        this.activeSessions = activeSessions;
    }

    // Getters
    public Gym getGym() { return gym; }
    public void setGym(Gym gym) { this.gym = gym; }

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }

    public long getTotalCoaches() { return totalCoaches; }
    public void setTotalCoaches(long totalCoaches) { this.totalCoaches = totalCoaches; }

    public String getRevenue() { return revenue; }
    public void setRevenue(String revenue) { this.revenue = revenue; }

    public int getActiveSessions() { return activeSessions; }
    public void setActiveSessions(int activeSessions) { this.activeSessions = activeSessions; }
}

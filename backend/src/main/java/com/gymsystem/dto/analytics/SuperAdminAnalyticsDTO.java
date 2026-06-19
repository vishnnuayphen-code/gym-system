package com.gymsystem.dto.analytics;

import java.util.List;

public class SuperAdminAnalyticsDTO {

    public static class DashboardSummaryResponse {
        private long totalGyms;
        private long totalActiveMembers;
        private long totalCoaches;
        private long totalSessionsThisMonth;
        private double totalRevenue;
        private long activeMemberships;
        private long membershipRenewals;
        private double attendanceRate;

        public long getTotalGyms() { return totalGyms; }
        public void setTotalGyms(long totalGyms) { this.totalGyms = totalGyms; }
        public long getTotalActiveMembers() { return totalActiveMembers; }
        public void setTotalActiveMembers(long totalActiveMembers) { this.totalActiveMembers = totalActiveMembers; }
        public long getTotalCoaches() { return totalCoaches; }
        public void setTotalCoaches(long totalCoaches) { this.totalCoaches = totalCoaches; }
        public long getTotalSessionsThisMonth() { return totalSessionsThisMonth; }
        public void setTotalSessionsThisMonth(long totalSessionsThisMonth) { this.totalSessionsThisMonth = totalSessionsThisMonth; }
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public long getActiveMemberships() { return activeMemberships; }
        public void setActiveMemberships(long activeMemberships) { this.activeMemberships = activeMemberships; }
        public long getMembershipRenewals() { return membershipRenewals; }
        public void setMembershipRenewals(long membershipRenewals) { this.membershipRenewals = membershipRenewals; }
        public double getAttendanceRate() { return attendanceRate; }
        public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }
    }

    public static class RevenueAnalyticsResponse {
        private double totalRevenue;
        private double revenueGrowthPercentage;
        private String topGeneratingGym;
        private String lowestGeneratingGym;
        private List<GymMetric> revenueByGym;
        private List<TimeMetric> monthlyRevenueTrend;

        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public double getRevenueGrowthPercentage() { return revenueGrowthPercentage; }
        public void setRevenueGrowthPercentage(double revenueGrowthPercentage) { this.revenueGrowthPercentage = revenueGrowthPercentage; }
        public String getTopGeneratingGym() { return topGeneratingGym; }
        public void setTopGeneratingGym(String topGeneratingGym) { this.topGeneratingGym = topGeneratingGym; }
        public String getLowestGeneratingGym() { return lowestGeneratingGym; }
        public void setLowestGeneratingGym(String lowestGeneratingGym) { this.lowestGeneratingGym = lowestGeneratingGym; }
        public List<GymMetric> getRevenueByGym() { return revenueByGym; }
        public void setRevenueByGym(List<GymMetric> revenueByGym) { this.revenueByGym = revenueByGym; }
        public List<TimeMetric> getMonthlyRevenueTrend() { return monthlyRevenueTrend; }
        public void setMonthlyRevenueTrend(List<TimeMetric> monthlyRevenueTrend) { this.monthlyRevenueTrend = monthlyRevenueTrend; }
    }

    public static class MemberAnalyticsResponse {
        private long totalMembers;
        private long activeMembers;
        private long inactiveMembers;
        private long newRegistrations;
        private long membershipRenewals;
        private long membershipExpirations;
        private List<TimeMetric> memberGrowthTrend;
        private List<GymMetric> registrationsPerGym;

        public long getTotalMembers() { return totalMembers; }
        public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }
        public long getActiveMembers() { return activeMembers; }
        public void setActiveMembers(long activeMembers) { this.activeMembers = activeMembers; }
        public long getInactiveMembers() { return inactiveMembers; }
        public void setInactiveMembers(long inactiveMembers) { this.inactiveMembers = inactiveMembers; }
        public long getNewRegistrations() { return newRegistrations; }
        public void setNewRegistrations(long newRegistrations) { this.newRegistrations = newRegistrations; }
        public long getMembershipRenewals() { return membershipRenewals; }
        public void setMembershipRenewals(long membershipRenewals) { this.membershipRenewals = membershipRenewals; }
        public long getMembershipExpirations() { return membershipExpirations; }
        public void setMembershipExpirations(long membershipExpirations) { this.membershipExpirations = membershipExpirations; }
        public List<TimeMetric> getMemberGrowthTrend() { return memberGrowthTrend; }
        public void setMemberGrowthTrend(List<TimeMetric> memberGrowthTrend) { this.memberGrowthTrend = memberGrowthTrend; }
        public List<GymMetric> getRegistrationsPerGym() { return registrationsPerGym; }
        public void setRegistrationsPerGym(List<GymMetric> registrationsPerGym) { this.registrationsPerGym = registrationsPerGym; }
    }

    public static class AttendanceAnalyticsResponse {
        private long dailyAttendance;
        private long weeklyAttendance;
        private long monthlyAttendance;
        private double averageAttendancePercentage;
        private List<GymMetric> attendanceByGym;
        private List<TimeMetric> attendanceTrend;

        public long getDailyAttendance() { return dailyAttendance; }
        public void setDailyAttendance(long dailyAttendance) { this.dailyAttendance = dailyAttendance; }
        public long getWeeklyAttendance() { return weeklyAttendance; }
        public void setWeeklyAttendance(long weeklyAttendance) { this.weeklyAttendance = weeklyAttendance; }
        public long getMonthlyAttendance() { return monthlyAttendance; }
        public void setMonthlyAttendance(long monthlyAttendance) { this.monthlyAttendance = monthlyAttendance; }
        public double getAverageAttendancePercentage() { return averageAttendancePercentage; }
        public void setAverageAttendancePercentage(double averageAttendancePercentage) { this.averageAttendancePercentage = averageAttendancePercentage; }
        public List<GymMetric> getAttendanceByGym() { return attendanceByGym; }
        public void setAttendanceByGym(List<GymMetric> attendanceByGym) { this.attendanceByGym = attendanceByGym; }
        public List<TimeMetric> getAttendanceTrend() { return attendanceTrend; }
        public void setAttendanceTrend(List<TimeMetric> attendanceTrend) { this.attendanceTrend = attendanceTrend; }
    }

    public static class CoachAnalyticsResponse {
        private long totalCoaches;
        private long activeCoaches;
        private long sessionsConducted;
        private double coachUtilizationPercentage;
        private List<GymMetric> sessionsConductedByCoach;

        public long getTotalCoaches() { return totalCoaches; }
        public void setTotalCoaches(long totalCoaches) { this.totalCoaches = totalCoaches; }
        public long getActiveCoaches() { return activeCoaches; }
        public void setActiveCoaches(long activeCoaches) { this.activeCoaches = activeCoaches; }
        public long getSessionsConducted() { return sessionsConducted; }
        public void setSessionsConducted(long sessionsConducted) { this.sessionsConducted = sessionsConducted; }
        public double getCoachUtilizationPercentage() { return coachUtilizationPercentage; }
        public void setCoachUtilizationPercentage(double coachUtilizationPercentage) { this.coachUtilizationPercentage = coachUtilizationPercentage; }
        public List<GymMetric> getSessionsConductedByCoach() { return sessionsConductedByCoach; }
        public void setSessionsConductedByCoach(List<GymMetric> sessionsConductedByCoach) { this.sessionsConductedByCoach = sessionsConductedByCoach; }
    }

    public static class SessionAnalyticsResponse {
        private long totalSessionsBooked;
        private long completedSessions;
        private long pendingSessions;
        private long cancelledSessions;
        private long rejectedSessions;
        private double sessionCompletionRate;
        private List<TimeMetric> monthlySessionTrends;
        private List<GymMetric> sessionVolumeByGym;

        public long getTotalSessionsBooked() { return totalSessionsBooked; }
        public void setTotalSessionsBooked(long totalSessionsBooked) { this.totalSessionsBooked = totalSessionsBooked; }
        public long getCompletedSessions() { return completedSessions; }
        public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }
        public long getPendingSessions() { return pendingSessions; }
        public void setPendingSessions(long pendingSessions) { this.pendingSessions = pendingSessions; }
        public long getCancelledSessions() { return cancelledSessions; }
        public void setCancelledSessions(long cancelledSessions) { this.cancelledSessions = cancelledSessions; }
        public long getRejectedSessions() { return rejectedSessions; }
        public void setRejectedSessions(long rejectedSessions) { this.rejectedSessions = rejectedSessions; }
        public double getSessionCompletionRate() { return sessionCompletionRate; }
        public void setSessionCompletionRate(double sessionCompletionRate) { this.sessionCompletionRate = sessionCompletionRate; }
        public List<TimeMetric> getMonthlySessionTrends() { return monthlySessionTrends; }
        public void setMonthlySessionTrends(List<TimeMetric> monthlySessionTrends) { this.monthlySessionTrends = monthlySessionTrends; }
        public List<GymMetric> getSessionVolumeByGym() { return sessionVolumeByGym; }
        public void setSessionVolumeByGym(List<GymMetric> sessionVolumeByGym) { this.sessionVolumeByGym = sessionVolumeByGym; }
    }

    public static class GymComparisonResponse {
        private Long gymId;
        private String gymName;
        private long members;
        private long coaches;
        private double revenue;
        private double attendancePercentage;
        private long sessions;

        public Long getGymId() { return gymId; }
        public void setGymId(Long gymId) { this.gymId = gymId; }
        public String getGymName() { return gymName; }
        public void setGymName(String gymName) { this.gymName = gymName; }
        public long getMembers() { return members; }
        public void setMembers(long members) { this.members = members; }
        public long getCoaches() { return coaches; }
        public void setCoaches(long coaches) { this.coaches = coaches; }
        public double getRevenue() { return revenue; }
        public void setRevenue(double revenue) { this.revenue = revenue; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
        public long getSessions() { return sessions; }
        public void setSessions(long sessions) { this.sessions = sessions; }
    }

    public static class GymMetric {
        private String label;
        private double value;

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
    }

    public static class TimeMetric {
        private String label;
        private double value;

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
    }
}

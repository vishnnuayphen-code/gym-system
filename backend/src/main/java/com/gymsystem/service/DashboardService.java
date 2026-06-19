package com.gymsystem.service;

import com.gymsystem.entity.*;
import com.gymsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private UserRepository userRepository;
    @Autowired private SessionRepository sessionRepository;
    @Autowired private CoachTraineeAssignmentRepository assignmentRepository;
    @Autowired private TraineeMembershipRepository membershipRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private CoachAvailabilityRepository availabilityRepository;
    @Autowired private GymRepository gymRepository;
    @Autowired private GeminiService geminiService;

    /**
     * Owner/Admin dashboard stats
     */
    public Map<String, Object> getOwnerStats(Long gymId) {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalTrainees = userRepository.countByRoleNameAndGymId("TRAINEE", gymId);
        long totalCoaches = userRepository.countByRoleNameAndGymId("COACH", gymId);
        long activeMemberships = membershipRepository.countByStatusAndTraineeGymId(MembershipStatus.ACTIVE, gymId);

        // Revenue this month
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now();
        List<Payment> monthPayments = paymentRepository.findByTraineeMembershipTraineeGymIdAndPaymentDateBetween(gymId, monthStart, monthEnd);
        BigDecimal revenueThisMonth = monthPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Total sessions today
        List<Session> todaySessions = sessionRepository.findByGymIdAndSessionDate(gymId, LocalDate.now());

        // Expiring memberships (next 7 days)
        LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);
        List<TraineeMembership> expiring = membershipRepository.findByTraineeGymIdAndEndDateBetween(gymId, LocalDate.now(), sevenDaysFromNow);
        List<Map<String, Object>> expiringList = expiring.stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("name", m.getTrainee().getName());
            map.put("plan", m.getMembershipPlan().getName());
            map.put("expiry", m.getEndDate().toString());
            map.put("status", m.getStatus().name());
            return map;
        }).collect(Collectors.toList());

        // Recent activity (Payments, Users, Sessions)
        List<Map<String, Object>> allActivities = new ArrayList<>();

        // Add Payments
        List<Payment> recentPayments = paymentRepository.findTop20ByGymIdOrderByPaymentDateDesc(gymId);
        recentPayments.stream().limit(5).forEach(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("description", "Payment of $" + p.getAmount() + " received from " + p.getTraineeMembership().getTrainee().getName());
            map.put("timestamp", p.getPaymentDate().atStartOfDay().toString());
            map.put("timeObj", p.getPaymentDate().atStartOfDay());
            allActivities.add(map);
        });

        // Add New Users (Members & Coaches only)
        List<User> recentUsers = userRepository.findTop10ByGymIdOrderByCreatedAtDesc(gymId);
        recentUsers.stream()
            .filter(u -> u.getRole() != null && 
                        (u.getRole().getName().equalsIgnoreCase("TRAINEE") || 
                         u.getRole().getName().equalsIgnoreCase("COACH")))
            .forEach(u -> {
                if (u.getCreatedAt() != null) {
                    Map<String, Object> map = new LinkedHashMap<>();
                    String role = u.getRole().getName().equalsIgnoreCase("TRAINEE") ? "Member" : "Coach";
                    map.put("description", "New " + role + " joined: " + u.getName());
                    map.put("timestamp", u.getCreatedAt().toString());
                    map.put("timeObj", u.getCreatedAt());
                    allActivities.add(map);
                }
            });

        // Add Recent Sessions
        List<Session> recentSessions = sessionRepository.findTop10ByGymIdOrderByCreatedAtDesc(gymId);
        recentSessions.stream().forEach(s -> {
            if (s.getCreatedAt() != null) {
                Map<String, Object> map = new LinkedHashMap<>();
                String coachName = s.getCoach() != null ? s.getCoach().getName() : "Gym";
                map.put("description", "Session scheduled: " + s.getSessionType() + " with " + coachName);
                map.put("timestamp", s.getCreatedAt().toString());
                map.put("timeObj", s.getCreatedAt());
                allActivities.add(map);
            }
        });

        // Sort all activities by timeObj descending and limit to 5
        List<Map<String, Object>> activityList = allActivities.stream()
            .sorted((a1, a2) -> ((java.time.LocalDateTime) a2.get("timeObj")).compareTo((java.time.LocalDateTime) a1.get("timeObj")))
            .limit(5)
            .map(a -> {
                a.remove("timeObj");
                return a;
            })
            .collect(Collectors.toList());

        stats.put("totalMembers", totalTrainees);
        stats.put("totalCoaches", totalCoaches);
        stats.put("activeMemberships", activeMemberships);
        stats.put("revenueThisMonth", revenueThisMonth);
        stats.put("todaySessions", todaySessions.size());
        stats.put("systemStatus", "Online");
        stats.put("gymName", gymRepository.findById(gymId).map(g -> g.getName()).orElse("Nebula Fitness"));
        stats.put("expiringMemberships", expiringList);
        stats.put("recentActivity", activityList);

        // AI Recommendations
        stats.put("aiRecommendations", geminiService.generateInsights(stats));

        return stats;
    }

    /**
     * Coach dashboard stats
     */
    public Map<String, Object> getCoachStats(Long coachId) {
        Map<String, Object> stats = new LinkedHashMap<>();

        // My trainees count
        List<CoachTraineeAssignment> assignments = assignmentRepository.findByCoachId(coachId);
        stats.put("myTrainees", assignments.size());

        // Today's sessions
        List<Session> todaySessions = sessionRepository.findByCoachIdAndSessionDate(coachId, LocalDate.now());
        stats.put("todaySessions", todaySessions.size());

        // Total sessions
        long totalSessions = sessionRepository.countByCoachId(coachId);
        stats.put("totalSessions", totalSessions);

        // Upcoming sessions (next 7 days)
        List<Session> upcomingSessions = sessionRepository.findByCoachIdAndSessionDate(coachId, LocalDate.now());
        List<Map<String, Object>> upcomingList = upcomingSessions.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("traineeName", s.getTrainee().getName());
            m.put("sessionDate", s.getSessionDate().toString());
            m.put("startTime", s.getStartTime().toString());
            m.put("endTime", s.getEndTime().toString());
            m.put("status", s.getStatus().name());
            return m;
        }).collect(Collectors.toList());
        stats.put("upcomingSessions", upcomingList);

        // My availability slots count
        List<CoachAvailability> availability = availabilityRepository.findByCoachId(coachId);
        stats.put("availabilitySlots", availability.size());

        return stats;
    }

    /**
     * Trainee dashboard stats
     */
    public Map<String, Object> getTraineeStats(Long traineeId) {
        Map<String, Object> stats = new LinkedHashMap<>();

        // Upcoming sessions
        List<Session> upcomingSessions = sessionRepository
                .findByTraineeIdAndSessionDateGreaterThanEqual(traineeId, LocalDate.now());
        stats.put("upcomingSessions", upcomingSessions.size());

        // My coach
        List<CoachTraineeAssignment> assignments = assignmentRepository.findByTraineeId(traineeId);
        if (!assignments.isEmpty()) {
            User coach = assignments.get(0).getCoach();
            stats.put("coachName", coach.getName());
            stats.put("coachId", coach.getId());
        } else {
            stats.put("coachName", "Not Assigned");
            stats.put("coachId", null);
        }

        // Membership status
        Optional<TraineeMembership> membership = membershipRepository
                .findTopByTraineeIdOrderByCreatedAtDesc(traineeId);
        if (membership.isPresent()) {
            TraineeMembership m = membership.get();
            stats.put("membershipStatus", m.getStatus() != null ? m.getStatus().name() : "UNKNOWN");
            stats.put("membershipPlan", m.getMembershipPlan() != null ? m.getMembershipPlan().getName() : "None");
            stats.put("membershipEndDate", m.getEndDate() != null ? m.getEndDate().toString() : "N/A");
        } else {
            stats.put("membershipStatus", "None");
            stats.put("membershipPlan", null);
            stats.put("membershipEndDate", null);
        }

        // Upcoming session details
        List<Map<String, Object>> sessionList = upcomingSessions.stream()
                .sorted(Comparator.comparing(Session::getSessionDate))
                .limit(5)
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("coachName", s.getCoach() != null ? s.getCoach().getName() : "Unknown");
                    m.put("sessionDate", s.getSessionDate() != null ? s.getSessionDate().toString() : "N/A");
                    m.put("startTime", s.getStartTime() != null ? s.getStartTime().toString() : "00:00");
                    m.put("endTime", s.getEndTime() != null ? s.getEndTime().toString() : "00:00");
                    m.put("status", s.getStatus() != null ? s.getStatus().name() : "UNKNOWN");
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("upcomingSessionDetails", sessionList);

        return stats;
    }
}

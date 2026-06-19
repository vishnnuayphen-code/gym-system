package com.gymsystem.service;

import com.gymsystem.dto.analytics.SuperAdminAnalyticsDTO.*;
import com.gymsystem.entity.*;
import com.gymsystem.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.HashMap;

@Service
public class SuperAdminAnalyticsService {

    private final GymRepository gymRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final TraineeMembershipRepository traineeMembershipRepository;

    public SuperAdminAnalyticsService(GymRepository gymRepository, UserRepository userRepository,
                                      PaymentRepository paymentRepository, SessionRepository sessionRepository,
                                      AttendanceRepository attendanceRepository, TraineeMembershipRepository traineeMembershipRepository) {
        this.gymRepository = gymRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.sessionRepository = sessionRepository;
        this.attendanceRepository = attendanceRepository;
        this.traineeMembershipRepository = traineeMembershipRepository;
    }

    public DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate) {
        long totalGyms = gymRepository.count();
        long totalMembers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_TRAINEE"))
                .count();
        long totalCoaches = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_COACH"))
                .count();
        
        List<Session> sessions = sessionRepository.findAll();
        long totalSessionsThisMonth = sessions.stream()
                .filter(s -> startDate == null || !s.getSessionDate().isBefore(startDate))
                .filter(s -> endDate == null || !s.getSessionDate().isAfter(endDate))
                .count();

        List<Payment> payments = paymentRepository.findAll();
        double totalRevenue = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> startDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isBefore(startDate))
                .filter(p -> endDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isAfter(endDate))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();

        List<Attendance> allAttendance = attendanceRepository.findAll();
        long totalAttendance = allAttendance.stream()
                .filter(a -> startDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isBefore(startDate))
                .filter(a -> endDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isAfter(endDate))
                .count();
        long presentAttendance = allAttendance.stream()
                .filter(a -> startDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isBefore(startDate))
                .filter(a -> endDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isAfter(endDate))
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        double attendanceRate = totalAttendance > 0 ? (double) presentAttendance / totalAttendance * 100.0 : 0.0;
        attendanceRate = Math.round(attendanceRate * 10.0) / 10.0;

        DashboardSummaryResponse res = new DashboardSummaryResponse();
        res.setTotalGyms(totalGyms);
        res.setTotalActiveMembers(totalMembers);
        res.setTotalCoaches(totalCoaches);
        res.setTotalSessionsThisMonth(totalSessionsThisMonth);
        res.setTotalRevenue(totalRevenue);
        res.setActiveMemberships(totalMembers);
        res.setMembershipRenewals(0);
        res.setAttendanceRate(attendanceRate);
        return res;
    }

    public RevenueAnalyticsResponse getRevenueAnalytics(LocalDate startDate, LocalDate endDate) {
        List<Payment> payments = paymentRepository.findAll();
        double totalRevenue = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> startDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isBefore(startDate))
                .filter(p -> endDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isAfter(endDate))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();
                
        List<GymMetric> revenueByGym = new ArrayList<>();
        List<Gym> gyms = gymRepository.findAll();
        for (Gym gym : gyms) {
            double gymRev = payments.stream()
                .filter(p -> p.getGym() != null && p.getGym().getId().equals(gym.getId()))
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> startDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isBefore(startDate))
                .filter(p -> endDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isAfter(endDate))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();
            
            GymMetric gm = new GymMetric();
            gm.setLabel(gym.getName());
            gm.setValue(gymRev);
            revenueByGym.add(gm);
        }

        long daysDiff = startDate != null && endDate != null ? java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) : 30;
        if (daysDiff <= 0) daysDiff = 30;
        LocalDate prevStartDate = (startDate != null ? startDate : LocalDate.now().minusDays(30)).minusDays(daysDiff);
        LocalDate prevEndDate = (startDate != null ? startDate : LocalDate.now().minusDays(30)).minusDays(1);
        
        double prevRevenue = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> p.getPaymentDate() != null && !p.getPaymentDate().isBefore(prevStartDate) && !p.getPaymentDate().isAfter(prevEndDate))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();
        double growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100.0 : (totalRevenue > 0 ? 100.0 : 0.0);

        RevenueAnalyticsResponse res = new RevenueAnalyticsResponse();
        res.setTotalRevenue(totalRevenue);
        res.setRevenueGrowthPercentage(Math.round(growth * 10.0) / 10.0);
        
        double maxRev = -1;
        String topGym = "N/A";
        double minRev = Double.MAX_VALUE;
        String bottomGym = "N/A";
        
        for (GymMetric m : revenueByGym) {
            if (m.getValue() > maxRev) { maxRev = m.getValue(); topGym = m.getLabel(); }
            if (m.getValue() < minRev) { minRev = m.getValue(); bottomGym = m.getLabel(); }
        }
        res.setTopGeneratingGym(topGym);
        res.setLowestGeneratingGym(revenueByGym.isEmpty() ? "N/A" : bottomGym);
        res.setRevenueByGym(revenueByGym);
        
        List<TimeMetric> trend = new ArrayList<>();
        Map<String, Double> grouped = new LinkedHashMap<>();
        
        List<Payment> sortedPayments = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> startDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isBefore(startDate))
                .filter(p -> endDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isAfter(endDate))
                .sorted(java.util.Comparator.comparing(Payment::getPaymentDate, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                .toList();

        if (daysDiff <= 10) {
            for (LocalDate d = startDate != null ? startDate : LocalDate.now().minusDays(7); !d.isAfter(endDate != null ? endDate : LocalDate.now()); d = d.plusDays(1)) {
                String label = d.getMonthValue() + "/" + d.getDayOfMonth();
                grouped.put(label, 0.0);
            }
            for (Payment p : sortedPayments) {
                if (p.getPaymentDate() != null) {
                    String label = p.getPaymentDate().getMonthValue() + "/" + p.getPaymentDate().getDayOfMonth();
                    if (grouped.containsKey(label)) {
                        grouped.put(label, grouped.get(label) + (p.getAmount() != null ? p.getAmount().doubleValue() : 0.0));
                    }
                }
            }
        } else {
            LocalDate startRange = startDate != null ? startDate : LocalDate.now().minusDays(30);
            LocalDate endRange = endDate != null ? endDate : LocalDate.now();
            for (LocalDate d = startRange; !d.isAfter(endRange); d = d.plusMonths(1)) {
                String label = d.getMonth().name().substring(0, 3);
                grouped.put(label, 0.0);
            }
            String endLabel = endRange.getMonth().name().substring(0, 3);
            grouped.put(endLabel, 0.0);

            for (Payment p : sortedPayments) {
                if (p.getPaymentDate() != null) {
                    String label = p.getPaymentDate().getMonth().name().substring(0, 3);
                    grouped.put(label, grouped.getOrDefault(label, 0.0) + (p.getAmount() != null ? p.getAmount().doubleValue() : 0.0));
                }
            }
        }

        for (Map.Entry<String, Double> entry : grouped.entrySet()) {
            TimeMetric tm = new TimeMetric();
            tm.setLabel(entry.getKey());
            tm.setValue(entry.getValue());
            trend.add(tm);
        }
        res.setMonthlyRevenueTrend(trend);
        return res;
    }

    public MemberAnalyticsResponse getMemberAnalytics(LocalDate startDate, LocalDate endDate) {
        List<User> trainees = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_TRAINEE"))
                .toList();
        long active = trainees.stream().filter(u -> u.getIsActive() == null || u.getIsActive()).count();
        long inactive = trainees.size() - active;

        List<GymMetric> registrationsPerGym = new ArrayList<>();
        for (Gym gym : gymRepository.findAll()) {
            long count = trainees.stream()
                .filter(u -> u.getGym() != null && u.getGym().getId().equals(gym.getId()))
                .count();
            GymMetric gm = new GymMetric();
            gm.setLabel(gym.getName());
            gm.setValue(count);
            registrationsPerGym.add(gm);
        }
        
        List<TraineeMembership> memberships = traineeMembershipRepository.findAll();
        long newRegs = trainees.stream()
                .filter(t -> t.getCreatedAt() != null)
                .filter(t -> startDate == null || !t.getCreatedAt().toLocalDate().isBefore(startDate))
                .filter(t -> endDate == null || !t.getCreatedAt().toLocalDate().isAfter(endDate))
                .count();

        long renewals = memberships.stream()
                .filter(m -> m.getStartDate() != null && (startDate == null || !m.getStartDate().isBefore(startDate)) && (endDate == null || !m.getStartDate().isAfter(endDate)))
                .count();
        long expirations = memberships.stream()
                .filter(m -> m.getEndDate() != null && (startDate == null || !m.getEndDate().isBefore(startDate)) && (endDate == null || !m.getEndDate().isAfter(endDate)))
                .filter(m -> m.getStatus() == MembershipStatus.EXPIRED || m.getEndDate().isBefore(LocalDate.now()))
                .count();

        MemberAnalyticsResponse res = new MemberAnalyticsResponse();
        res.setTotalMembers(trainees.size());
        res.setActiveMembers(active);
        res.setInactiveMembers(inactive);
        res.setNewRegistrations(newRegs);
        res.setMembershipRenewals(renewals);
        res.setMembershipExpirations(expirations);
        
        List<TimeMetric> growthTrend = new ArrayList<>();
        Map<String, Long> traineeGrouped = new LinkedHashMap<>();
        
        long daysBetween = startDate != null && endDate != null ? java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) : 30;
        if (daysBetween <= 10) {
            for (LocalDate d = startDate != null ? startDate : LocalDate.now().minusDays(7); !d.isAfter(endDate != null ? endDate : LocalDate.now()); d = d.plusDays(1)) {
                String label = d.getMonthValue() + "/" + d.getDayOfMonth();
                traineeGrouped.put(label, 0L);
            }
            for (User t : trainees) {
                if (t.getCreatedAt() != null) {
                    String label = t.getCreatedAt().getMonthValue() + "/" + t.getCreatedAt().getDayOfMonth();
                    if (traineeGrouped.containsKey(label)) {
                        traineeGrouped.put(label, traineeGrouped.get(label) + 1);
                    }
                }
            }
        } else {
            LocalDate startRange = startDate != null ? startDate : LocalDate.now().minusDays(30);
            LocalDate endRange = endDate != null ? endDate : LocalDate.now();
            for (LocalDate d = startRange; !d.isAfter(endRange); d = d.plusMonths(1)) {
                String label = d.getMonth().name().substring(0, 3);
                traineeGrouped.put(label, 0L);
            }
            String endLabel = endRange.getMonth().name().substring(0, 3);
            traineeGrouped.put(endLabel, 0L);

            for (User t : trainees) {
                if (t.getCreatedAt() != null) {
                    String label = t.getCreatedAt().getMonth().name().substring(0, 3);
                    traineeGrouped.put(label, traineeGrouped.getOrDefault(label, 0L) + 1);
                }
            }
        }
        for (Map.Entry<String, Long> entry : traineeGrouped.entrySet()) {
            TimeMetric tm = new TimeMetric();
            tm.setLabel(entry.getKey());
            tm.setValue(entry.getValue());
            growthTrend.add(tm);
        }
        res.setMemberGrowthTrend(growthTrend);
        res.setRegistrationsPerGym(registrationsPerGym);
        
        return res;
    }

    public AttendanceAnalyticsResponse getAttendanceAnalytics(LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findAll();
        List<Attendance> filteredAttendances = attendances.stream()
                .filter(a -> startDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isBefore(startDate))
                .filter(a -> endDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isAfter(endDate))
                .toList();
                
        long totalPresent = filteredAttendances.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long totalRecords = filteredAttendances.size();
        double avgPct = totalRecords > 0 ? (double) totalPresent / totalRecords * 100.0 : 0.0;

        Map<LocalDate, Long> attendanceByDate = new HashMap<>();
        for (Attendance a : filteredAttendances) {
            if (a.getStatus() == AttendanceStatus.PRESENT && a.getAttendanceDate() != null) {
                attendanceByDate.put(a.getAttendanceDate(), attendanceByDate.getOrDefault(a.getAttendanceDate(), 0L) + 1);
            }
        }
        double avgDaily = attendanceByDate.values().stream().mapToLong(Long::longValue).average().orElse(0.0);

        AttendanceAnalyticsResponse res = new AttendanceAnalyticsResponse();
        res.setDailyAttendance((int) Math.round(avgDaily));
        res.setWeeklyAttendance((int) Math.round(avgDaily * 7));
        res.setMonthlyAttendance((int) Math.round(avgDaily * 30));
        res.setAverageAttendancePercentage(Math.round(avgPct * 10.0) / 10.0);
        
        List<GymMetric> attByGym = new ArrayList<>();
        List<Gym> gyms = gymRepository.findAll();
        for (Gym gym : gyms) {
            List<Attendance> gymAtts = filteredAttendances.stream()
                    .filter(a -> a.getTrainee() != null && a.getTrainee().getGym() != null && a.getTrainee().getGym().getId().equals(gym.getId()))
                    .toList();
            long gymRecords = gymAtts.size();
            long gymPresent = gymAtts.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
            double pct = gymRecords > 0 ? (double) gymPresent / gymRecords * 100.0 : 0.0;
            
            GymMetric gm = new GymMetric();
            gm.setLabel(gym.getName());
            gm.setValue(Math.round(pct * 10.0) / 10.0);
            attByGym.add(gm);
        }
        res.setAttendanceByGym(attByGym);
        
        List<TimeMetric> attTrend = new ArrayList<>();
        Map<String, Long> attGrouped = new LinkedHashMap<>();
        
        long daysBetween = startDate != null && endDate != null ? java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) : 30;
        if (daysBetween <= 10) {
            for (LocalDate d = startDate != null ? startDate : LocalDate.now().minusDays(7); !d.isAfter(endDate != null ? endDate : LocalDate.now()); d = d.plusDays(1)) {
                String label = d.getMonthValue() + "/" + d.getDayOfMonth();
                attGrouped.put(label, 0L);
            }
            for (Attendance a : filteredAttendances) {
                if (a.getStatus() == AttendanceStatus.PRESENT && a.getAttendanceDate() != null) {
                    String label = a.getAttendanceDate().getMonthValue() + "/" + a.getAttendanceDate().getDayOfMonth();
                    if (attGrouped.containsKey(label)) {
                        attGrouped.put(label, attGrouped.get(label) + 1);
                    }
                }
            }
        } else {
            LocalDate startRange = startDate != null ? startDate : LocalDate.now().minusDays(30);
            LocalDate endRange = endDate != null ? endDate : LocalDate.now();
            for (LocalDate d = startRange; !d.isAfter(endRange); d = d.plusMonths(1)) {
                String label = d.getMonth().name().substring(0, 3);
                attGrouped.put(label, 0L);
            }
            String endLabel = endRange.getMonth().name().substring(0, 3);
            attGrouped.put(endLabel, 0L);

            for (Attendance a : filteredAttendances) {
                if (a.getStatus() == AttendanceStatus.PRESENT && a.getAttendanceDate() != null) {
                    String label = a.getAttendanceDate().getMonth().name().substring(0, 3);
                    attGrouped.put(label, attGrouped.getOrDefault(label, 0L) + 1);
                }
            }
        }
        for (Map.Entry<String, Long> entry : attGrouped.entrySet()) {
            TimeMetric tm = new TimeMetric();
            tm.setLabel(entry.getKey());
            tm.setValue(entry.getValue());
            attTrend.add(tm);
        }
        res.setAttendanceTrend(attTrend);
        
        return res;
    }

    public CoachAnalyticsResponse getCoachAnalytics(LocalDate startDate, LocalDate endDate) {
        long totalCoaches = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_COACH"))
                .count();
        List<Session> allSessions = sessionRepository.findAll();
        List<Session> periodSessions = allSessions.stream()
                .filter(s -> startDate == null || s.getSessionDate() == null || !s.getSessionDate().isBefore(startDate))
                .filter(s -> endDate == null || s.getSessionDate() == null || !s.getSessionDate().isAfter(endDate))
                .toList();

        long sessionsConducted = periodSessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                .count();

        long days = startDate != null && endDate != null ? java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) : 30;
        if (days <= 0) days = 30;
        double maxPossibleSessions = totalCoaches * days * 4.0;
        double utilization = maxPossibleSessions > 0 ? (sessionsConducted / maxPossibleSessions) * 100.0 : 0.0;
        if (utilization > 100.0) utilization = 100.0;

        CoachAnalyticsResponse res = new CoachAnalyticsResponse();
        res.setTotalCoaches(totalCoaches);
        res.setActiveCoaches(totalCoaches);
        res.setSessionsConducted(sessionsConducted);
        res.setCoachUtilizationPercentage(Math.round(utilization * 10.0) / 10.0);
        
        List<GymMetric> sessionsByCoach = new ArrayList<>();
        List<User> coachesList = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_COACH"))
                .toList();
        for (User coach : coachesList) {
            long count = periodSessions.stream()
                    .filter(s -> s.getCoach() != null && s.getCoach().getId().equals(coach.getId()))
                    .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                    .count();
            GymMetric gm = new GymMetric();
            gm.setLabel(coach.getName());
            gm.setValue(count);
            sessionsByCoach.add(gm);
        }
        res.setSessionsConductedByCoach(sessionsByCoach);
        
        return res;
    }

    public SessionAnalyticsResponse getSessionAnalytics(LocalDate startDate, LocalDate endDate) {
        List<Session> sessions = sessionRepository.findAll();
        List<Session> periodSessions = sessions.stream()
                .filter(s -> startDate == null || s.getSessionDate() == null || !s.getSessionDate().isBefore(startDate))
                .filter(s -> endDate == null || s.getSessionDate() == null || !s.getSessionDate().isAfter(endDate))
                .toList();
        
        long total = periodSessions.size();
        long completed = periodSessions.stream().filter(s -> s.getStatus() == SessionStatus.COMPLETED).count();
        long pending = periodSessions.stream().filter(s -> s.getStatus() == SessionStatus.PENDING).count();
        long cancelled = periodSessions.stream().filter(s -> s.getStatus() == SessionStatus.CANCELLED).count();
        long rejected = periodSessions.stream().filter(s -> s.getStatus() == SessionStatus.REJECTED).count();

        SessionAnalyticsResponse res = new SessionAnalyticsResponse();
        res.setTotalSessionsBooked(total);
        res.setCompletedSessions(completed);
        res.setPendingSessions(pending);
        res.setCancelledSessions(cancelled);
        res.setRejectedSessions(rejected);
        res.setSessionCompletionRate(total > 0 ? ((double) completed / total * 100.0) : 0.0);
        
        List<GymMetric> sessionVolByGym = new ArrayList<>();
        List<Gym> gyms = gymRepository.findAll();
        for (Gym gym : gyms) {
            long count = periodSessions.stream()
                    .filter(s -> s.getGym() != null && s.getGym().getId().equals(gym.getId()))
                    .count();
            GymMetric gm = new GymMetric();
            gm.setLabel(gym.getName());
            gm.setValue(count);
            sessionVolByGym.add(gm);
        }
        res.setSessionVolumeByGym(sessionVolByGym);

        List<TimeMetric> sessionTrends = new ArrayList<>();
        Map<String, Long> trendGrouped = new LinkedHashMap<>();
        long daysBetween = startDate != null && endDate != null ? java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) : 30;
        if (daysBetween <= 10) {
            for (LocalDate d = startDate != null ? startDate : LocalDate.now().minusDays(7); !d.isAfter(endDate != null ? endDate : LocalDate.now()); d = d.plusDays(1)) {
                String label = d.getMonthValue() + "/" + d.getDayOfMonth();
                trendGrouped.put(label, 0L);
            }
            for (Session s : periodSessions) {
                if (s.getSessionDate() != null) {
                    String label = s.getSessionDate().getMonthValue() + "/" + s.getSessionDate().getDayOfMonth();
                    if (trendGrouped.containsKey(label)) {
                        trendGrouped.put(label, trendGrouped.get(label) + 1);
                    }
                }
            }
        } else {
            LocalDate startRange = startDate != null ? startDate : LocalDate.now().minusDays(30);
            LocalDate endRange = endDate != null ? endDate : LocalDate.now();
            for (LocalDate d = startRange; !d.isAfter(endRange); d = d.plusMonths(1)) {
                String label = d.getMonth().name().substring(0, 3);
                trendGrouped.put(label, 0L);
            }
            String endLabel = endRange.getMonth().name().substring(0, 3);
            trendGrouped.put(endLabel, 0L);

            for (Session s : periodSessions) {
                if (s.getSessionDate() != null) {
                    String label = s.getSessionDate().getMonth().name().substring(0, 3);
                    trendGrouped.put(label, trendGrouped.getOrDefault(label, 0L) + 1);
                }
            }
        }
        for (Map.Entry<String, Long> entry : trendGrouped.entrySet()) {
            TimeMetric tm = new TimeMetric();
            tm.setLabel(entry.getKey());
            tm.setValue(entry.getValue());
            sessionTrends.add(tm);
        }
        res.setMonthlySessionTrends(sessionTrends);
        
        return res;
    }

    public List<GymComparisonResponse> getGymComparison(LocalDate startDate, LocalDate endDate) {
        List<GymComparisonResponse> response = new ArrayList<>();
        List<Gym> gyms = gymRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Attendance> attendances = attendanceRepository.findAll();
        List<Session> sessions = sessionRepository.findAll();

        for (Gym gym : gyms) {
            long members = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_TRAINEE") && u.getGym() != null && u.getGym().getId().equals(gym.getId()))
                .count();
            long coaches = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getName().equals("ROLE_COACH") && u.getGym() != null && u.getGym().getId().equals(gym.getId()))
                .count();
            
            double gymRev = payments.stream()
                .filter(p -> p.getGym() != null && p.getGym().getId().equals(gym.getId()))
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> startDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isBefore(startDate))
                .filter(p -> endDate == null || p.getPaymentDate() == null || !p.getPaymentDate().isAfter(endDate))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();

            List<Attendance> gymAtts = attendances.stream()
                .filter(a -> a.getTrainee() != null && a.getTrainee().getGym() != null && a.getTrainee().getGym().getId().equals(gym.getId()))
                .filter(a -> startDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isBefore(startDate))
                .filter(a -> endDate == null || a.getAttendanceDate() == null || !a.getAttendanceDate().isAfter(endDate))
                .toList();
            long totalAttendance = gymAtts.size();
            long presentCount = gymAtts.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
            double attendancePercentage = totalAttendance > 0 ? (double) presentCount / totalAttendance * 100.0 : 0.0;

            long sessionsCount = sessions.stream()
                .filter(s -> s.getGym() != null && s.getGym().getId().equals(gym.getId()))
                .filter(s -> startDate == null || s.getSessionDate() == null || !s.getSessionDate().isBefore(startDate))
                .filter(s -> endDate == null || s.getSessionDate() == null || !s.getSessionDate().isAfter(endDate))
                .count();

            GymComparisonResponse res = new GymComparisonResponse();
            res.setGymId(gym.getId());
            res.setGymName(gym.getName());
            res.setMembers(members);
            res.setCoaches(coaches);
            res.setRevenue(Math.round(gymRev * 100.0) / 100.0);
            res.setAttendancePercentage(Math.round(attendancePercentage * 10.0) / 10.0);
            res.setSessions(sessionsCount);
            response.add(res);
        }
        return response;
    }
}

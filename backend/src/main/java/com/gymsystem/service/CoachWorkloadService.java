package com.gymsystem.service;

import com.gymsystem.dto.CoachWorkloadResponse;
import com.gymsystem.entity.*;
import com.gymsystem.enums.WorkloadLevel;
import com.gymsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoachWorkloadService {

    @Autowired
    private CoachProfileRepository coachProfileRepository;

    @Autowired
    private CoachTraineeAssignmentRepository assignmentRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TraineeMembershipRepository membershipRepository;
    
    @Autowired
    private TraineeProfileRepository traineeProfileRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(CoachWorkloadService.class);

    @Transactional(readOnly = true)
    public List<CoachWorkloadResponse> getAllCoachWorkloads(Long gymId) {
        logger.info("[CoachWorkloadService] Fetching workloads for gymId: {}", gymId);
        List<CoachProfile> coaches = coachProfileRepository.findByUser_GymId(gymId);
        
        if (coaches == null) {
            logger.warn("[CoachWorkloadService] coachProfileRepository returned NULL for gymId: {}", gymId);
            return new ArrayList<>();
        }
        
        logger.info("[CoachWorkloadService] Found {} coaches for gymId: {}", coaches.size(), gymId);
        
        LocalDate today = LocalDate.now();

        return coaches.stream()
            .map(coach -> {
                try {
                    return buildWorkloadResponse(coach, today);
                } catch (Exception e) {
                    logger.error("[CoachWorkloadService] Error building workload for coach {}: {}", coach.getUser().getName(), e.getMessage(), e);
                    // Return a partial response if one fails
                    CoachWorkloadResponse fallback = new CoachWorkloadResponse();
                    fallback.setCoachId(coach.getUser().getId());
                    fallback.setCoachName(coach.getUser().getName());
                    fallback.setWorkloadLevel("UNASSIGNED");
                    fallback.setAssignedTrainees(new ArrayList<>());
                    return fallback;
                }
            })
            .sorted(Comparator.comparingInt(CoachWorkloadResponse::getTraineeCount).reversed())
            .collect(Collectors.toList());
    }

    private CoachWorkloadResponse buildWorkloadResponse(CoachProfile coach, LocalDate today) {
        CoachWorkloadResponse res = new CoachWorkloadResponse();

        User coachUser = coach.getUser();
        res.setCoachId(coachUser.getId());
        res.setCoachName(coachUser.getName());
        res.setCoachPhotoUrl(coach.getProfilePhotoUrl());
        res.setSpecialization(coach.getSpecialization());
        
        if (coach.getEmploymentType() != null)
            res.setEmploymentType(coach.getEmploymentType().name());
        if (coach.getSessionType() != null)
            res.setSessionType(coach.getSessionType().name());

        // Get assigned trainees via CoachTraineeAssignment
        List<CoachTraineeAssignment> assignments = assignmentRepository.findByCoachId(coachUser.getId());
        res.setTraineeCount(assignments.size());

        // Count only PERSONAL_TRAINING members and build summaries
        List<CoachWorkloadResponse.AssignedTraineeSummary> summaries = new ArrayList<>();
        int personalCount = 0;

        for (CoachTraineeAssignment assignment : assignments) {
            User traineeUser = assignment.getTrainee();
            TraineeProfile traineeProfile = traineeProfileRepository.findByUser_Id(traineeUser.getId()).orElse(null);
            
            if (traineeProfile != null && traineeProfile.getTrainingType() == TrainingType.PERSONAL_TRAINING) {
                personalCount++;
            }

            CoachWorkloadResponse.AssignedTraineeSummary s = new CoachWorkloadResponse.AssignedTraineeSummary();
            s.setTraineeId(traineeUser.getId());
            s.setTraineeName(traineeUser.getName());
            s.setTraineePhotoUrl(traineeProfile != null ? traineeProfile.getProfilePhotoUrl() : null);

            if (traineeProfile != null && traineeProfile.getPreferredTime() != null)
                s.setPreferredTime(traineeProfile.getPreferredTime().name());

            // Get membership status
            membershipRepository.findTopByTraineeIdOrderByEndDateDesc(traineeUser.getId())
                .ifPresentOrElse(
                    m -> {
                        LocalDate end = m.getEndDate();
                        if (end.isBefore(today))
                            s.setMembershipStatus("EXPIRED");
                        else if (!end.isAfter(today.plusDays(7)))
                            s.setMembershipStatus("EXPIRING");
                        else
                            s.setMembershipStatus("ACTIVE");
                    },
                    () -> s.setMembershipStatus("NO_PLAN")
                );

            // Count upcoming sessions for this trainee with this coach
            int traineeUpcoming = sessionRepository
                .countByCoachIdAndTraineeIdAndSessionDateGreaterThanEqualAndStatusNot(
                    coachUser.getId(), traineeUser.getId(), today, SessionStatus.CANCELLED
                );
            s.setUpcomingSessions(traineeUpcoming);
            summaries.add(s);
        }

        res.setPersonalTraineeCount(personalCount);
        res.setAssignedTrainees(summaries);

        // Upcoming sessions for this coach
        int upcomingSessions = sessionRepository
            .countByCoachIdAndSessionDateGreaterThanEqualAndStatusNot(
                coachUser.getId(), today, SessionStatus.CANCELLED
            );
        res.setUpcomingSessionCount(upcomingSessions);

        // Compute workload level
        res.setWorkloadLevel(computeWorkloadLevel(assignments.size()).name());

        return res;
    }

    private WorkloadLevel computeWorkloadLevel(int count) {
        if (count == 0) return WorkloadLevel.UNASSIGNED;
        if (count <= 3) return WorkloadLevel.LOW;
        if (count <= 6) return WorkloadLevel.MEDIUM;
        if (count <= 9) return WorkloadLevel.HIGH;
        return WorkloadLevel.OVERLOADED;
    }
}

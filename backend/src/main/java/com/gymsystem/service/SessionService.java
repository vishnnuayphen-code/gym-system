package com.gymsystem.service;

import com.gymsystem.dto.CreateAvailabilityRequest;
import com.gymsystem.dto.CreateSessionRequest;
import com.gymsystem.dto.UpdateSessionRequest;
import com.gymsystem.dto.AcceptSessionRequest;
import com.gymsystem.entity.*;
import com.gymsystem.exception.*;
import com.gymsystem.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SessionService {
    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    private final SessionRepository sessionRepository;
    private final CoachAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final CoachTraineeAssignmentRepository assignmentRepository;
    private final TraineeMembershipRepository membershipRepository;
    private final MachineRepository machineRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final TraineeProfileRepository traineeProfileRepository;

    public SessionService(SessionRepository sessionRepository,
                          CoachAvailabilityRepository availabilityRepository,
                          UserRepository userRepository,
                          GymRepository gymRepository,
                          CoachTraineeAssignmentRepository assignmentRepository,
                          TraineeMembershipRepository membershipRepository,
                          MachineRepository machineRepository,
                          WorkoutPlanRepository workoutPlanRepository,
                          TraineeProfileRepository traineeProfileRepository) {
        this.sessionRepository = sessionRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.assignmentRepository = assignmentRepository;
        this.membershipRepository = membershipRepository;
        this.machineRepository = machineRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.traineeProfileRepository = traineeProfileRepository;
    }

    public Session createSession(CreateSessionRequest request, Long gymId) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gym not found"));

        User trainee = userRepository.findById(request.getTraineeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainee not found"));

        TraineeProfile traineeProfile = traineeProfileRepository.findByUser_Id(trainee.getId()).orElse(null);
        boolean isPersonalTraining = traineeProfile != null && traineeProfile.getTrainingType() == TrainingType.PERSONAL_TRAINING;

        User coach = null;
        if (request.getCoachId() != null) {
            coach = userRepository.findById(request.getCoachId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));
        }

        // 1. Verify trainee assignment if personal training
        if (isPersonalTraining) {
            if (coach == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coach is required for personal training");
            }
            if (!assignmentRepository.existsByCoachIdAndTraineeId(coach.getId(), trainee.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Trainee is not assigned to this coach");
            }
        }

        // 2. Verify trainee membership is ACTIVE
        checkMembershipActive(trainee.getId());

        // 3. Verify session date is future
        if (request.getSessionDate().isBefore(LocalDate.now())) {
            throw new InvalidSessionTimeException("Session date must be in the future");
        }

        // 4. Validate start < end
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new InvalidSessionTimeException("Start time must be before end time");
        }

        // 5. Check coach availability & conflict if coach is present
        if (coach != null) {
            checkCoachAvailability(coach.getId(), request.getSessionDate(), request.getStartTime(), request.getEndTime());
            checkSessionConflict(coach.getId(), request.getSessionDate(), request.getStartTime(), request.getEndTime());
        }

        Session session = new Session();
        session.setGym(gym);
        session.setCoach(coach);
        session.setTrainee(trainee);
        session.setSessionDate(request.getSessionDate());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setSessionType(request.getSessionType());
        
        // If it's personal training and has a coach, it starts as PENDING for coach acceptance
        if (request.getSessionType() == SessionType.PERSONAL_TRAINING && coach != null) {
            session.setStatus(SessionStatus.PENDING);
        } else {
            session.setStatus(SessionStatus.ACCEPTED);
        }
        
        session.setSessionNotes(request.getSessionNotes());
        session.setActualStartTime(request.getActualStartTime());
        session.setActualEndTime(request.getActualEndTime());
        session.setSessionLocation(request.getSessionLocation());
        session.setTraineeRating(request.getTraineeRating());
        session.setEstimatedCaloriesBurned(request.getEstimatedCaloriesBurned());
        session.setRecordingUrl(request.getRecordingUrl());

        return sessionRepository.save(session);
    }

    public List<Session> getCoachSessions(Long coachId) {
        return sessionRepository.findByCoachId(coachId);
    }

    public List<Session> getAllSessions(Long gymId) {
        return sessionRepository.findByGymId(gymId);
    }

    public List<Session> getTraineeSessions(Long traineeId) {
        return sessionRepository.findByTraineeId(traineeId);
    }

    public Session updateSession(Long sessionId, UpdateSessionRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (request.getSessionDate() != null) {
            if (request.getSessionDate().isBefore(LocalDate.now())) {
                throw new InvalidSessionTimeException("Session date must be in the future");
            }
            session.setSessionDate(request.getSessionDate());
        }
        
        if (request.getStartTime() != null && request.getEndTime() != null) {
            checkCoachAvailability(session.getCoach().getId(), session.getSessionDate(), request.getStartTime(), request.getEndTime());
            
            // Exclude current session from conflict check
            List<Session> existingSessions = sessionRepository.findByCoachIdAndSessionDate(session.getCoach().getId(), session.getSessionDate());
            for (Session existing : existingSessions) {
                if (!existing.getId().equals(sessionId) && 
                    request.getStartTime().isBefore(existing.getEndTime()) && 
                    request.getEndTime().isAfter(existing.getStartTime())) {
                    throw new SessionConflictException("Session time conflicts with another session");
                }
            }
            session.setStartTime(request.getStartTime());
            session.setEndTime(request.getEndTime());
        }

        if (request.getSessionType() != null) session.setSessionType(request.getSessionType());
        if (request.getStatus() != null) session.setStatus(request.getStatus());
        if (request.getActualStartTime() != null) session.setActualStartTime(request.getActualStartTime());
        if (request.getActualEndTime() != null) session.setActualEndTime(request.getActualEndTime());
        if (request.getSessionLocation() != null) session.setSessionLocation(request.getSessionLocation());
        if (request.getSessionNotes() != null) session.setSessionNotes(request.getSessionNotes());
        if (request.getTraineeRating() != null) session.setTraineeRating(request.getTraineeRating());
        if (request.getEstimatedCaloriesBurned() != null) session.setEstimatedCaloriesBurned(request.getEstimatedCaloriesBurned());
        if (request.getRecordingUrl() != null) session.setRecordingUrl(request.getRecordingUrl());

        return sessionRepository.save(session);
    }

    public void cancelSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);
    }

    public Session acceptSession(Long sessionId, Long coachId, AcceptSessionRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        
        if (!session.getCoach().getId().equals(coachId)) {
            logger.warn("Access Denied: Coach ID mismatch. Session Coach ID: {}, Trying Coach ID: {}", 
                        session.getCoach().getId(), coachId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned coach can accept this session");
        }
        
        if (session.getStatus() != SessionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session is not in PENDING status");
        }

        // Link Workout Plan if provided
        if (request.getWorkoutPlanId() != null) {
            WorkoutPlan plan = workoutPlanRepository.findById(request.getWorkoutPlanId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout Plan not found"));
            session.setWorkoutPlan(plan);
        }

        // Link Machine and check availability if provided
        if (request.getMachineId() != null) {
            Machine machine = machineRepository.findById(request.getMachineId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Machine not found"));
            
            // Check if machine is already booked for another session at the same time
            checkMachineAvailability(machine.getId(), session.getSessionDate(), session.getStartTime(), session.getEndTime(), sessionId);
            
            session.setMachine(machine);
        }
        
        session.setStatus(SessionStatus.ACCEPTED);
        return sessionRepository.save(session);
    }

    public Session rejectSession(Long sessionId, Long coachId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        
        if (!session.getCoach().getId().equals(coachId)) {
            logger.warn("Access Denied: Coach ID mismatch. Session Coach ID: {}, Trying Coach ID: {}", 
                        session.getCoach().getId(), coachId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned coach can reject this session");
        }
        
        if (session.getStatus() != SessionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session is not in PENDING status");
        }

        session.setStatus(SessionStatus.REJECTED);
        return sessionRepository.save(session);
    }

    public Session bookMachine(Long sessionId, Long machineId, Long userId, String role) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Machine not found"));

        if (session.getSessionType() == SessionType.PERSONAL_TRAINING) {
            // For personal sessions, only the coach can book after acceptance
            if (!"COACH".equals(role) || !session.getCoach().getId().equals(userId)) {
                logger.warn("Access Denied: Machine booking unauthorized. Role: {}, Session Coach ID: {}, User ID: {}", 
                            role, session.getCoach().getId(), userId);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the coach can book machines for personal sessions");
            }
            if (session.getStatus() != SessionStatus.ACCEPTED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coach must accept the session before booking a machine");
            }
        } else {
            // For other sessions, the trainee books
            if (!"TRAINEE".equals(role) || !session.getTrainee().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the trainee can book machines for regular sessions");
            }
        }

        // Authoritative Conflict Check: Ensure machine is not already booked for this slot
        checkMachineAvailability(machine.getId(), session.getSessionDate(), session.getStartTime(), session.getEndTime(), sessionId);

        session.setMachine(machine);
        return sessionRepository.save(session);
    }

    public List<CoachAvailability> createAvailability(CreateAvailabilityRequest request) {
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        String recurrenceType = request.getRecurrenceType() != null ? request.getRecurrenceType() : "NONE";
        String groupId = UUID.randomUUID().toString();

        List<CoachAvailability> slots = new ArrayList<>();

        // If frontend sends a list of specific dates, use them directly
        if (request.getSpecificDates() != null && !request.getSpecificDates().isEmpty()) {
            for (LocalDate date : request.getSpecificDates()) {
                CoachAvailability availability = new CoachAvailability();
                availability.setCoach(coach);
                availability.setDayOfWeek(date.getDayOfWeek());
                availability.setSpecificDate(date);
                availability.setStartTime(request.getStartTime());
                availability.setEndTime(request.getEndTime());
                availability.setRecurrenceType(recurrenceType.toUpperCase());
                availability.setRecurrenceGroupId(groupId);
                availability.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
                slots.add(availability);
            }
        } else {
            // Single slot fallback
            CoachAvailability availability = new CoachAvailability();
            availability.setCoach(coach);
            availability.setSpecificDate(request.getSpecificDate());
            availability.setStartTime(request.getStartTime());
            availability.setEndTime(request.getEndTime());
            availability.setRecurrenceType("NONE");
            availability.setRecurrenceGroupId(groupId);
            availability.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);

            if (request.getSpecificDate() != null) {
                availability.setDayOfWeek(request.getSpecificDate().getDayOfWeek());
            } else if (request.getDayOfWeek() != null) {
                availability.setDayOfWeek(request.getDayOfWeek());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either specificDate or dayOfWeek is required");
            }

            slots.add(availability);
        }

        return availabilityRepository.saveAll(slots);
    }

    public List<CoachAvailability> getCoachAvailability(Long coachId) {
        return availabilityRepository.findByCoachId(coachId);
    }

    public void deleteAvailability(Long id) {
        if (!availabilityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found");
        }
        availabilityRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAvailabilityGroup(String groupId) {
        List<CoachAvailability> group = availabilityRepository.findByRecurrenceGroupId(groupId);
        if (group.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No availability group found");
        }
        availabilityRepository.deleteByRecurrenceGroupId(groupId);
    }

    private void checkMembershipActive(Long traineeId) {
        TraineeMembership membership = membershipRepository.findTopByTraineeIdOrderByCreatedAtDesc(traineeId)
                .orElseThrow(() -> new MembershipInactiveException("Trainee has no record of membership"));
        
        if (membership.getStatus() != MembershipStatus.ACTIVE || membership.getEndDate().isBefore(LocalDate.now())) {
            throw new MembershipInactiveException("Trainee membership is not active or has expired");
        }
    }

    private void checkCoachAvailability(Long coachId, LocalDate date, LocalTime start, LocalTime end) {
        List<CoachAvailability> availabilities = availabilityRepository.findByCoachId(coachId);
        
        // 1. Check for specific date overrides
        boolean hasOverride = false;
        boolean overrideAllows = false;
        
        for (CoachAvailability a : availabilities) {
            if (a.getSpecificDate() != null && a.getSpecificDate().equals(date)) {
                hasOverride = true;
                if (!a.getIsAvailable()) {
                    overrideAllows = false;
                    break;
                } else if (!start.isBefore(a.getStartTime()) && !end.isAfter(a.getEndTime())) {
                    overrideAllows = true;
                }
            }
        }
        
        if (hasOverride) {
            if (!overrideAllows) {
                throw new CoachUnavailableException("Coach is not available during this time on " + date);
            }
            return;
        }
        
        // 2. Fallback to weekly recurring rules
        boolean available = availabilities.stream()
                .filter(a -> a.getSpecificDate() == null && a.getDayOfWeek() == date.getDayOfWeek() && a.getIsAvailable())
                .anyMatch(a -> !start.isBefore(a.getStartTime()) && !end.isAfter(a.getEndTime()));
        
        if (!available) {
            throw new CoachUnavailableException("Coach is not available during this time on " + date.getDayOfWeek());
        }
    }

    private void checkSessionConflict(Long coachId, LocalDate date, LocalTime start, LocalTime end) {
        List<Session> existingSessions = sessionRepository.findByCoachIdAndSessionDate(coachId, date);
        boolean conflict = existingSessions.stream()
                .anyMatch(s -> s.getStatus() != SessionStatus.CANCELLED && 
                               start.isBefore(s.getEndTime()) && 
                               end.isAfter(s.getStartTime()));
        
        if (conflict) {
            throw new SessionConflictException("Session time conflicts with another session");
        }
    }

    private void checkMachineAvailability(Long machineId, LocalDate date, LocalTime start, LocalTime end, Long excludeSessionId) {
        List<Session> machineSessions = sessionRepository.findByMachineIdAndSessionDate(machineId, date);
        boolean conflict = machineSessions.stream()
                .anyMatch(s -> !s.getId().equals(excludeSessionId) &&
                               s.getStatus() != SessionStatus.CANCELLED && 
                               s.getStatus() != SessionStatus.MISSED &&
                               start.isBefore(s.getEndTime()) && 
                               end.isAfter(s.getStartTime()));
        
        if (conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Machine is already booked for another session at this time");
        }
    }
}

package com.gymsystem.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.gymsystem.dto.TraineeResponse;
import com.gymsystem.dto.CoachResponse;
import com.gymsystem.entity.CoachProfile;
import com.gymsystem.entity.CoachTraineeAssignment;
import com.gymsystem.entity.TraineeMembership;
import com.gymsystem.repository.CoachProfileRepository;
import com.gymsystem.repository.TraineeMembershipRepository;
import com.gymsystem.repository.CoachTraineeAssignmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gymsystem.dto.CreateTraineeRequest;
import com.gymsystem.dto.UpdateTraineeRequest;
import com.gymsystem.entity.Gym;
import com.gymsystem.entity.Role;
import com.gymsystem.entity.TraineeProfile;
import com.gymsystem.entity.TrainingType;
import com.gymsystem.entity.PreferredTime;
import com.gymsystem.entity.User;
import com.gymsystem.repository.GymRepository;
import com.gymsystem.repository.RoleRepository;
import com.gymsystem.repository.TraineeProfileRepository;
import com.gymsystem.repository.UserRepository;

@Service
public class TraineeService {

    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final RoleRepository roleRepository;
    private final TraineeProfileRepository traineeProfileRepository;
    private final TraineeMembershipRepository membershipRepository;
    private final CoachTraineeAssignmentRepository assignmentRepository;
    private final CoachProfileRepository coachProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public TraineeService(UserRepository userRepository, GymRepository gymRepository,
                        RoleRepository roleRepository, TraineeProfileRepository traineeProfileRepository,
                        TraineeMembershipRepository membershipRepository,
                        CoachTraineeAssignmentRepository assignmentRepository,
                        CoachProfileRepository coachProfileRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.roleRepository = roleRepository;
        this.traineeProfileRepository = traineeProfileRepository;
        this.membershipRepository = membershipRepository;
        this.assignmentRepository = assignmentRepository;
        this.coachProfileRepository = coachProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TraineeResponse createTrainee(CreateTraineeRequest request, Long gymId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gym not found"));

        Role traineeRole = roleRepository.findByName("TRAINEE")
                .orElseGet(() -> roleRepository.save(new Role("TRAINEE")));

        User traineeUser = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                traineeRole,
                gym
        );
        traineeUser = userRepository.save(traineeUser);

        TraineeProfile profile = new TraineeProfile(
                traineeUser,
                request.getHeight(),
                request.getWeight(),
                request.getFitnessGoal(),
                request.getProfilePhotoUrl()
        );
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setBloodGroup(request.getBloodGroup());
        profile.setEmergencyContactName(request.getEmergencyContactName());
        profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        profile.setMedicalConditions(request.getMedicalConditions());
        profile.setReferralSource(request.getReferralSource());
        
        // Convert empty string to null to avoid unique constraint violation on qr_code_id
        if (request.getQrCodeId() != null && request.getQrCodeId().trim().isEmpty()) {
            profile.setQrCodeId(null);
        } else {
            profile.setQrCodeId(request.getQrCodeId());
        }
        
        profile.setPhone(request.getPhone());
        
        if (request.getTrainingType() != null) {
            profile.setTrainingType(TrainingType.valueOf(request.getTrainingType()));
        }
        if (request.getPreferredTime() != null) {
            profile.setPreferredTime(PreferredTime.valueOf(request.getPreferredTime()));
        }
        
        traineeProfileRepository.save(profile);
        
        return getTraineeById(traineeUser.getId());
    }

    @Transactional(readOnly = true)
    public List<TraineeResponse> getTraineesByGym(Long gymId) {
        List<TraineeProfile> profiles = traineeProfileRepository.findByUser_GymId(gymId);
        return profiles.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TraineeResponse getTraineeById(Long traineeId) {
        TraineeProfile profile = traineeProfileRepository.findByUser_Id(traineeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainee not found"));
        return toResponse(profile);
    }

    @Transactional
    public TraineeResponse updateTrainee(Long traineeId, UpdateTraineeRequest request) {
        TraineeProfile profile = traineeProfileRepository.findByUser_Id(traineeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainee not found"));

        User user = profile.getUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
            userRepository.save(user);
        }
        if (request.getHeight() != null) {
            profile.setHeight(request.getHeight());
        }
        if (request.getWeight() != null) {
            profile.setWeight(request.getWeight());
        }
        if (request.getFitnessGoal() != null) {
            profile.setFitnessGoal(request.getFitnessGoal());
        }
        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getBloodGroup() != null) {
            profile.setBloodGroup(request.getBloodGroup());
        }
        if (request.getEmergencyContactName() != null) {
            profile.setEmergencyContactName(request.getEmergencyContactName());
        }
        if (request.getEmergencyContactPhone() != null) {
            profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        }
        if (request.getMedicalConditions() != null) {
            profile.setMedicalConditions(request.getMedicalConditions());
        }
        if (request.getReferralSource() != null) {
            profile.setReferralSource(request.getReferralSource());
        }
        if (request.getQrCodeId() != null) {
            if (request.getQrCodeId().trim().isEmpty()) {
                profile.setQrCodeId(null);
            } else {
                profile.setQrCodeId(request.getQrCodeId());
            }
        }
        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getTrainingType() != null) {
            profile.setTrainingType(TrainingType.valueOf(request.getTrainingType()));
        }
        if (request.getPreferredTime() != null) {
            profile.setPreferredTime(PreferredTime.valueOf(request.getPreferredTime()));
        }

        traineeProfileRepository.save(profile);

        return getTraineeById(traineeId);
    }

    private TraineeResponse toResponse(TraineeProfile profile) {
        TraineeResponse res = new TraineeResponse();
        User user = profile.getUser();
        
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setPhone(profile.getPhone());
        res.setHeight(profile.getHeight());
        res.setWeight(profile.getWeight());
        if (profile.getDateOfBirth() != null) {
            res.setDateOfBirth(profile.getDateOfBirth().toString());
        }
        if (profile.getGender() != null) {
            res.setGender(profile.getGender().name());
        }
        res.setBloodGroup(profile.getBloodGroup());
        if (profile.getFitnessGoal() != null) {
            res.setFitnessGoal(profile.getFitnessGoal().name());
        }
        res.setEmergencyContactName(profile.getEmergencyContactName());
        res.setEmergencyContactPhone(profile.getEmergencyContactPhone());
        res.setMedicalConditions(profile.getMedicalConditions());
        res.setReferralSource(profile.getReferralSource());
        res.setQrCodeId(profile.getQrCodeId());
        res.setProfilePhotoUrl(profile.getProfilePhotoUrl());

        if (profile.getTrainingType() != null) {
            res.setTrainingType(profile.getTrainingType().name());
        }
        if (profile.getPreferredTime() != null) {
            res.setPreferredTime(profile.getPreferredTime().name());
        }

        // Membership status calculation
        Optional<TraineeMembership> latestMembership = membershipRepository
                .findTopByTraineeIdOrderByEndDateDesc(user.getId());

        if (latestMembership.isEmpty()) {
            res.setMembershipStatus("NO_PLAN");
        } else {
            TraineeMembership m = latestMembership.get();
            LocalDate endDate = m.getEndDate();
            LocalDate today = LocalDate.now();

            String status;
            if (endDate.isBefore(today)) {
                status = "EXPIRED";
            } else if (!endDate.isAfter(today.plusDays(7))) {
                status = "EXPIRING";
            } else {
                status = "ACTIVE";
            }

            res.setMembershipStatus(status);
            res.setMembershipEndDate(endDate.toString());
            res.setDaysUntilExpiry((int) ChronoUnit.DAYS.between(today, endDate));
            res.setLatestMembershipId(m.getId());
        }

        // Assigned coach population
        List<CoachTraineeAssignment> assignments = assignmentRepository.findByTraineeId(user.getId());
        if (!assignments.isEmpty()) {
            User coachUser = assignments.get(0).getCoach();
            if (coachUser != null) {
                Optional<CoachProfile> coachProfileOpt = coachProfileRepository.findByUserId(coachUser.getId());
                if (coachProfileOpt.isPresent()) {
                    CoachProfile cp = coachProfileOpt.get();
                    CoachResponse cr = new CoachResponse();
                    cr.setId(coachUser.getId());
                    cr.setName(coachUser.getName());
                    cr.setSpecialization(cp.getSpecialization());
                    cr.setProfilePhotoUrl(cp.getProfilePhotoUrl());
                    res.setAssignedCoach(cr);
                }
            }
        }

        return res;
    }
}

package com.gymsystem.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gymsystem.dto.AssignTraineeRequest;
import com.gymsystem.dto.CoachResponse;
import com.gymsystem.dto.CreateCoachRequest;
import com.gymsystem.dto.TraineeResponse;
import com.gymsystem.dto.UpdateCoachRequest;
import com.gymsystem.entity.CoachProfile;
import com.gymsystem.entity.CoachTraineeAssignment;
import com.gymsystem.entity.Gym;
import com.gymsystem.entity.Role;
import com.gymsystem.entity.User;
import com.gymsystem.entity.EmploymentType;
import com.gymsystem.entity.CoachSessionType;
import com.gymsystem.entity.TrainingType;
import com.gymsystem.repository.CoachProfileRepository;
import com.gymsystem.repository.CoachTraineeAssignmentRepository;
import com.gymsystem.repository.GymRepository;
import com.gymsystem.repository.RoleRepository;
import com.gymsystem.repository.UserRepository;
import com.gymsystem.repository.TraineeProfileRepository;
import com.gymsystem.entity.TraineeProfile;

@Service
public class CoachService {

    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final RoleRepository roleRepository;
    private final CoachProfileRepository coachProfileRepository;
    private final CoachTraineeAssignmentRepository assignmentRepository;
    private final TraineeProfileRepository traineeProfileRepository;
    private final TraineeService traineeService;
    private final PasswordEncoder passwordEncoder;

    public CoachService(UserRepository userRepository, GymRepository gymRepository,
                        RoleRepository roleRepository, CoachProfileRepository coachProfileRepository,
                        CoachTraineeAssignmentRepository assignmentRepository, 
                        TraineeProfileRepository traineeProfileRepository,
                        TraineeService traineeService,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.roleRepository = roleRepository;
        this.coachProfileRepository = coachProfileRepository;
        this.assignmentRepository = assignmentRepository;
        this.traineeProfileRepository = traineeProfileRepository;
        this.traineeService = traineeService;
        this.passwordEncoder = passwordEncoder;
    }

    public CoachResponse createCoach(CreateCoachRequest request, Long gymId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gym not found"));

        Role coachRole = roleRepository.findByName("COACH")
                .orElseGet(() -> roleRepository.save(new Role("COACH")));

        User coachUser = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                coachRole,
                gym
        );
        coachUser = userRepository.save(coachUser);

        CoachProfile profile = new CoachProfile(
                coachUser,
                request.getSpecialization(),
                request.getExperienceYears(),
                request.getCertificationName()
        );
        profile.setCertificationExpiryDate(request.getCertificationExpiryDate());
        profile.setAverageRating(request.getAverageRating());
        profile.setMaxTraineeCapacity(request.getMaxTraineeCapacity());
        profile.setLanguagesSpoken(request.getLanguagesSpoken());
        profile.setBio(request.getBio());
        profile.setSalaryType(request.getSalaryType());
        profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        profile.setPhone(request.getPhone());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());

        if (request.getEmploymentType() != null) {
            profile.setEmploymentType(EmploymentType.valueOf(request.getEmploymentType()));
        }
        if (request.getSessionType() != null) {
            profile.setSessionType(CoachSessionType.valueOf(request.getSessionType()));
        }

        coachProfileRepository.save(profile);

        return toResponse(profile);
    }

    public List<CoachResponse> getCoachesByGym(Long gymId) {
        List<CoachProfile> profiles = coachProfileRepository.findByUser_GymId(gymId);
        return profiles.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CoachResponse getCoachDetails(Long id, Long gymId) {
        User coachUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        if (!coachUser.getGym().getId().equals(gymId) || !coachUser.getRole().getName().equals("COACH")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid coach");
        }
        
        CoachProfile profile = coachProfileRepository.findByUserId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach profile not found"));
        
        return toResponse(profile);
    }

    public CoachResponse updateCoach(Long coachId, UpdateCoachRequest request) {
        User coachUser = userRepository.findById(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            coachUser.setName(request.getName());
            userRepository.save(coachUser);
        }

        CoachProfile profile = coachProfileRepository.findByUserId(coachId)
                .orElseGet(() -> {
                    CoachProfile newProfile = new CoachProfile(coachUser, null, null, null);
                    return newProfile;
                });

        if (request.getSpecialization() != null) profile.setSpecialization(request.getSpecialization());
        if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
        if (request.getCertificationName() != null) profile.setCertificationName(request.getCertificationName());
        if (request.getCertificationExpiryDate() != null) profile.setCertificationExpiryDate(request.getCertificationExpiryDate());
        if (request.getAverageRating() != null) profile.setAverageRating(request.getAverageRating());
        if (request.getMaxTraineeCapacity() != null) profile.setMaxTraineeCapacity(request.getMaxTraineeCapacity());
        if (request.getLanguagesSpoken() != null) profile.setLanguagesSpoken(request.getLanguagesSpoken());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getSalaryType() != null) profile.setSalaryType(request.getSalaryType());
        if (request.getProfilePhotoUrl() != null) profile.setProfilePhotoUrl(request.getProfilePhotoUrl());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        
        if (request.getEmploymentType() != null) {
            profile.setEmploymentType(EmploymentType.valueOf(request.getEmploymentType()));
        }
        if (request.getSessionType() != null) {
            profile.setSessionType(CoachSessionType.valueOf(request.getSessionType()));
        }

        coachProfileRepository.save(profile);

        return toResponse(profile);
    }
    public Map<String, Object> assignTrainee(AssignTraineeRequest request, Long gymId) {
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        User trainee = userRepository.findById(request.getTraineeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainee not found"));

        if (!coach.getGym().getId().equals(gymId) || !trainee.getGym().getId().equals(gymId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Both users must belong to your gym");
        }

        if (!coach.getRole().getName().equals("COACH")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User assigned as coach is not a coach");
        }

        if (!trainee.getRole().getName().equals("TRAINEE")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User assigned as trainee is not a trainee");
        }

        if (assignmentRepository.existsByCoachIdAndTraineeId(coach.getId(), trainee.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainee is already assigned to this coach");
        }

        TraineeProfile traineeProfile = traineeProfileRepository.findByUser_Id(trainee.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainee profile not found"));

        if (traineeProfile.getTrainingType() != TrainingType.PERSONAL_TRAINING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trainee must be in PERSONAL_TRAINING to be assigned to a coach");
        }

        CoachTraineeAssignment assignment = new CoachTraineeAssignment(coach, trainee);
        assignmentRepository.save(assignment);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trainee assigned successfully");
        return response;
    }

    public List<TraineeResponse> getCoachTrainees(Long coachId, Long gymId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        if (!coach.getGym().getId().equals(gymId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Coach does not belong to your gym");
        }

        List<CoachTraineeAssignment> assignments = assignmentRepository.findByCoachId(coachId);
        return assignments.stream().map(assignment -> {
            User trainee = assignment.getTrainee();
            
            return traineeService.getTraineeById(trainee.getId());
        }).collect(Collectors.toList());
    }

    private CoachResponse toResponse(CoachProfile profile) {
        CoachResponse res = new CoachResponse();
        res.setId(profile.getUser().getId());
        res.setName(profile.getUser().getName());
        res.setEmail(profile.getUser().getEmail());
        res.setPhone(profile.getPhone());
        res.setGender(profile.getGender());
        res.setDateOfBirth(profile.getDateOfBirth());
        res.setSpecialization(profile.getSpecialization());
        res.setExperienceYears(profile.getExperienceYears());
        res.setCertificationName(profile.getCertificationName());
        res.setCertificationExpiryDate(profile.getCertificationExpiryDate());
        res.setAverageRating(profile.getAverageRating());
        res.setMaxTraineeCapacity(profile.getMaxTraineeCapacity());
        res.setLanguagesSpoken(profile.getLanguagesSpoken());
        res.setBio(profile.getBio());
        res.setSalaryType(profile.getSalaryType());
        res.setProfilePhotoUrl(profile.getProfilePhotoUrl());

        if (profile.getEmploymentType() != null) {
            res.setEmploymentType(profile.getEmploymentType().name());
        }
        if (profile.getSessionType() != null) {
            res.setSessionType(profile.getSessionType().name());
        }

        res.setTraineeCount(assignmentRepository.findByCoachId(profile.getUser().getId()).size());

        return res;
    }
}

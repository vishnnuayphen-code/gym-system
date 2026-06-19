package com.gymsystem.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

import com.gymsystem.dto.AssignTraineeRequest;
import com.gymsystem.dto.CoachResponse;
import com.gymsystem.dto.CreateCoachRequest;
import com.gymsystem.dto.UpdateCoachRequest;
import com.gymsystem.service.CoachService;
import com.gymsystem.service.CoachWorkloadService;
import com.gymsystem.dto.CoachWorkloadResponse;
import com.gymsystem.dto.TraineeResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/coaches")
public class CoachController {

    private static final Logger logger = LoggerFactory.getLogger(CoachController.class);
    private final CoachService coachService;
    private final CoachWorkloadService coachWorkloadService;

    public CoachController(CoachService coachService, CoachWorkloadService coachWorkloadService) {
        this.coachService = coachService;
        this.coachWorkloadService = coachWorkloadService;
    }

    private Long getGymIdFromRequest(HttpServletRequest request) {
        return (Long) request.getAttribute("gymId");
    }

    @GetMapping("/workload")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<CoachWorkloadResponse>> getWorkloadOverview(HttpServletRequest request) {
        Long gymId = getGymIdFromRequest(request);
        logger.info("[CoachController] GET /workload for gymId: {}", gymId);
        List<CoachWorkloadResponse> workload = coachWorkloadService.getAllCoachWorkloads(gymId);
        logger.info("[CoachController] Returning {} workload records", workload.size());
        return ResponseEntity.ok(workload);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER', 'COACH')")
    public ResponseEntity<CoachResponse> getMyProfile(
            Principal principal,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(coachService.getCoachDetails(Long.valueOf(principal.getName()), getGymIdFromRequest(request)));
    }

    @GetMapping("/me/trainees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER', 'COACH')")
    public ResponseEntity<List<TraineeResponse>> getMyTrainees(
            Principal principal,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(coachService.getCoachTrainees(Long.valueOf(principal.getName()), getGymIdFromRequest(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('create_coach', 'view_trainees') or hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER', 'TRAINEE')")
    public ResponseEntity<List<CoachResponse>> getCoaches(HttpServletRequest request) {
        Long gymId = getGymIdFromRequest(request);
        return ResponseEntity.ok(coachService.getCoachesByGym(gymId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER', 'COACH')")
    public ResponseEntity<CoachResponse> getCoachDetails(
            @PathVariable("id") Long id,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(coachService.getCoachDetails(id, getGymIdFromRequest(request)));
    }

    @GetMapping("/{coachId}/trainees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER', 'COACH')")
    public ResponseEntity<List<TraineeResponse>> getCoachTrainees(
            @PathVariable("coachId") Long coachId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(coachService.getCoachTrainees(coachId, getGymIdFromRequest(request)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('create_coach') or hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<CoachResponse> createCoach(
            @Valid @RequestBody CreateCoachRequest createCoachRequest,
            HttpServletRequest request
    ) {
        Long gymId = getGymIdFromRequest(request);
        CoachResponse response = coachService.createCoach(createCoachRequest, gymId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER', 'COACH')")
    public ResponseEntity<CoachResponse> updateMyProfile(
            Principal principal,
            @RequestBody UpdateCoachRequest body
    ) {
        return ResponseEntity.ok(coachService.updateCoach(Long.valueOf(principal.getName()), body));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<CoachResponse> updateCoach(
            @PathVariable("id") Long id,
            @RequestBody UpdateCoachRequest body
    ) {
        return ResponseEntity.ok(coachService.updateCoach(id, body));
    }

    @PostMapping("/assign-trainee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, Object>> assignTrainee(
            @Valid @RequestBody AssignTraineeRequest assignTraineeRequest,
            HttpServletRequest request
    ) {
        Long gymId = getGymIdFromRequest(request);
        Map<String, Object> response = coachService.assignTrainee(assignTraineeRequest, gymId);
        return ResponseEntity.ok(response);
    }
}

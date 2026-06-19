package com.gymsystem.controller;

import java.util.List;
import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymsystem.dto.CreateTraineeRequest;
import com.gymsystem.dto.UpdateTraineeRequest;
import com.gymsystem.dto.TraineeResponse;
import com.gymsystem.service.TraineeService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/trainees")
public class TraineeController {

    private final TraineeService traineeService;

    public TraineeController(TraineeService traineeService) {
        this.traineeService = traineeService;
    }

    private Long getGymIdFromRequest(HttpServletRequest request) {
        Object gymIdObj = request.getAttribute("gymId");
        if (gymIdObj == null) return null;
        if (gymIdObj instanceof Integer i) return i.longValue();
        if (gymIdObj instanceof Long l) return l;
        return Long.valueOf(gymIdObj.toString());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('create_trainee') or hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<TraineeResponse> createTrainee(
            @Valid @RequestBody CreateTraineeRequest createTraineeRequest,
            HttpServletRequest request
    ) {
        Long gymId = getGymIdFromRequest(request);
        TraineeResponse response = traineeService.createTrainee(createTraineeRequest, gymId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyAuthority('create_trainee', 'view_trainees') or hasAnyRole('OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<List<TraineeResponse>> getTrainees(HttpServletRequest request) {
        Long gymId = getGymIdFromRequest(request);
        return ResponseEntity.ok(traineeService.getTraineesByGym(gymId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<TraineeResponse> getMyProfile(Principal principal) {
        return ResponseEntity.ok(traineeService.getTraineeById(Long.valueOf(principal.getName())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<TraineeResponse> updateMyProfile(
            Principal principal,
            @RequestBody UpdateTraineeRequest updateTraineeRequest
    ) {
        return ResponseEntity.ok(traineeService.updateTrainee(Long.valueOf(principal.getName()), updateTraineeRequest));
    }

    @GetMapping("/{traineeId}")
    @PreAuthorize("hasAnyAuthority('create_trainee', 'view_trainees') or hasAnyRole('OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<TraineeResponse> getTrainee(@PathVariable("traineeId") Long traineeId) {
        return ResponseEntity.ok(traineeService.getTraineeById(traineeId));
    }

    @PutMapping("/{traineeId}")
    @PreAuthorize("hasAnyAuthority('create_trainee') or hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<TraineeResponse> updateTrainee(
            @PathVariable("traineeId") Long traineeId,
            @RequestBody UpdateTraineeRequest updateTraineeRequest
    ) {
        return ResponseEntity.ok(traineeService.updateTrainee(traineeId, updateTraineeRequest));
    }
}

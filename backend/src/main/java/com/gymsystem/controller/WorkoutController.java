package com.gymsystem.controller;

import com.gymsystem.dto.*;
import com.gymsystem.service.WorkoutService;
import com.gymsystem.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkoutController {

    @Autowired
    private WorkoutService workoutService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/workout-plans")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<WorkoutPlanResponse>> listWorkoutPlans(
            @RequestHeader("Authorization") String token) {
        String role = jwtUtil.extractRole(token.substring(7));
        Long userId = jwtUtil.extractUserId(token.substring(7));
        
        if ("ADMIN".equals(role) || "OWNER".equals(role)) {
            return ResponseEntity.ok(workoutService.getAllPlans());
        } else {
            return ResponseEntity.ok(workoutService.getCoachPlans(userId));
        }
    }

    @PostMapping("/workout-plans")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<WorkoutPlanResponse> createWorkoutPlan(
            @RequestHeader("Authorization") String token,
            @RequestBody CreateWorkoutPlanRequest request) {
        Long coachId = jwtUtil.extractUserId(token.substring(7));
        return ResponseEntity.ok(workoutService.createWorkoutPlan(coachId, request));
    }

    @GetMapping("/workout-plans/trainee/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'TRAINEE', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<WorkoutPlanResponse>> getTraineePlans(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        String role = jwtUtil.extractRole(token.substring(7));
        Long userId = jwtUtil.extractUserId(token.substring(7));
        
        // Ownership check for Trainee
        if ("TRAINEE".equals(role) && !userId.equals(id)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(workoutService.getTraineePlans(id));
    }

    @GetMapping("/workout-plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'TRAINEE', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<WorkoutPlanResponse> getPlanById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        WorkoutPlanResponse plan = workoutService.getPlanById(id);
        String role = jwtUtil.extractRole(token.substring(7));
        Long userId = jwtUtil.extractUserId(token.substring(7));
        
        // Ownership check
        if ("TRAINEE".equals(role) && !userId.equals(plan.traineeId())) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/workout-plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<WorkoutPlanResponse> updateWorkoutPlan(
            @PathVariable Long id,
            @RequestBody UpdateWorkoutPlanRequest request) {
        return ResponseEntity.ok(workoutService.updateWorkoutPlan(id, request));
    }

    @DeleteMapping("/workout-plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<Void> deleteWorkoutPlan(@PathVariable Long id) {
        workoutService.deleteWorkoutPlan(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/workout-plans/{id}/days")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<WorkoutPlanResponse> addWorkoutDay(
            @PathVariable Long id,
            @RequestBody WorkoutDayRequest request) {
        return ResponseEntity.ok(workoutService.addWorkoutDay(id, request));
    }

    @PostMapping("/workout-days/{id}/exercises")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'COACH', 'ADMIN', 'OWNER')")
    public ResponseEntity<WorkoutPlanResponse> addExerciseToDay(
            @PathVariable Long id,
            @RequestBody ExerciseRequest request) {
        return ResponseEntity.ok(workoutService.addExerciseToDay(id, request));
    }
}

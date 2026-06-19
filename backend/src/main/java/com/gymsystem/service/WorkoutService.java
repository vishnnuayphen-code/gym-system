package com.gymsystem.service;

import com.gymsystem.dto.*;
import com.gymsystem.entity.*;
import com.gymsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    @Autowired
    private WorkoutPlanRepository workoutPlanRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoachTraineeAssignmentRepository assignmentRepository;

    @Transactional
    public WorkoutPlanResponse createWorkoutPlan(Long coachId, CreateWorkoutPlanRequest request) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        User trainee = userRepository.findById(request.traineeId())
                .orElseThrow(() -> new RuntimeException("Trainee not found"));

        // Validate assignment
        if (!assignmentRepository.existsByCoachIdAndTraineeId(coachId, request.traineeId())) {
            throw new RuntimeException("Trainee is not assigned to this coach");
        }

        WorkoutPlan plan = new WorkoutPlan();
        plan.setTitle(request.title());
        plan.setDescription(request.description() != null ? request.description() : "Quick prescribed protocol");
        plan.setCoach(coach);
        plan.setTrainee(trainee);
        
        // Provide clinical defaults for quick creation
        plan.setStartDate(request.startDate() != null ? request.startDate() : java.time.LocalDate.now());
        plan.setEndDate(request.endDate() != null ? request.endDate() : java.time.LocalDate.now().plusMonths(1));
        
        plan.setStatus(WorkoutPlanStatus.ACTIVE);

        if (request.workoutDays() != null) {
            for (WorkoutDayRequest dayReq : request.workoutDays()) {
                WorkoutDay day = new WorkoutDay();
                day.setDayLabel(dayReq.dayLabel());
                day.setFocusArea(dayReq.focusArea());
                
                if (dayReq.exercises() != null) {
                    for (ExerciseRequest exReq : dayReq.exercises()) {
                        Exercise exercise = new Exercise();
                        exercise.setName(exReq.name());
                        exercise.setSets(exReq.sets());
                        exercise.setReps(exReq.reps());
                        exercise.setRestSeconds(exReq.restSeconds());
                        exercise.setNotes(exReq.notes());
                        exercise.setVideoUrl(exReq.videoUrl());
                        day.addExercise(exercise);
                    }
                }
                plan.addWorkoutDay(day);
            }
        }

        WorkoutPlan saved = workoutPlanRepository.save(plan);
        return convertToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getTraineePlans(Long traineeId) {
        return workoutPlanRepository.findByTraineeId(traineeId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getCoachPlans(Long coachId) {
        return workoutPlanRepository.findByCoachId(coachId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getAllPlans() {
        return workoutPlanRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutPlanResponse getPlanById(Long planId) {
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Workout plan not found"));
        return convertToResponse(plan);
    }

    @Transactional
    public WorkoutPlanResponse updateWorkoutPlan(Long planId, UpdateWorkoutPlanRequest request) {
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Workout plan not found"));
        
        plan.setTitle(request.title());
        plan.setDescription(request.description());
        plan.setStartDate(request.startDate());
        plan.setEndDate(request.endDate());
        plan.setStatus(request.status());

        return convertToResponse(workoutPlanRepository.save(plan));
    }

    @Transactional
    public void deleteWorkoutPlan(Long planId) {
        workoutPlanRepository.deleteById(planId);
    }

    @Transactional
    public WorkoutPlanResponse addWorkoutDay(Long planId, WorkoutDayRequest request) {
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Workout plan not found"));

        WorkoutDay day = new WorkoutDay();
        day.setDayLabel(request.dayLabel());
        day.setFocusArea(request.focusArea());

        if (request.exercises() != null) {
            for (ExerciseRequest exReq : request.exercises()) {
                Exercise exercise = new Exercise();
                exercise.setName(exReq.name());
                exercise.setSets(exReq.sets());
                exercise.setReps(exReq.reps());
                exercise.setRestSeconds(exReq.restSeconds());
                exercise.setNotes(exReq.notes());
                exercise.setVideoUrl(exReq.videoUrl());
                day.addExercise(exercise);
            }
        }
        plan.addWorkoutDay(day);
        return convertToResponse(workoutPlanRepository.save(plan));
    }

    @Transactional
    public WorkoutPlanResponse addExerciseToDay(Long dayId, ExerciseRequest request) {
        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Workout day not found"));

        Exercise exercise = new Exercise();
        exercise.setName(request.name());
        exercise.setSets(request.sets());
        exercise.setReps(request.reps());
        exercise.setRestSeconds(request.restSeconds());
        exercise.setNotes(request.notes());
        exercise.setVideoUrl(request.videoUrl());
        
        day.addExercise(exercise);
        workoutDayRepository.save(day);
        
        return convertToResponse(day.getWorkoutPlan());
    }

    private WorkoutPlanResponse convertToResponse(WorkoutPlan plan) {
        List<WorkoutPlanResponse.WorkoutDayResponse> dayResponses = plan.getWorkoutDays().stream()
                .map(day -> new WorkoutPlanResponse.WorkoutDayResponse(
                        day.getId(),
                        day.getDayLabel(),
                        day.getFocusArea(),
                        day.getExercises().stream()
                                .map(ex -> new WorkoutPlanResponse.ExerciseResponse(
                                        ex.getId(),
                                        ex.getName(),
                                        ex.getSets(),
                                        ex.getReps(),
                                        ex.getRestSeconds(),
                                        ex.getNotes(),
                                        ex.getVideoUrl()
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return new WorkoutPlanResponse(
                plan.getId(),
                plan.getTitle(),
                plan.getDescription(),
                plan.getCoach().getId(),
                plan.getCoach().getName(),
                plan.getTrainee().getId(),
                plan.getTrainee().getName(),
                plan.getStartDate(),
                plan.getEndDate(),
                plan.getStatus(),
                dayResponses
        );
    }
}

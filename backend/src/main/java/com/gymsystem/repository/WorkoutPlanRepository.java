package com.gymsystem.repository;

import com.gymsystem.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByTraineeId(Long traineeId);
    List<WorkoutPlan> findByCoachId(Long coachId);
}

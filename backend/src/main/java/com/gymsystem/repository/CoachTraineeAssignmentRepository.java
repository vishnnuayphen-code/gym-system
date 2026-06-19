package com.gymsystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymsystem.entity.CoachTraineeAssignment;

@Repository
public interface CoachTraineeAssignmentRepository extends JpaRepository<CoachTraineeAssignment, Long> {
    List<CoachTraineeAssignment> findByCoachId(Long coachId);
    boolean existsByCoachIdAndTraineeId(Long coachId, Long traineeId);
    List<CoachTraineeAssignment> findByTraineeId(Long traineeId);
}

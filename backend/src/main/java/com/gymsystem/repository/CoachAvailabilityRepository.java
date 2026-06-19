package com.gymsystem.repository;

import com.gymsystem.entity.CoachAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoachAvailabilityRepository extends JpaRepository<CoachAvailability, Long> {
    List<CoachAvailability> findByCoachId(Long coachId);
    List<CoachAvailability> findByRecurrenceGroupId(String recurrenceGroupId);
    void deleteByRecurrenceGroupId(String recurrenceGroupId);
}

package com.gymsystem.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymsystem.entity.CoachAttendance;
import com.gymsystem.entity.CoachSessionType;

@Repository
public interface CoachAttendanceRepository extends JpaRepository<CoachAttendance, Long> {
    List<CoachAttendance> findByCoachId(Long coachId);
    List<CoachAttendance> findByAttendanceDate(LocalDate date);
    Optional<CoachAttendance> findByCoachIdAndAttendanceDate(Long coachId, LocalDate date);
    Optional<CoachAttendance> findByCoachIdAndAttendanceDateAndSessionAttended(Long coachId, LocalDate date, CoachSessionType session);
}

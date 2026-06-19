package com.gymsystem.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymsystem.entity.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByTraineeIdOrderByAttendanceDateDesc(Long traineeId);
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Attendance a JOIN FETCH a.trainee JOIN FETCH a.markedBy WHERE a.trainee.gym.id = :gymId AND a.attendanceDate = :date")
    List<Attendance> findByTraineeGymIdAndAttendanceDate(@org.springframework.data.repository.query.Param("gymId") Long gymId, @org.springframework.data.repository.query.Param("date") LocalDate date);

    Optional<Attendance> findByTraineeIdAndAttendanceDate(Long traineeId, LocalDate attendanceDate);
}

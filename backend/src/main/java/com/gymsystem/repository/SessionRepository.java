package com.gymsystem.repository;

import com.gymsystem.entity.Session;
import com.gymsystem.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCoachId(Long coachId);
    List<Session> findByTraineeId(Long traineeId);
    List<Session> findBySessionDate(LocalDate sessionDate);
    List<Session> findBySessionDateAndStatus(LocalDate sessionDate, SessionStatus status);
    List<Session> findByCoachIdAndSessionDate(Long coachId, LocalDate sessionDate);
    List<Session> findByGymId(Long gymId);
    List<Session> findByGymIdAndSessionDate(Long gymId, LocalDate sessionDate);
    List<Session> findByTraineeIdAndSessionDateGreaterThanEqual(Long traineeId, LocalDate date);
    long countByCoachId(Long coachId);
    int countByCoachIdAndSessionDateGreaterThanEqualAndStatusNot(Long coachId, LocalDate date, SessionStatus status);
    int countByCoachIdAndTraineeIdAndSessionDateGreaterThanEqualAndStatusNot(Long coachId, Long traineeId, LocalDate date, SessionStatus status);
    List<Session> findByMachineIdAndSessionDate(Long machineId, LocalDate sessionDate);
    List<Session> findTop10ByGymIdOrderByCreatedAtDesc(Long gymId);
}

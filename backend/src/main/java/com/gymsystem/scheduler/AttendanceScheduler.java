package com.gymsystem.scheduler;

import com.gymsystem.entity.Session;
import com.gymsystem.entity.SessionStatus;
import com.gymsystem.repository.SessionRepository;
import com.gymsystem.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class AttendanceScheduler {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Run every minute to check for missed sessions.
     */
    @Scheduled(fixedRate = 60000)
    public void monitorActiveSessions() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Find sessions that are SCHEDULED and should have started more than 15 mins ago
        List<Session> lateSessions = sessionRepository.findBySessionDateAndStatus(today, SessionStatus.SCHEDULED);
        
        for (Session session : lateSessions) {
            if (session.getStartTime().isBefore(now.minusMinutes(15))) {
                // Mark as MISSED and notify coach
                session.setStatus(SessionStatus.CANCELLED); // Or MISSED if added to enum
                sessionRepository.save(session);
                
                if (session.getCoach() != null) {
                    String coachTopic = "coach_" + session.getCoach().getId();
                    notificationService.sendTopicNotification(coachTopic, 
                        "Session Missed", 
                        "Session with " + session.getTrainee().getName() + " was marked as missed.");
                }
            }
        }
    }
}

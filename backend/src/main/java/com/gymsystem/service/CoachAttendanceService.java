package com.gymsystem.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gymsystem.dto.CoachAttendanceRequest;
import com.gymsystem.dto.CoachAttendanceResponse;
import com.gymsystem.dto.CoachAttendanceUpdateRequest;
import com.gymsystem.entity.CoachAttendance;
import com.gymsystem.entity.CoachAttendanceStatus;
import com.gymsystem.entity.CoachProfile;
import com.gymsystem.entity.CoachSessionType;
import com.gymsystem.entity.EmploymentType;
import com.gymsystem.repository.CoachAttendanceRepository;
import com.gymsystem.repository.CoachProfileRepository;

@Service
public class CoachAttendanceService {

    private final CoachAttendanceRepository coachAttendanceRepository;
    private final CoachProfileRepository coachProfileRepository;

    public CoachAttendanceService(CoachAttendanceRepository coachAttendanceRepository,
                                CoachProfileRepository coachProfileRepository) {
        this.coachAttendanceRepository = coachAttendanceRepository;
        this.coachProfileRepository = coachProfileRepository;
    }

    public CoachAttendanceResponse markAttendance(CoachAttendanceRequest request, String markedBy) {
        CoachProfile coach = coachProfileRepository.findByUserId(request.getCoachId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();
        
        CoachAttendance attendance;
        
        if (coach.getEmploymentType() == EmploymentType.SESSION_BASED) {
            if (request.getSessionAttended() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session must be specified for session-based coaches");
            }
            CoachSessionType session = CoachSessionType.valueOf(request.getSessionAttended());
            attendance = coachAttendanceRepository.findByCoachIdAndAttendanceDateAndSessionAttended(
                    coach.getUser().getId(), date, session).orElse(new CoachAttendance());
            attendance.setSessionAttended(session);
        } else {
            attendance = coachAttendanceRepository.findByCoachIdAndAttendanceDate(
                    coach.getUser().getId(), date).orElse(new CoachAttendance());
        }

        attendance.setCoachId(coach.getUser().getId());
        attendance.setAttendanceDate(date);
        attendance.setMarkedBy(markedBy);
        attendance.setNotes(request.getNotes());
        
        if (request.getCheckInTime() != null) {
            attendance.setCheckInTime(LocalTime.parse(request.getCheckInTime()));
        }
        if (request.getCheckOutTime() != null) {
            attendance.setCheckOutTime(LocalTime.parse(request.getCheckOutTime()));
        }

        // Status Logic
        if (request.getStatus() != null) {
            attendance.setStatus(CoachAttendanceStatus.valueOf(request.getStatus()));
        } else {
            attendance.setStatus(CoachAttendanceStatus.PRESENT);
        }

        // Recalculate status for SESSION_BASED if BOTH sessions are required
        if (coach.getEmploymentType() == EmploymentType.SESSION_BASED && coach.getSessionType() == CoachSessionType.BOTH) {
            // Check if OTHER session is already marked PRESENT
            CoachSessionType otherSession = (attendance.getSessionAttended() == CoachSessionType.MORNING) 
                    ? CoachSessionType.EVENING : CoachSessionType.MORNING;
            
            Optional<CoachAttendance> other = coachAttendanceRepository.findByCoachIdAndAttendanceDateAndSessionAttended(
                    coach.getUser().getId(), date, otherSession);
            
            if (other.isPresent() && other.get().getStatus() == CoachAttendanceStatus.PRESENT && attendance.getStatus() == CoachAttendanceStatus.PRESENT) {
                // Both sessions marked present, update both to show final state? 
                // Actually, the status field in the entity represents the status FOR THAT RECORD.
                // We'll manage the logical status in the DTO or a summary.
            }
        }

        coachAttendanceRepository.save(attendance);
        return toResponse(attendance, coach);
    }

    public List<CoachAttendanceResponse> getAttendanceByDate(LocalDate date) {
        return coachAttendanceRepository.findByAttendanceDate(date).stream()
                .map(a -> {
                    CoachProfile coach = coachProfileRepository.findByUserId(a.getCoachId()).orElse(null);
                    return toResponse(a, coach);
                })
                .collect(Collectors.toList());
    }

    public List<CoachAttendanceResponse> getAttendanceByCoach(Long coachId) {
        CoachProfile coach = coachProfileRepository.findByUserId(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));
        
        return coachAttendanceRepository.findByCoachId(coachId).stream()
                .map(a -> toResponse(a, coach))
                .collect(Collectors.toList());
    }

    @Transactional
    public CoachAttendanceResponse update(Long id, CoachAttendanceUpdateRequest request) {
        CoachAttendance record = coachAttendanceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Coach attendance record not found"
            ));

        if (request.getCheckOutTime() != null)
            record.setCheckOutTime(LocalTime.parse(request.getCheckOutTime()));
        if (request.getNotes() != null)
            record.setNotes(request.getNotes());

        return toResponse(coachAttendanceRepository.save(record), 
                         coachProfileRepository.findByUserId(record.getCoachId()).orElse(null));
    }

    @Transactional
    public void delete(Long id) {
        CoachAttendance record = coachAttendanceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Coach attendance record not found"
            ));

        CoachProfile coach = coachProfileRepository.findByUserId(record.getCoachId()).orElse(null);

        // If deleting one session of a BOTH-coach
        // and the other session was PRESENT because of this one,
        // downgrade the other session back to HALF_DAY
        if (coach != null && coach.getEmploymentType() == EmploymentType.SESSION_BASED
            && coach.getSessionType() == CoachSessionType.BOTH
            && record.getStatus() == CoachAttendanceStatus.PRESENT) {

            CoachSessionType deletedSession = record.getSessionAttended();
            CoachSessionType otherSession = deletedSession == CoachSessionType.MORNING
                ? CoachSessionType.EVENING : CoachSessionType.MORNING;

            coachAttendanceRepository
                .findByCoachIdAndAttendanceDateAndSessionAttended(
                    record.getCoachId(),
                    record.getAttendanceDate(),
                    otherSession
                )
                .ifPresent(other -> {
                    other.setStatus(CoachAttendanceStatus.HALF_DAY);
                    coachAttendanceRepository.save(other);
                });
        }

        coachAttendanceRepository.deleteById(id);
    }

    private CoachAttendanceResponse toResponse(CoachAttendance a, CoachProfile coach) {
        CoachAttendanceResponse res = new CoachAttendanceResponse();
        res.setId(a.getId());
        res.setCoachId(a.getCoachId());
        res.setAttendanceDate(a.getAttendanceDate().toString());
        res.setStatus(a.getStatus().name());
        res.setMarkedBy(a.getMarkedBy());
        res.setNotes(a.getNotes());
        
        if (a.getSessionAttended() != null) {
            res.setSessionAttended(a.getSessionAttended().name());
        }
        if (a.getCheckInTime() != null) {
            res.setCheckInTime(a.getCheckInTime().toString());
        }
        if (a.getCheckOutTime() != null) {
            res.setCheckOutTime(a.getCheckOutTime().toString());
        }
        
        if (coach != null) {
            res.setCoachName(coach.getUser().getName());
            res.setCoachPhoto(coach.getProfilePhotoUrl());
        }
        
        return res;
    }
}

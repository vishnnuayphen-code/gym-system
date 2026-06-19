package com.gymsystem.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymsystem.dto.AttendanceDTO;
import com.gymsystem.dto.AttendanceUpdateRequest;
import com.gymsystem.entity.Attendance;
import com.gymsystem.entity.AttendanceStatus;
import com.gymsystem.entity.CheckInMethod;
import com.gymsystem.entity.User;
import com.gymsystem.repository.AttendanceRepository;
import com.gymsystem.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AttendanceDTO markAttendance(
            Long traineeId, 
            Long markedById, 
            LocalDate date, 
            AttendanceStatus status, 
            String notes,
            LocalDateTime checkInTime,
            LocalDateTime checkOutTime,
            CheckInMethod checkInMethod,
            Double temperatureReading,
            Boolean isMaskWorn
    ) {
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found"));
        User markedBy = userRepository.findById(markedById)
                .orElseThrow(() -> new RuntimeException("Marker not found"));

        Optional<Attendance> existing = attendanceRepository.findByTraineeIdAndAttendanceDate(traineeId, date);
        
        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
        } else {
            attendance = new Attendance();
            attendance.setTrainee(trainee);
            attendance.setAttendanceDate(date);
        }

        attendance.setMarkedBy(markedBy);
        attendance.setStatus(status);
        attendance.setNotes(notes);
        
        if (checkInTime != null) attendance.setCheckInTime(checkInTime);
        if (checkOutTime != null) attendance.setCheckOutTime(checkOutTime);
        if (checkInMethod != null) attendance.setCheckInMethod(checkInMethod);
        if (temperatureReading != null) attendance.setTemperatureReading(temperatureReading);
        if (isMaskWorn != null) attendance.setIsMaskWorn(isMaskWorn);

        Attendance saved = attendanceRepository.save(attendance);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getTraineeAttendance(Long traineeId) {
        return attendanceRepository.findByTraineeIdOrderByAttendanceDateDesc(traineeId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceForDateInGym(Long gymId, LocalDate date) {
        if (gymId == null) {
            throw new RuntimeException("Gym ID not found in request");
        }
        return attendanceRepository.findByTraineeGymIdAndAttendanceDate(gymId, date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO update(Long id, AttendanceUpdateRequest request) {
        Attendance record = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Attendance record not found"
            ));

        if (request.getStatus() != null)
            record.setStatus(AttendanceStatus.valueOf(request.getStatus()));
        if (request.getCheckOutTime() != null) {
            LocalTime time = LocalTime.parse(request.getCheckOutTime());
            record.setCheckOutTime(LocalDateTime.of(record.getAttendanceDate(), time));
        }
        if (request.getNotes() != null)
            record.setNotes(request.getNotes());

        return convertToDTO(attendanceRepository.save(record));
    }

    @Transactional
    public void delete(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Attendance record not found"
            );
        }
        attendanceRepository.deleteById(id);
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        return new AttendanceDTO(
            attendance.getId(),
            attendance.getTrainee().getId(),
            attendance.getTrainee().getName(),
            attendance.getTrainee().getEmail(),
            attendance.getMarkedBy().getId(),
            attendance.getMarkedBy().getName(),
            attendance.getAttendanceDate(),
            attendance.getStatus(),
            attendance.getNotes(),
            attendance.getCheckInTime(),
            attendance.getCheckOutTime(),
            attendance.getCheckInMethod(),
            attendance.getTemperatureReading(),
            attendance.getIsMaskWorn()
        );
    }
}
